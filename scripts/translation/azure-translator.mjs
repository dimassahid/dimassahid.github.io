/**
 * Minimal Azure Translator (v3) client.
 *
 * Docs: https://learn.microsoft.com/azure/ai-services/translator/reference/v3-0-translate
 * Only the Translate operation is used; detection is optional and opt-in.
 */
const MAX_ITEMS = 100;
const MAX_CHARS = 48_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class TranslationError extends Error {}

export function createAzureTranslator(options = {}) {
  const key = options.key ?? process.env.AZURE_TRANSLATOR_KEY;
  const region = options.region ?? process.env.AZURE_TRANSLATOR_REGION;
  const endpoint = (options.endpoint ?? process.env.AZURE_TRANSLATOR_ENDPOINT ?? "https://api.cognitive.microsofttranslator.com").replace(/\/+$/, "");
  const apiVersion = options.apiVersion ?? "3.0";
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const maxRetries = options.maxRetries ?? 3;

  if (!key) throw new TranslationError("AZURE_TRANSLATOR_KEY is not set.");
  if (typeof fetchImpl !== "function") throw new TranslationError("No fetch implementation available (Node 18+ required).");

  const headers = {
    "content-type": "application/json",
    "Ocp-Apim-Subscription-Key": key
  };
  if (region) headers["Ocp-Apim-Subscription-Region"] = region;

  async function request(texts, { from, to }) {
    const url = new URL(`${endpoint}/translate`);
    url.searchParams.set("api-version", apiVersion);
    if (from && from !== "auto") url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("textType", "plain");

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const response = await fetchImpl(url, {
        method: "POST",
        headers,
        body: JSON.stringify(texts.map((Text) => ({ Text })))
      });

      if (response.ok) {
        const payload = await response.json();
        if (!Array.isArray(payload) || payload.length !== texts.length) {
          throw new TranslationError("Unexpected Azure Translator response shape.");
        }
        return payload.map((item) => item?.translations?.[0]?.text ?? "");
      }

      const retryable = response.status === 429 || response.status >= 500;
      const detail = await response.text().catch(() => "");
      lastError = new TranslationError(`Azure Translator ${response.status}: ${detail.slice(0, 300)}`);

      if (!retryable || attempt === maxRetries) break;

      const retryAfter = Number(response.headers.get("retry-after"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt;
      await sleep(Math.min(delay, 15_000));
    }

    throw lastError;
  }

  /**
   * Translate a list of strings, preserving order. Batches to respect the
   * service limits (100 items / 50k characters per request).
   */
  async function translateMany(texts, { from = "id", to = "en" } = {}) {
    const results = new Array(texts.length);
    let cursor = 0;

    while (cursor < texts.length) {
      const batch = [];
      let characters = 0;

      while (cursor < texts.length && batch.length < MAX_ITEMS) {
        const text = texts[cursor];
        if (text.length > MAX_CHARS) {
          throw new TranslationError(`Single segment exceeds ${MAX_CHARS} characters; split it manually.`);
        }
        if (batch.length > 0 && characters + text.length > MAX_CHARS) break;
        batch.push(text);
        characters += text.length;
        cursor += 1;
      }

      const translated = await request(batch, { from, to });
      translated.forEach((value, index) => {
        results[cursor - batch.length + index] = value;
      });
    }

    return results;
  }

  return { translateMany, endpoint, region: region ?? "" };
}
