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

export function cacheKey({ provider = "azure", from, to, text }) {
  return createHash("sha256")
    .update(`${provider}|${from}|${to}|${text}`, "utf8")
    .digest("hex");
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
  const usage = await readJson(usageFile, { version: 1, months: {} });

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
        provider: meta.provider ?? "azure",
        from: meta.from,
        to: meta.to,
        updatedAt: new Date().toISOString()
      };
      dirty = true;
    },

    get size() {
      return Object.keys(store.entries).length;
    },

    /** Track spend per calendar month so the guard rails survive across runs. */
    recordUsage({ characters, requests }) {
      const month = new Date().toISOString().slice(0, 7);
      const bucket = usage.months[month] ?? { characters: 0, requests: 0 };
      bucket.characters += characters;
      bucket.requests += requests;
      usage.months[month] = bucket;
      dirty = true;
      return bucket;
    },

    usageFor(month = new Date().toISOString().slice(0, 7)) {
      return usage.months[month] ?? { characters: 0, requests: 0 };
    },

    async save() {
      if (!enabled || !dirty) return;
      await writeJson(translationsFile, store);
      await writeJson(usageFile, usage);
      dirty = false;
    }
  };
}
