# Cyber Portfolio

A bilingual (Indonesian / English) cybersecurity consultant portfolio and technical blog built with Astro 5. Content lives in Notion, is synced to Markdown, and missing translations are generated with Azure Translator behind a persistent, committed cache. The output is a fully static site designed for Cloudflare Pages.

## Features

- **Two languages, one article** - `lang` + `translationKey` pair every translation of the same post. URLs are `/id/...` and `/en/...`; missing translations fall back to the original and are marked with `hreflang` only when a real translation exists.
- **Notion as CMS** - `npm run sync:notion` pulls pages, converts Notion blocks to Markdown, writes one file per language, and keeps manual edits safe.
- **Machine translation with a memory** - Azure Translator v3 with batching, retries and backoff. Every translated string is cached by SHA-256 of `provider|from|to|text`, so rebuilds only pay for new or edited text.
- **Guard rails** - per-run character and request limits plus a monthly budget persisted in the cache, so a runaway sync cannot burn your Azure quota.
- **Content validation** - `npm run validate:content` checks frontmatter, language/file pairing, categories, duplicate translations, ethics notes on sample writeups and internal links.
- **Reading experience** - sticky table of contents, code blocks with copy buttons, reading time, related posts, previous/next navigation, sample-content banner.
- **Search and filtering** - a per-language JSON index with client-side search across title, description, tags and body, plus category and tag chips.
- **SEO** - canonical URLs, per-language RSS, sitemap with `xhtml:link` alternates, Open Graph/Twitter cards, JSON-LD (Person, WebSite, TechArticle, BreadcrumbList), `robots.txt`.
- **Theme** - dark/light with a no-flash inline bootstrap, `prefers-color-scheme` default and a persistent toggle.
- **Security headers** - `public/_headers` ships CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` and long-lived asset caching for Cloudflare Pages.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro](https://astro.build) 5 (static output, no client framework) |
| Content | Markdown/MDX via the Astro content collections API |
| CMS | Notion API (`@notionhq/client` style REST calls, no SDK) |
| Translation | Azure Translator v3 REST |
| Styling | Hand-written CSS with custom properties (`src/styles/`) |
| Deploy | Cloudflare Pages (`wrangler.toml`, `_headers`, `_redirects`) |

## Quick start

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:4321
```

The two sample notes (both languages) ship with `sample: true`, so the site stays browsable before you connect Notion. The two demonstration writeups were removed from this project when the Notion library was imported; replace the remaining sample notes with your own content when you are ready.

### Requirements

- Node.js **>= 20.19** (`.nvmrc` pins Node 22)
- npm 10+
- On Windows PowerShell use `npm.cmd` if your execution policy blocks `npm.ps1`.

## Project structure

```text
src/
  components/        ArticleCard, ProjectCard, ListingExplorer, Navbar, Footer, TableOfContents
  content/
    writeups/        Technical writeups, one file per language
    notes/           Shorter notes, one file per language
  data/
    site.ts          Name, tagline, bio, navigation, contact, skills
    projects.ts      Portfolio projects
    categories.ts    Category keys and localized labels
    translation-cache/  Committed Azure translation memory + monthly usage
  layouts/           BaseLayout (head, header, footer) and ArticleLayout
  pages/
    index.astro      Redirects to the default language
    [lang]/          home, about, portfolio, writeups, notes, contact
    id/, en/         rss.xml.ts and search-index.json.ts (static per-language endpoints)
    sitemap.xml.ts, robots.txt.ts, rss.xml.ts (root feed), 404.astro
  styles/            theme.css (tokens) and global.css (components)
  utils/             content queries, i18n dictionaries, SEO helpers, reading time
scripts/
  sync-notion.mjs    Notion -> Markdown (+ translation)
  validate-content.mjs
  notion/blocks-to-markdown.mjs
  translation/       cache, Azure client, Markdown segmenter, orchestrator
```

## Content model

Each article is a Markdown file in `src/content/writeups` or `src/content/notes`:

```markdown
---
title: "Breaking Down a REST API Authorization Bypass in the Lab"
description: "One-sentence summary used in cards, meta tags and search."
lang: "en"                        # id | en
translationKey: "sample-api-auth-bypass"
category: "api-security"          # key from src/data/categories.ts
tags: ["API", "idor", "authorization"]
publishDate: 2025-10-14
updatedDate: 2025-10-21           # optional
draft: false                       # true = hidden in production builds
featured: true                     # pinned on the homepage
sample: true                       # shows the demonstration banner
author: "YOUR NAME"               # optional, falls back to site config
translationStatus: "original"     # original | machine | reviewed
sourceLang: "id"                  # only for machine/reviewed translations
---

Body in Markdown.
```

