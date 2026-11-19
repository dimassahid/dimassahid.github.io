/**
 * Google Apps Script web app: a free translation endpoint for `npm run sync:notion`.
 *
 * Deploy it once as a web app ("Execute as: Me", "Who has access: Anyone") and
 * put the /exec URL plus a shared token into .env:
 *
 *   APPS_SCRIPT_TRANSLATE_URL=https://script.google.com/macros/s/<id>/exec
 *   APPS_SCRIPT_TRANSLATE_TOKEN=<same value as the TRANSLATE_TOKEN script property>
 *
 * Contract
 *   GET  /exec                                          -> {"ok":true,"version":2}
 *   GET  /exec?text=Hi&source=en&target=id&token=...    -> manual check (uses 1 call)
 *   POST /exec {"token","from","to","texts":[]}         -> {"ok":true,"translations":[]}
 *
 * Quotas (Google, per account, reset at midnight Pacific Time):
 *   gmail.com 5,000 translate calls/day, Workspace 20,000, 6 min per execution.
 *   One `LanguageApp.translate()` call per text segment, so a 4,000 character
 *   chunk still counts as a single call.
 */

const TOKEN_PROPERTY = "TRANSLATE_TOKEN";
const USAGE_PROPERTY = "TRANSLATE_USAGE";
const MAX_CALLS_PROPERTY = "MAX_CALLS_PER_DAY";
const CHARS_PER_CALL_PROPERTY = "CHARS_PER_CALL";
const DEFAULT_MAX_CALLS_PER_DAY = 4500;
const DEFAULT_CHARS_PER_CALL = 4000;

function doGet(event) {
  const params = (event && event.parameter) || {};
  if (!params.text) {
    return json({ ok: true, version: 2, service: "apps-script-translate" });
  }
  if (!isAuthorized(params.token)) return json({ ok: false, error: "unauthorized" });

  const settings = loadSettings();
  const usage = readUsage();
  if (usage.calls >= settings.maxCallsPerDay) return budgetExhausted(usage);

  const text = String(params.text);
  const from = normalizeLanguage(params.source, "en");
  const to = normalizeLanguage(params.target, "id");

  try {
    const translatedText = LanguageApp.translate(text, from, to);
    usage.calls += 1;
    saveUsage(usage);
    return json({ ok: true, translatedText: translatedText, calls: 1, callsUsedToday: usage.calls });
  } catch (error) {
    saveUsage(usage);
    return json({ ok: false, error: describeError(error), quota: isQuotaError(error) });
  }
}

function doPost(event) {
  let body;
  try {
    body = JSON.parse((event && event.postData && event.postData.contents) || "{}");
  } catch (error) {
    return json({ ok: false, error: "invalid JSON body" });
  }

  if (!isAuthorized(body.token)) return json({ ok: false, error: "unauthorized" });

  const from = normalizeLanguage(body.from, "en");
  const to = normalizeLanguage(body.to, "id");
  const texts = Array.isArray(body.texts) ? body.texts : [];
  const settings = loadSettings();
  const usage = readUsage();
  const translations = [];
  const warnings = [];
  let calls = 0;

  for (let index = 0; index < texts.length; index += 1) {
    const text = texts[index];
    if (typeof text !== "string" || !text.trim()) {
      translations.push(typeof text === "string" ? text : "");
      continue;
    }

    const parts = splitForLimit(text, settings.charsPerCall);
    const translatedParts = [];

    for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
      if (usage.calls >= settings.maxCallsPerDay) {
        saveUsage(usage);
        return budgetExhausted(usage, {
          from: from,
          to: to,
          translations: translations,
          calls: calls,
          warnings: warnings
        });
      }
      try {
        translatedParts.push(LanguageApp.translate(parts[partIndex], from, to));
      } catch (error) {
        warnings.push("text " + index + ": " + describeError(error));
        translatedParts.push(parts[partIndex]);
        if (isQuotaError(error)) {
          usage.calls += 1;
          saveUsage(usage);
          return json({
            ok: false,
            error: describeError(error),
            quota: true,
            from: from,
            to: to,
            translations: translations,
            calls: calls,
            warnings: warnings
          });
        }
      }
      usage.calls += 1;
      calls += 1;
    }

    translations.push(translatedParts.join(" "));
  }

  saveUsage(usage);
  return json({
    ok: true,
    from: from,
    to: to,
    translations: translations,
    calls: calls,
    warnings: warnings,
    callsUsedToday: usage.calls
  });
}

/** Settings come from Script Properties so they can change without a redeploy. */
function loadSettings() {
  const properties = PropertiesService.getScriptProperties();
  return {
    maxCallsPerDay: positiveInteger(properties.getProperty(MAX_CALLS_PROPERTY), DEFAULT_MAX_CALLS_PER_DAY),
    charsPerCall: positiveInteger(properties.getProperty(CHARS_PER_CALL_PROPERTY), DEFAULT_CHARS_PER_CALL)
  };
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

/** Usage is tracked per Pacific-Time day because that is when Google resets the quota. */
function readUsage() {
  const properties = PropertiesService.getScriptProperties();
  const today = Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd");
  let stored = {};
  try {
    stored = JSON.parse(properties.getProperty(USAGE_PROPERTY) || "{}");
  } catch (error) {
    stored = {};
  }
  return {
    properties: properties,
    today: today,
    calls: stored.date === today ? positiveInteger(stored.calls, 0) : 0
  };
}

function saveUsage(usage) {
  usage.properties.setProperty(USAGE_PROPERTY, JSON.stringify({ date: usage.today, calls: usage.calls }));
}

function budgetExhausted(usage, extra) {
  const payload = {
    ok: false,
    error: "daily call budget exhausted",
    quota: true,
    retryAfter: "next midnight Pacific Time",
    callsUsedToday: usage.calls
  };
  return json(Object.assign(payload, extra || {}));
}

/**
 * LanguageApp rejects long inputs, so split at a newline, sentence or space and
 * join the translated pieces with a single space.
 */
function splitForLimit(text, limit) {
  if (text.length <= limit) return [text];

  const pieces = [];
  let rest = text;
  while (rest.length > limit) {
    let cut = rest.lastIndexOf("\n", limit);
    if (cut < limit / 2) cut = rest.lastIndexOf(". ", limit);
    if (cut < limit / 2) cut = rest.lastIndexOf(" ", limit);
    if (cut <= 0) cut = limit;
    pieces.push(rest.slice(0, cut + 1));
    rest = rest.slice(cut + 1);
  }
  if (rest) pieces.push(rest);
  return pieces;
}

function normalizeLanguage(value, fallback) {
  return typeof value === "string" && /^[a-z]{2,3}$/i.test(value) ? value.toLowerCase() : fallback;
}

function isAuthorized(token) {
  const expected = PropertiesService.getScriptProperties().getProperty(TOKEN_PROPERTY);
  if (!expected) return false;
  if (typeof token !== "string" || !token) return false;
  return safeEquals(digest(token), digest(expected));
}

function digest(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)
    .map(function (byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join("");
}

/** Compare fixed-length hex digests without leaking the position of a mismatch. */
function safeEquals(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function isQuotaError(error) {
  return /too many times|quota|rate limit/i.test(describeError(error));
}

function describeError(error) {
  return String((error && error.message) || error || "unknown error").slice(0, 300);
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
