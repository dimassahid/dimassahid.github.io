/**
 * Persistent translation cache.
 *
 * Every translated string is stored under a SHA-256 key of
 * `provider|from|to|text`, so re-running a sync only pays for text that is new
 * or was edited. The cache is intentionally committed to the repository: it
 * keeps Cloudflare builds deterministic and cheap.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export function cacheKey({ provider = "apps-script", from, to, text }) {
  return createHash("sha256")
    .update(`${provider}|${from}|${to}|${text}`, "utf8")
    .digest("hex");
}

/** Apps Script resets its quota at midnight Pacific Time, so the daily bucket follows that clock. */
export function pacificDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(date);
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw new Error(`Cannot read translation cache ${file}: ${error.message}`);
  }
}

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, file);
}

export async function createTranslationCache(options = {}) {
  const directory = options.directory ?? process.env.TRANSLATION_CACHE_DIR ?? "src/data/translation-cache";
  const enabled = options.enabled ?? process.env.TRANSLATION_CACHE_ENABLED !== "false";
  const translationsFile = path.join(directory, options.translationsFile ?? "translations.json");
  const usageFile = path.join(directory, options.usageFile ?? "usage.json");

  const store = await readJson(translationsFile, { version: 1, entries: {} });
  store.entries ??= {};
  const usage = await readJson(usageFile, { version: 1, months: {}, days: {} });
  usage.months ??= {};
  usage.days ??= {};

  let dirty = false;

  return {
    enabled,
    directory,

    get(key) {
      if (!enabled) return undefined;
      return store.entries[key]?.text;
    },

    has(key) {
      return enabled && Object.prototype.hasOwnProperty.call(store.entries, key);
    },

    set(key, text, meta = {}) {
      if (!enabled) return;
      const existing = store.entries[key];
      if (existing && existing.text === text) return;
      store.entries[key] = {
        text,
        provider: meta.provider ?? "apps-script",
        from: meta.from,
        to: meta.to,
        updatedAt: new Date().toISOString()
      };
      dirty = true;
    },

    get size() {
      return Object.keys(store.entries).length;
    },

    /**
     * Track spend per calendar month (characters/requests) and per Pacific-Time
     * day (calls, the unit Apps Script actually rate limits) so the guard rails
     * survive across runs.
     */
    recordUsage({ characters = 0, requests = 0, calls = 0 }) {
      const month = new Date().toISOString().slice(0, 7);
      const bucket = usage.months[month] ?? { characters: 0, requests: 0, calls: 0 };
      bucket.characters += characters;
      bucket.requests += requests;
      bucket.calls += calls;
      usage.months[month] = bucket;

      const day = pacificDate();
      const daily = usage.days[day] ?? { characters: 0, requests: 0, calls: 0 };
      daily.characters += characters;
      daily.requests += requests;
      daily.calls += calls;
      usage.days[day] = daily;

      dirty = true;
      return bucket;
    },

    usageFor(month = new Date().toISOString().slice(0, 7)) {
      return usage.months[month] ?? { characters: 0, requests: 0, calls: 0 };
    },

    usageForDay(day = pacificDate()) {
      return usage.days[day] ?? { characters: 0, requests: 0, calls: 0 };
    },

    async save() {
      if (!enabled || !dirty) return;
      await writeJson(translationsFile, store);
      await writeJson(usageFile, usage);
      dirty = false;
    }
  };
}
