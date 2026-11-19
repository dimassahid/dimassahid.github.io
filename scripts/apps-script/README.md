# Google Apps Script translator

Free replacement for the Azure Translator service that this repository used to
call. `LanguageApp.translate` runs inside your own Google account, so the only
limits are Google's Apps Script quotas (no billing, no API key, no credit card).

| | Azure Translator (removed) | Apps Script web app |
| --- | --- | --- |
| Cost | per character | free |
| Credential | subscription key + region | shared token in script properties |
| Limit | monthly character quota | ~5,000 translate calls/day (gmail.com), 20,000 (Workspace) |
| Speed | milliseconds | ~200-800 ms per call |
| Failure mode | 429 + `Retry-After` | quota exception until midnight Pacific Time |

One `LanguageApp.translate()` call translates one text chunk, so the client
sends ~25 segments per POST and the guard rails count **calls**, not characters.
A 40,000 character writeup is roughly 300 calls.

## Contract

```text
GET  /exec                                            -> {"ok":true,"version":2}
GET  /exec?text=Hello&source=en&target=id&token=...   -> {"ok":true,"translatedText":"Halo"}
POST /exec {"token","from","to","texts":["..."]}      -> {"ok":true,"translations":["..."],"calls":25}
```

`POST` is what `scripts/translation/apps-script-translator.mjs` uses. Errors come
back as JSON with `ok:false` and an `error` string; quota errors also set
`quota:true` so the client stops instead of retrying.

## One-time setup

1. Open <https://script.google.com> -> **New project**, rename it
   `portfolio-translator`.
2. Replace the contents of `Code.gs` with `scripts/apps-script/Code.gs` from this
   repository and save.
3. **Project Settings -> Script properties -> Add script property**
   - `TRANSLATE_TOKEN` = a long random string, e.g.
     `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`
   - optional `MAX_CALLS_PER_DAY` (default `4500`) and `CHARS_PER_CALL`
     (default `4000`).
4. **Deploy -> New deployment -> Web app**
   - Description: `translate v2`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorise the requested scopes (`script.external_request`).
5. Copy the **Web app URL** (`https://script.google.com/macros/s/<id>/exec`).
6. Fill `.env`:

   ```dotenv
   TRANSLATION_PROVIDER=apps-script
   APPS_SCRIPT_TRANSLATE_URL=https://script.google.com/macros/s/<id>/exec
   APPS_SCRIPT_TRANSLATE_TOKEN=<the TRANSLATE_TOKEN value>
   ```

7. Verify:

   ```bash
   npm run translate:probe -- --health
   npm run translate:probe -- "Hello world"
   ```

## Updating the code later

`Deploy -> Manage deployments -> pencil icon -> Version: New version -> Deploy`.
The `/exec` URL and the token stay the same, so `.env` does not change. Editing
the script without a new version keeps serving the old code.

## Quotas and limits

| Resource | gmail.com | Google Workspace |
| --- | --- | --- |
| `LanguageApp.translate` calls / day | 5,000 | 20,000 |
| Script runtime per execution | 6 minutes | 6 minutes |
| Simultaneous executions | 30 | 30 |

The daily counter resets at **midnight Pacific Time**. `usage.json` in the
repository mirrors the same clock (see `scripts/translation/cache.mjs`), so
`TRANSLATION_MAX_CALLS_PER_DAY` stops a run before Google does.

If a POST would exceed the 6 minute limit, lower
`TRANSLATION_MAX_ITEMS_PER_REQUEST` (e.g. `10`) — the client simply sends more,
smaller requests.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `Apps Script web app 401: the deployment is not public` | Set *Who has access* to **Anyone**, deploy a new version. |
| `the deployed version has no doPost` | The deployment still serves v1 (`doGet` only). Deploy a new version. |
| `Apps Script rejected the token` | `APPS_SCRIPT_TRANSLATE_TOKEN` differs from the `TRANSLATE_TOKEN` script property. |
| `daily call budget exhausted` | Google quota or `MAX_CALLS_PER_DAY`; wait for midnight Pacific Time. Cached text is kept. |
| TLS / `unable to verify the first certificate` on Windows | Corporate TLS inspection. Use `NODE_OPTIONS=--use-system-ca npm run sync:notion` (Node 22.9+) or `curl.exe --ssl-no-revoke`. Never disable certificate verification. |

## Security notes

- The web app is reachable by anyone who has the URL, so every request is
  token-gated with a SHA-256 comparison in constant time. Rotate the token by
  editing the script property; no redeploy needed.
- `doGet` without `text` is a quota-free health check and reveals only
  `{"ok":true,"version":2}`.
- Never commit `APPS_SCRIPT_TRANSLATE_TOKEN`; it is read from `.env` only.
