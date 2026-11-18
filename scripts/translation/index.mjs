/**
 * Translation orchestrator: cache + provider + usage guard rails.
 *
 * Every call is deduplicated and cached, so a sync run only sends text that has
 * never been translated before. Guards count *requested* characters and
 * requests per run (and per month) and stop before the budget is exceeded.
 */
import { createAzureTranslator } from "./azure-translator.mjs";
import { cacheKey, createTranslationCache } from "./cache.mjs";
import { translateFields, translateMarkdown } from "./markdown.mjs";

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export async function createTranslationService(options = {}) {
  const env = options.env ?? process.env;
  const enabled = String(env.TRANSLATION_ENABLED ?? "true").toLowerCase() !== "false";
  const provider = (env.TRANSLATION_PROVIDER ?? "azure").toLowerCase();

  if (!enabled || provider === "none") {
    return { enabled: false, async translateArticle(article) { return { ...article, translation: null }; }, async flush() {}, stats: () => ({}) };
  }

  if (provider !== "azure") {
    throw new Error(`Unsupported TRANSLATION_PROVIDER "${provider}". Supported values: azure, none.`);
  }

  const cache = await createTranslationCache({ directory: env.TRANSLATION_CACHE_DIR, enabled: env.TRANSLATION_CACHE_ENABLED !== "false" });

  // Created lazily so a run that is fully cached (or a --check run) works
  // without Azure credentials in the environment.
  let translator;
  function getTranslator() {
    if (!translator) {
      translator = createAzureTranslator({
        key: env.AZURE_TRANSLATOR_KEY,
        region: env.AZURE_TRANSLATOR_REGION,
        endpoint: env.AZURE_TRANSLATOR_ENDPOINT
      });
    }
    return translator;
  }

  const limits = {
    charactersPerRun: number(env.TRANSLATION_MAX_CHARACTERS_PER_BUILD, 100_000),
    requestsPerRun: number(env.TRANSLATION_MAX_REQUESTS_PER_BUILD, 40),
    charactersPerMonth: number(env.TRANSLATION_MAX_CHARACTERS_PER_MONTH, Number.POSITIVE_INFINITY)
  };

  const usage = { characters: 0, requests: 0, cacheHits: 0, segments: 0, skipped: 0 };
  const pending = new Map();

  function guard(nextCharacters, nextRequests) {
    if (usage.characters + nextCharacters > limits.charactersPerRun) {
      throw new Error(
        `Translation character limit reached for this run (${limits.charactersPerRun}). ` +
          "Raise TRANSLATION_MAX_CHARACTERS_PER_BUILD or run the sync again later."
      );
    }
    if (usage.requests + nextRequests > limits.requestsPerRun) {
      throw new Error(
        `Translation request limit reached for this run (${limits.requestsPerRun}). ` +
          "Raise TRANSLATION_MAX_REQUESTS_PER_BUILD or run the sync again later."
      );
    }
    const monthly = cache.usageFor().characters;
    if (monthly + nextCharacters > limits.charactersPerMonth) {
      throw new Error(`Monthly translation budget reached (${limits.charactersPerMonth} characters).`);
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
      guard(characters, 1);

      const translated = await getTranslator().translateMany(
        missing.map((item) => item.text),
        { from, to }
      );

      usage.characters += characters;
      usage.requests += 1;
      usage.segments += missing.length;
      cache.recordUsage({ characters, requests: 1 });

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
    translateArticle,
    translateMany,
    async flush() {
      await cache.save();
    },
    stats: () => ({ ...usage, cacheSize: cache.size, monthly: cache.usageFor() })
  };
}