`translationKey` is the route slug and the pairing key. The sync script names files `<translationKey>.<lang>.md`, and `src/utils/content.ts` groups entries by that key so `/id/writeups/<key>/` and `/en/writeups/<key>/` serve the same article.

### Writing by hand

1. Create `src/content/<section>/<slug>.id.md` and `<slug>.en.md` with the same `translationKey`.
2. Run `npm run validate:content` - it reports missing pairs, bad dates, unknown categories and broken internal links.
3. Run `npm run dev`.

### Categories

Add a key to `src/data/categories.ts` with `id` and `en` labels. Unknown keys coming from Notion are slugified and rendered as a readable label, so a sync never breaks because of a new select option.

Built-in keys: `web-security`, `api-security`, `mobile-security`, `reverse-engineering`, `cryptography`, `network-security`, `security-tools`, `vulnerability-research`, `application-security`, `automation`, `security-awareness`, `infrastructure-security`, `lab-writeups`, `general`.

Pages without a `Category` value fall back to `NOTION_DEFAULT_CATEGORY` (default `general`), so a lab database can set `NOTION_DEFAULT_CATEGORY=lab-writeups` and get a real category without editing every page.

## Notion setup

1. Create a Notion integration (internal) at <https://www.notion.so/my-integrations> and copy its secret.
2. Create a database with at least these properties, then **share the database with the integration** (••• -> Connections).
3. Copy the database id from the URL into `NOTION_DATABASE_ID`.

| Property | Notion type | Required | Notes |
| --- | --- | --- | --- |
| `Name` | Title | yes | Falls back to `Title`/`Judul`; the first title property is used if none match. |
| `Slug` | Rich text | no | Defaults to a slugified title. |
| `Description` | Rich text | no | Falls back to the first 180 characters of the page. |
| `Category` | Select | no | Slugified into a category key; falls back to `NOTION_DEFAULT_CATEGORY`. |
| `Tags` | Multi-select | no | Copied as-is. |
| `OS` | Select | no | Appended to `tags` (e.g. `Linux`, `Windows`, `Active Directory`). |
| `Severity` | Select | no | Appended to `tags` (e.g. `Easy`, `Medium`, `Hard`). |
| `Published` | Date | no | Defaults to the page creation time. |
| `Updated` | Date | no | Optional; used for `dateModified` and sitemap metadata. |
| `Draft` | Checkbox | no | Hidden from production builds. |
| `Status` | Status or Select | no | Any value listed in `NOTION_DRAFT_STATUSES` is also written as a draft (e.g. `Not started`). |
| `Featured` | Checkbox | no | Pinned on the homepage. |
| `Language` | Select | no | `id` / `en`; defaults to `NOTION_DEFAULT_LANGUAGE`. |
| `Section` | Select | no | `writeups` / `notes`; defaults to `NOTION_DEFAULT_SECTION`. |
| `TranslationKey` | Rich text | no | Defaults to the slug; use the same value on both language pages. |

Property names are configurable via `NOTION_PROP_*` environment variables (see `.env.example`). Newer Notion API versions (2025-09-03 and later) use data sources instead of databases: set `NOTION_DATA_SOURCE_ID` and the script switches endpoints automatically. Set `NOTION_DRAFT_STATUSES` (comma separated, case insensitive) when a status column should drive drafts instead of a checkbox. `OS` and `Severity` are read from their own select columns and appended to `tags`, and pages without a `Category` value fall back to `NOTION_DEFAULT_CATEGORY`.

Set `NOTION_DEFAULT_LANGUAGE=en` when the Notion pages are written in English. With the default `id` every page is written as `<slug>.id.md` with `lang: "id"`, which also drives `<html lang>`, `hreflang`, the UI language and the route prefix - so an English library synced with `id` renders as Indonesian content.

### How the sync decides what to write

- A group is every page sharing `Section/TranslationKey`.
- The page in `TRANSLATION_SOURCE_LANGUAGE` (falls back to `NOTION_DEFAULT_LANGUAGE`, template default `id`) is written as `translationStatus: "original"`.
- If a page for the other language also exists in Notion, it is written as authored content - the script does **not** overwrite it with machine output.
- If it does not exist and translation is enabled, the source is translated and written with `translationStatus: "machine"` and `sourceLang`.
- Files whose `notionLastEdited` is newer than or equal to the page's `last_edited_time` are skipped, so re-running is cheap and never rewrites unchanged files.
- Files marked `translationStatus: "reviewed"` are never replaced by machine output unless you pass `--force`.

```bash
npm run sync:notion                       # sync + translate what is missing
npm run sync:notion -- --check            # report pending changes, write nothing (exit 1 if pending)
npm run sync:notion -- --force            # rewrite everything, ignore timestamps
npm run sync:notion -- --prune            # delete local files whose Notion page is gone
npm run sync:notion -- --limit 5          # only the first five pages
npm run sync:notion -- --slug my-article  # one article (slug or translationKey)
```

