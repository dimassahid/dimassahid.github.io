/**
 * Translation orchestrator: cache + provider + usage guard rails.
 *
 * Every call is deduplicated and cached, so a sync run only sends text that has
 * never been translated before. Guards count *requested* characters, HTTP
 * requests and (most importantly) Apps Script translation calls per run and per
 * day, and stop before the Google quota is exceeded.
 */
import { createAppsScriptTranslator } from "./apps-script-translator.mjs";
import { cacheKey, createTranslationCache } from "./cache.mjs";
import { translateFields, translateMarkdown } from "./markdown.mjs";

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** Thrown instead of a generic error so the sync can stop instead of skipping every article. */
export class TranslationBudgetError extends Error {
  constructor(message, { scope = "run" } = {}) {
    super(message);
    this.name = "TranslationBudgetError";
    this.scope = scope;
  }
}

const PROVIDER_ALIASES = {
  "apps-script": "apps-script",
  google: "apps-script",
  none: "none"
};

export async function createTranslationService(options = {}) {
  const env = options.env ?? process.env;
  const enabled = String(env.TRANSLATION_ENABLED ?? "true").toLowerCase() !== "false";
  const requested = String(env.TRANSLATION_PROVIDER ?? "apps-script").toLowerCase();
  const provider = PROVIDER_ALIASES[requested] ?? requested;

  if (!enabled || provider === "none") {
    return { enabled: false, async translateArticle(article) { return { ...article, translation: null }; }, async flush() {}, stats: () => ({}) };
  }

  if (provider !== "apps-script") {
    throw new Error(`Unsupported TRANSLATION_PROVIDER "${provider}". Supported values: apps-script (alias google), none.`);
  }

  const cache = await createTranslationCache({ directory: env.TRANSLATION_CACHE_DIR, enabled: env.TRANSLATION_CACHE_ENABLED !== "false" });

  const maxItems = number(env.TRANSLATION_MAX_ITEMS_PER_REQUEST, 25);
  const maxChars = number(env.TRANSLATION_MAX_CHARS_PER_REQUEST, 8_000);

  // Created lazily so a run that is fully cached (or a --check run) works
  // without the web app URL and token in the environment.
  let translator;
  function getTranslator() {
    if (!translator) {
      translator = createAppsScriptTranslator({
        url: env.APPS_SCRIPT_TRANSLATE_URL,
        token: env.APPS_SCRIPT_TRANSLATE_TOKEN,
        timeoutMs: env.APPS_SCRIPT_TRANSLATE_TIMEOUT_MS,
        maxItems,
        maxChars
      });
    }
    return translator;
  }

  const limits = {
    charactersPerRun: number(env.TRANSLATION_MAX_CHARACTERS_PER_BUILD, 100_000),
    requestsPerRun: number(env.TRANSLATION_MAX_REQUESTS_PER_BUILD, 60),
    callsPerRun: number(env.TRANSLATION_MAX_CALLS_PER_BUILD, 1_200),
    callsPerDay: number(env.TRANSLATION_MAX_CALLS_PER_DAY, 4_500),
    charactersPerMonth: number(env.TRANSLATION_MAX_CHARACTERS_PER_MONTH, Number.POSITIVE_INFINITY)
  };

  const usage = { characters: 0, requests: 0, calls: 0, cacheHits: 0, segments: 0, skipped: 0 };
  const pending = new Map();

  /** Mirror the provider batching so the guard counts translate calls, not segments. */
  function countBatches(texts) {
    let batches = 0;
    let cursor = 0;
    while (cursor < texts.length) {
      let characters = 0;
      const start = cursor;
      while (cursor < texts.length && cursor - start < maxItems) {
        const text = texts[cursor];
        if (text.length > maxChars) {
          throw new Error(`Single segment exceeds ${maxChars} characters; split it manually.`);
        }
        if (cursor > start && characters + text.length > maxChars) break;
        characters += text.length;
        cursor += 1;
      }
      batches += 1;
    }
    return batches;
  }

  function guard({ characters, requests, calls }) {
    if (usage.characters + characters > limits.charactersPerRun) {
      throw new TranslationBudgetError(
        `This run reached its character limit (${limits.charactersPerRun}). ` +
          "Raise TRANSLATION_MAX_CHARACTERS_PER_BUILD or run the sync again later.",
        { scope: "run" }
      );
    }
    if (usage.requests + requests > limits.requestsPerRun) {
      throw new TranslationBudgetError(
        `This run reached its request limit (${limits.requestsPerRun}). ` +
          "Raise TRANSLATION_MAX_REQUESTS_PER_BUILD or run the sync again later.",
        { scope: "run" }
      );
    }
    if (usage.calls + calls > limits.callsPerRun) {
      throw new TranslationBudgetError(
        `This run reached its translate call limit (${limits.callsPerRun}). ` +
          "Raise TRANSLATION_MAX_CALLS_PER_BUILD or run the sync again later.",
        { scope: "run" }
      );
    }
    const today = cache.usageForDay().calls;
    if (today + calls > limits.callsPerDay) {
      throw new TranslationBudgetError(
        `The daily Apps Script quota guard is used up (${today}/${limits.callsPerDay} calls today). ` +
          "Google resets the quota at midnight Pacific Time; progress is cached.",
        { scope: "day" }
      );
    }
    const monthly = cache.usageFor().characters;
    if (monthly + characters > limits.charactersPerMonth) {
      throw new TranslationBudgetError(`Monthly translation budget reached (${limits.charactersPerMonth} characters).`, {
        scope: "month"
      });
    }
  }

  /**
   * Translate with cache. Returns the same number of strings as the input.
   */
  async function translateMany(texts, { from, to }) {
    const results = new Array(texts.length);
    const missing = [];
    const missingIndexes = [];

    texts.forEach((text, index) => {
      if (!text.trim()) {
        results[index] = text;
        return;
      }
      const key = cacheKey({ provider, from, to, text });
      const cached = cache.get(key);
      if (typeof cached === "string") {
        results[index] = cached;
        usage.cacheHits += 1;
        return;
      }
      if (pending.has(key)) {
        pending.get(key).push(index);
        return;
      }
      pending.set(key, [index]);
      missing.push({ key, text });
      missingIndexes.push(index);
    });

    if (missing.length > 0) {
      const characters = missing.reduce((total, item) => total + item.text.length, 0);
      const requests = countBatches(missing.map((item) => item.text));
      // One call per batch is the usual cost; the provider may split a very long
      // segment, and the real count replaces the estimate after the response.
      guard({ characters, requests, calls: requests });

      let calls = 0;
      const translated = await getTranslator().translateMany(
        missing.map((item) => item.text),
        {
          from,
          to,
          onBatch: ({ calls: batchCalls }) => {
            calls += batchCalls;
          }
        }
      );

      usage.characters += characters;
      usage.requests += requests;
      usage.calls += calls;
      usage.segments += missing.length;
      cache.recordUsage({ characters, requests, calls });

      missing.forEach((item, index) => {
        const value = translated[index] ?? item.text;
        cache.set(item.key, value, { provider, from, to });
        results[missingIndexes[index]] = value;
        for (const pendingIndex of pending.get(item.key) ?? []) results[pendingIndex] = value;
        pending.delete(item.key);
      });
    }

    return results;
  }

  /** Translate an article body + frontmatter fields. */
  async function translateArticle(article, { from, to }) {
    const fields = await translateFields(
      { title: article.title, description: article.description },
      translateMany,
      { from, to }
    );

    const body = await translateMarkdown(article.markdown, translateMany, { from, to });

    return {
      title: fields.values.title,
      description: fields.values.description,
      markdown: body.markdown,
      characters: fields.characters + body.characters,
      segments: body.segments
    };
  }

  return {
    enabled: true,
    provider,
    limits,
    translateArticle,
    translateMany,
    async flush() {
      await cache.save();
    },
    stats: () => ({ ...usage, cacheSize: cache.size, monthly: cache.usageFor(), daily: cache.usageForDay() })
  };
}
