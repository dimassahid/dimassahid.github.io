/**
 * Minimal client for the Google Apps Script translation web app in
 * `scripts/apps-script/Code.gs`.
 *
 * Free tier: `LanguageApp.translate` inside Apps Script is not billed, but it is
 * rate limited per Google account (~5,000 calls/day for gmail.com, reset at
 * midnight Pacific Time) and each execution may run for 6 minutes. One call
 * translates one text chunk, so batching keeps both limits far away.
 *
 * Requests are POSTed so long articles and non-ASCII text survive the URL limit
 * of the /exec endpoint.
 */
const MAX_ITEMS = 25;
const MAX_CHARS = 8_000;
const MIN_TOKEN_LENGTH = 16;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class TranslationError extends Error {}

function describeHtml(html) {
  if (/Script function not found|Fungsi skrip tidak ditemukan/i.test(html)) {
    return "the deployed version has no doPost — redeploy scripts/apps-script/Code.gs as a new version";
  }
  if (/Sorry, unable to open the file|sign in|accounts\.google\.com/i.test(html)) {
    return "the deployment is not public — set 'Who has access' to 'Anyone'";
  }
  return `unexpected HTML response (${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)})`;
}

export function createAppsScriptTranslator(options = {}) {
  const url = String(options.url ?? process.env.APPS_SCRIPT_TRANSLATE_URL ?? "").trim();
  const token = String(options.token ?? process.env.APPS_SCRIPT_TRANSLATE_TOKEN ?? "").trim();
  const timeoutMs = Number(options.timeoutMs ?? process.env.APPS_SCRIPT_TRANSLATE_TIMEOUT_MS) || 120_000;
  const maxItems = Number(options.maxItems) || MAX_ITEMS;
  const maxChars = Number(options.maxChars) || MAX_CHARS;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const maxRetries = options.maxRetries ?? 3;

  if (!url) {
    throw new TranslationError(
      "APPS_SCRIPT_TRANSLATE_URL is not set. Deploy scripts/apps-script/Code.gs as a web app and copy the /exec URL."
    );
  }
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) {
    throw new TranslationError("APPS_SCRIPT_TRANSLATE_URL must look like https://script.google.com/macros/s/<id>/exec.");
  }
  if (token.length < MIN_TOKEN_LENGTH) {
    throw new TranslationError(
      `APPS_SCRIPT_TRANSLATE_TOKEN is missing or shorter than ${MIN_TOKEN_LENGTH} characters. Use the same value as the TRANSLATE_TOKEN script property.`
    );
  }
  if (typeof fetchImpl !== "function") {
    throw new TranslationError("No fetch implementation available (Node 18+ required).");
  }

  async function request(texts, { from, to }) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      let response;
      try {
        response = await fetchImpl(url, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ token, from, to, texts }),
          signal: typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(timeoutMs) : undefined
        });
      } catch (error) {
        lastError = new TranslationError(`Cannot reach the Apps Script web app: ${error.message}`);
        if (attempt === maxRetries) break;
        await sleep(500 * 2 ** attempt);
        continue;
      }

      const raw = await response.text();
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = undefined;
      }

      if (!response.ok || !payload) {
        lastError = new TranslationError(
          payload
            ? `Apps Script web app ${response.status}: ${raw.slice(0, 300)}`
            : `Apps Script web app ${response.status}: ${describeHtml(raw)}`
        );
        const retryable = response.status === 429 || response.status >= 500;
        if (!retryable || attempt === maxRetries) break;
        const retryAfter = Number(response.headers.get("retry-after"));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt;
        await sleep(Math.min(delay, 15_000));
        continue;
      }

      if (payload?.ok !== true) {
        const reason = String(payload?.error ?? "unknown error");
        if (payload?.quota) {
          throw new TranslationError(
            `Apps Script daily quota reached (${reason}). The counter resets at midnight Pacific Time; the cache keeps everything translated so far.`
          );
        }
        if (payload?.error === "unauthorized") {
          throw new TranslationError(
            "Apps Script rejected the token. APPS_SCRIPT_TRANSLATE_TOKEN must match the TRANSLATE_TOKEN script property."
          );
        }
        throw new TranslationError(`Apps Script reported: ${reason}`);
      }

      if (!Array.isArray(payload.translations) || payload.translations.length !== texts.length) {
        throw new TranslationError("Unexpected Apps Script response shape (translations length mismatch).");
      }

      if (Array.isArray(payload.warnings) && payload.warnings.length > 0) {
        console.warn(`  ! ${payload.warnings.length} segment(s) returned untranslated: ${payload.warnings[0]}`);
      }

      return { translations: payload.translations, calls: Number(payload.calls) || texts.length };
    }

    throw lastError;
  }

  /**
   * Translate a list of strings, preserving order. Batches keep each POST small
   * because the Apps Script 6 minute limit applies per request, not per call.
   * `onBatch` receives the number of translation calls actually consumed.
   */
  async function translateMany(texts, { from = "en", to = "id", onBatch } = {}) {
    const results = new Array(texts.length);
    let cursor = 0;

    while (cursor < texts.length) {
      const batch = [];
      let characters = 0;

      while (cursor < texts.length && batch.length < maxItems) {
        const text = texts[cursor];
        if (text.length > maxChars) {
          throw new TranslationError(`Single segment exceeds ${maxChars} characters; split it manually.`);
        }
        if (batch.length > 0 && characters + text.length > maxChars) break;
        batch.push(text);
        characters += text.length;
        cursor += 1;
      }

      const { translations, calls } = await request(batch, { from, to });
      translations.forEach((value, index) => {
        results[cursor - batch.length + index] = value;
      });
      onBatch?.({ calls, characters });
    }

    return results;
  }

  return { translateMany, url };
}