Notion blocks are converted to Markdown for paragraphs, headings, lists, to-dos, quotes, callouts, code, dividers, images, bookmarks, toggles, tables and equations. Unknown blocks are flattened to their children.

> **Images:** Notion-hosted file URLs are signed and expire after about an hour, and the production CSP only allows `img-src 'self' data:`, so remote images break outside the dev server. After a sync, run `npm run images:notion` to download every referenced image into `public/images/<slug>/` and rewrite the links:

```bash
npm run images:notion                     # download missing images + rewrite links
npm run images:notion -- --check          # report pending downloads, write nothing
npm run images:notion -- --slug my-article
npm run images:notion -- --force          # re-download even when a copy exists
```

The command is idempotent: files are named from a hash of the remote path, so re-running it reuses what is already on disk and only downloads new or changed screenshots. A link is rewritten only after its download succeeded; failures keep the remote URL and make the command exit with `1` (re-run the sync to refresh expired URLs).

`npm run sync:notion -- --force` regenerates the Markdown from Notion, so localized image links revert to signed remote URLs. Running `npm run images:notion` again restores them without downloading anything: the file name is derived from the remote path, so the existing copy is reused.

## Translation pipeline

```text
Notion page -> blocks-to-markdown -> segmenter -> cache lookup -> Azure Translator -> target .md
                                           |            |
                                     code/URLs skipped  (no API call on cache hit)
```

- **Segmentation** (`scripts/translation/markdown.mjs`) works line by line. Fenced code blocks, HTML, URLs, inline code and link targets are protected or skipped, and heading/list/quote markers are preserved. Table cells are translated individually so the table structure survives.
- **Caching** (`scripts/translation/cache.mjs`) stores every translated string under SHA-256 of `provider|from|to|text` in `src/data/translation-cache/translations.json`. Entries are deduplicated across articles, so a repeated sentence is paid for once.
- **Usage tracking** (`usage.json`) records characters and requests per calendar month. `TRANSLATION_MAX_CHARACTERS_PER_MONTH` is enforced before a request is sent.
- **Batching and retries** (`scripts/translation/azure-translator.mjs`) send at most 100 strings / 48k characters per request, retry `429` and `5xx` with exponential backoff (capped at 15s) and honour `Retry-After`.
- **Guard rails** - `TRANSLATION_MAX_CHARACTERS_PER_BUILD` and `TRANSLATION_MAX_REQUESTS_PER_BUILD` stop the run with a clear error instead of silently overspending.

Commit the cache. It keeps Cloudflare builds deterministic, makes syncs cheap, and documents what was machine-translated.

### Review workflow

1. Machine output lands with `translationStatus: "machine"` and `sourceLang`.
2. Read and edit the target file, then change the flag to `translationStatus: "reviewed"`.
3. Future syncs keep reviewed files untouched (even if the Notion page changes) unless you pass `--force`.
4. To disable translation entirely set `TRANSLATION_ENABLED=false` or `TRANSLATION_PROVIDER=none`. `--check` runs still work without Azure credentials because the client is created lazily.

## Localization (UI text)

All interface strings live in `src/utils/i18n.ts`:

```ts
export const en = {
  common: { /* ... */ },
  home: { /* ... */ },
  article: { /* ... */ }
} as const;

export const id: Dictionary = { /* same shape, Indonesian values */ };
```

Add a key to `en` first; TypeScript's `Dictionary` type then requires it in `id`. Pages call `const t = useTranslations(lang)` and render `t.section.key`. Dates use `Intl.DateTimeFormat` with the active language, so no locale data is hardcoded in components.

Missing article translations fall back to the default language automatically (`src/utils/content.ts`). The article page shows a notice and links to the language that does exist; the sitemap only emits `hreflang` alternates for real translations.

## Customization

| What | Where |
| --- | --- |
| Name, initials, role, tagline, bio, e-mail, social links | `src/data/site.ts` |
| Navigation labels and order | `src/data/site.ts` (`navigation`) |
| Skills, expertise, philosophy, certifications | `src/data/site.ts` |
| Portfolio projects | `src/data/projects.ts` |
| Category keys and bilingual labels | `src/data/categories.ts` |
| Colors, typography, spacing, radii | `src/styles/theme.css` |
| Component and layout styling | `src/styles/global.css` |
| Default language (`id` or `en`) | `defaultLanguage` in `src/data/site.ts` |
| Favicon, Apple touch icon, logo mark | `public/favicon-512.png`, `public/favicon-192.png`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/favicon.svg`, `public/images/logo-mark.png` |
| About page portrait | `public/images/profile.jpg` |
| Social card (Open Graph) | `public/images/og-default.svg` |

Every `YOUR NAME` / `example.com` value in `site.ts` and `projects.ts` is a placeholder - replace them before publishing. No personal data is hardcoded inside components.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 4321 |
| `npm run build` | Static production build into `dist/` |
| `npm run preview` | Preview the built site locally |
| `npm run check` | `astro check` (TypeScript + Astro diagnostics) |
| `npm run validate:content` | Frontmatter, pairing, category and link validation |
| `npm run sync:notion` | Notion -> Markdown + translation |
| `npm run sync:notion:check` | Dry run of the sync (exit code 1 when changes are pending) |
| `npm run verify` | `validate:content` + `check` + `build` |

## Deploy to Cloudflare Pages

### Git integration (recommended)

1. Push the repository to GitHub/GitLab.
2. In Cloudflare Pages choose **Create application -> Pages -> Connect to Git**.
3. Build command: `npm run build`, output directory: `dist`, Node version `20` or newer.
4. Add `SITE_URL=https://your-domain.tld` as a production environment variable (and for preview if you want canonical previews).

Content is committed, so Pages only runs `astro build`. If you prefer Cloudflare to pull from Notion on every deploy, add the Notion/Azure secrets as encrypted environment variables and change the build command to `npm run sync:notion && npm run build` - but keep the cache committed or every build pays for the full text again.

### Wrangler

```bash
npm run build
npx wrangler pages deploy dist --project-name cyber-portfolio
```

`wrangler.toml` pins `pages_build_output_dir = "./dist"`. `public/_headers` and `public/_redirects` are copied into `dist` and picked up by Pages automatically.

Post-deploy checklist:

- `https://your-domain/sitemap.xml` lists both languages.
- `https://your-domain/id/rss.xml` and `/en/rss.xml` return XML.
- `/robots.txt` points to the sitemap.
- Security headers are present (CSP, HSTS, `X-Frame-Options`).
- `hreflang` alternates only appear for articles that exist in both languages.

## SEO notes

- Canonical URLs use `trailingSlash: "always"` directory URLs (`/en/writeups/slug/`).
- JSON-LD: `Person` + `WebSite` on the homepage, `TechArticle` on articles, `BreadcrumbList` on listing and detail pages.
- `sitemap.xml` emits `lastmod` from `updatedDate`/`publishDate` and `xhtml:link` alternates for translated pairs.
- `/[lang]/search-index.json` powers the client-side search; it strips Markdown and joins title, description, tags and body.
- Feeds and search indexes are static endpoints (`src/pages/id/…`, `src/pages/en/…`) built from `src/utils/feeds.ts` and `src/utils/search-index.ts`. A `[lang]/rss.xml.ts` file would be served at `/en/rss.xml/` under `trailingSlash: "always"`, which breaks the `/en/rss.xml` links and the client-side fetch, so the per-language static routes keep the canonical paths in both `astro dev` and the build.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Cannot find module 'astro:content'` during `astro check` | Run `npm run build` once, or `npx astro sync`, to generate `.astro` types. |
| `npm` is blocked in PowerShell | Use `npm.cmd run <script>` or fix the execution policy. |
| `npm warn install-scripts ... esbuild / sharp` | npm 12 blocks postinstall scripts by default. Prebuilt optional packages are usually already installed; if a build fails, run `npm install-scripts approve esbuild sharp`. |
| Sync fails with `401`/`403` from Notion | The integration is not shared with the database, or `NOTION_TOKEN` is missing. |
| Sync fails with `404` on the database | Wrong `NOTION_DATABASE_ID` (or set `NOTION_DATA_SOURCE_ID` for API version `2025-09-03`). |
| `Azure Translator 401` / `403` | Check `AZURE_TRANSLATOR_KEY` and `AZURE_TRANSLATOR_REGION`; the region must match the resource. |
| Translation limit error | Raise `TRANSLATION_MAX_*`, wait for the next monthly window, or set `TRANSLATION_ENABLED=false` and translate manually. |
| An article is missing from the build | Check `draft: true`, the `lang` value and that `publishDate` parses. `npm run validate:content` reports all three. |
| Wrong or missing language on a route | Both files must share `translationKey`; otherwise the filename becomes the key and the pair splits. |
| `hreflang` missing for an article | That language is a fallback, not a real translation. Add the missing file. |
| Theme flashes on load | Keep the inline theme bootstrap in `BaseLayout` before the stylesheets; it sets `data-theme` from `localStorage`/`prefers-color-scheme`. |

## License

The code is provided as a template for your own portfolio. Replace the placeholder identity, sample articles and social links before publishing. Sample articles are demonstration content and must not be presented as real client engagements.
