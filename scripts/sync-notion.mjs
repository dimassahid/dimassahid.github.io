#!/usr/bin/env node
/**
 * Notion -> local Markdown sync with optional Google Apps Script translation.
 *
 * Usage:
 *   npm run sync:notion                 # sync + translate missing languages
 *   npm run sync:notion -- --check      # report pending changes, write nothing
 *   npm run sync:notion -- --dry-run    # same as --check, verbose
 *   npm run sync:notion -- --force      # ignore timestamps, rewrite everything
 *   npm run sync:notion -- --prune      # delete local files whose Notion page is gone
 *   npm run sync:notion -- --newest 3   # only the N newest translation groups
 *   npm run sync:notion -- --slug a,b   # only these slugs (comma separated)
 *   npm run sync:notion -- --limit 5
 *
 * Required env (see .env.example):
 *   NOTION_TOKEN, NOTION_DATABASE_ID (or NOTION_DATA_SOURCE_ID)
 * Optional env:
 *   NOTION_API_VERSION, NOTION_DEFAULT_SECTION, NOTION_DEFAULT_LANGUAGE,
 *   NOTION_DEFAULT_CATEGORY (fallback category key when the page has none),
 *   NOTION_DRAFT_STATUSES (comma separated statuses treated as drafts),
 *   NOTION_PROP_* (property name overrides, e.g. NOTION_PROP_OS),
 *   TRANSLATION_* (Apps Script URL/token and guard rails)
 */
import "dotenv/config";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { blocksToMarkdown, plainText } from "./notion/blocks-to-markdown.mjs";
import { createTranslationService, TranslationBudgetError } from "./translation/index.mjs";

const CONTENT_ROOT = path.resolve("src/content");
const SECTIONS = new Set(["writeups", "notes"]);
const LANGS = new Set(["id", "en"]);

const args = process.argv.slice(2);
const flags = {
  check: args.includes("--check") || args.includes("--dry-run"),
  force: args.includes("--force"),
  prune: args.includes("--prune"),
  limit: numberArg("--limit"),
  newest: numberArg("--newest"),
  slugs: listArg("--slug")
};

function numberArg(name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = Number(args[index + 1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function stringArg(name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

/** `--slug reset,cyberlens` -> ["reset", "cyberlens"] */
function listArg(name) {
  const value = stringArg(name);
  if (!value) return [];
  return value
    .split(",")
    .map((item) => slugify(item))
    .filter(Boolean);
}

const log = {
  info: (message) => console.log(message),
  warn: (message) => console.warn(`warning: ${message}`),
  error: (message) => console.error(`error: ${message}`)
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function categoryKey(value) {
  return slugify(value ?? "");
}

function isoDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function toYaml(frontmatter) {
  const lines = [];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((item) => JSON.stringify(item)).join(", ")}]`);
    } else if (typeof value === "boolean" || typeof value === "number") {
      lines.push(`${key}: ${value}`);
    } else if (key.endsWith("Date")) {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  return lines.join("\n");
}

function renderFile(frontmatter, markdown) {
  return `---\n${toYaml(frontmatter)}\n---\n\n${markdown.trim()}\n`;
}

async function readIfExists(file) {
  try {
    return matter(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

const NOTION_API_VERSION = process.env.NOTION_API_VERSION || (process.env.NOTION_DATA_SOURCE_ID ? "2025-09-03" : "2022-06-28");
const DEFAULT_SECTION = SECTIONS.has(process.env.NOTION_DEFAULT_SECTION) ? process.env.NOTION_DEFAULT_SECTION : "writeups";
const DEFAULT_LANGUAGE = LANGS.has(process.env.NOTION_DEFAULT_LANGUAGE) ? process.env.NOTION_DEFAULT_LANGUAGE : "id";
/** Fallback category for pages whose Category property is empty (e.g. "lab-writeups"). */
const DEFAULT_CATEGORY = slugify(process.env.NOTION_DEFAULT_CATEGORY ?? "") || "general";
const SOURCE_LANGUAGE = LANGS.has(process.env.TRANSLATION_SOURCE_LANGUAGE) ? process.env.TRANSLATION_SOURCE_LANGUAGE : DEFAULT_LANGUAGE;
const OTHER_LANGUAGE = SOURCE_LANGUAGE === "id" ? "en" : "id";

/** Notion status values that should be written as drafts (comma separated). */
const DRAFT_STATUSES = new Set(
  String(process.env.NOTION_DRAFT_STATUSES ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

const PROPERTY_NAMES = {
  title: ["Name", "Title", "Judul"],
  slug: ["Slug"],
  description: ["Description", "Summary", "Ringkasan", "Deskripsi"],
  category: ["Category", "Kategori"],
  tags: ["Tags", "Tag"],
  published: ["Published", "Publish Date", "Tanggal Terbit", "Date"],
  updated: ["Updated", "Last Edited", "Diperbarui"],
  draft: ["Draft"],
  featured: ["Featured"],
  status: ["Status"],
  os: ["OS", "Operating System", "Platform"],
  severity: ["Severity", "Difficulty", "Level"],
  lang: ["Lang", "Language", "Bahasa"],
  translationKey: ["TranslationKey", "Translation Key"],
  section: ["Section", "Type", "Tipe"]
};

for (const key of Object.keys(PROPERTY_NAMES)) {
  const override = process.env[`NOTION_PROP_${key.toUpperCase()}`];
  if (override) PROPERTY_NAMES[key] = [override, ...PROPERTY_NAMES[key]];
}

class NotionError extends Error {}

class NotionClient {
  constructor({ token, databaseId, dataSourceId, apiVersion }) {
    if (!token) throw new NotionError("NOTION_TOKEN is not set.");
    if (!databaseId && !dataSourceId) throw new NotionError("Set NOTION_DATABASE_ID or NOTION_DATA_SOURCE_ID.");
    this.token = token;
    this.databaseId = databaseId;
    this.dataSourceId = dataSourceId;
    this.apiVersion = apiVersion;
    this.requests = 0;
    this.blockCache = new Map();
  }

  async request(pathname, { method = "GET", body } = {}) {
    let lastError;
    for (let attempt = 0; attempt <= 3; attempt += 1) {
      await sleep(340);
      this.requests += 1;

      const response = await fetch(`https://api.notion.com/v1${pathname}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Notion-Version": this.apiVersion,
          "content-type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (response.ok) return response.json();

      const detail = await response.text().catch(() => "");
      lastError = new NotionError(`Notion API ${response.status} on ${pathname}: ${detail.slice(0, 300)}`);

      if (response.status !== 429 && response.status < 500) break;
      const retryAfter = Number(response.headers.get("retry-after"));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 600 * 2 ** attempt);
    }
    throw lastError;
  }

  async queryDatabase() {
    const target = this.dataSourceId
      ? `/data_sources/${this.dataSourceId}/query`
      : `/databases/${this.databaseId}/query`;
    const pages = [];
    let cursor;

    do {
      const body = { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) };
      const payload = await this.request(target, { method: "POST", body });
      pages.push(...(payload.results ?? []));
      cursor = payload.has_more ? payload.next_cursor : undefined;
    } while (cursor);

    return pages.filter((page) => page.object === "page" && !page.archived && !page.in_trash);
  }

  async children(blockId) {
    if (this.blockCache.has(blockId)) return this.blockCache.get(blockId);
    const results = [];
    let cursor;
    do {
      const query = cursor ? `?page_size=100&start_cursor=${cursor}` : "?page_size=100";
      const payload = await this.request(`/blocks/${blockId}/children${query}`);
      results.push(...(payload.results ?? []));
      cursor = payload.has_more ? payload.next_cursor : undefined;
    } while (cursor);
    this.blockCache.set(blockId, results);
    return results;
  }

  async pageMarkdown(pageId) {
    const blocks = await this.children(pageId);
    return blocksToMarkdown(blocks, { fetchChildren: (id) => this.children(id) });
  }
}

function pickProperty(properties, key, types, { fallback = false } = {}) {
  for (const name of PROPERTY_NAMES[key]) {
    const property = properties[name];
    if (property && types.includes(property.type)) return property;
  }
  if (fallback) {
    for (const property of Object.values(properties)) {
      if (types.includes(property.type)) return property;
    }
  }
  return null;
}

function richTextOf(property) {
  if (!property) return "";
  if (property.type === "title") return plainText(property.title);
  if (property.type === "rich_text") return plainText(property.rich_text);
  return "";
}

function selectOf(property) {
  if (!property) return "";
  if (property.type === "select") return property.select?.name ?? "";
  if (property.type === "status") return property.status?.name ?? "";
  return "";
}

function dateOf(property) {
  if (!property) return undefined;
  if (property.type === "date") return property.date?.start;
  if (property.type === "created_time") return property.created_time;
  if (property.type === "last_edited_time") return property.last_edited_time;
  return undefined;
}

async function pageToArticle(client, page) {
  const properties = page.properties ?? {};
  const title = richTextOf(pickProperty(properties, "title", ["title"], { fallback: true })).trim();
  if (!title) return null;

  const slug = slugify(richTextOf(pickProperty(properties, "slug", ["rich_text"])) || title);
  if (!slug) return null;

  const langValue = selectOf(pickProperty(properties, "lang", ["select", "status"])).toLowerCase();
  const lang = LANGS.has(langValue) ? langValue : DEFAULT_LANGUAGE;

  const sectionValue = selectOf(pickProperty(properties, "section", ["select", "status"])).toLowerCase();
  const section = SECTIONS.has(sectionValue) ? sectionValue : DEFAULT_SECTION;

  const keyValue = richTextOf(pickProperty(properties, "translationKey", ["rich_text"]));
  const translationKey = slugify(keyValue) || slug;

  const categoryValue = selectOf(pickProperty(properties, "category", ["select"]));
  const category = categoryKey(categoryValue) || DEFAULT_CATEGORY;

  const tagsProperty = pickProperty(properties, "tags", ["multi_select"]);
  const tags = (tagsProperty?.multi_select ?? []).map((tag) => tag.name).filter(Boolean);

  // OS and Severity live in their own select columns. Surface them as tags so
  // they appear in filters, tag chips and related-article scoring.
  for (const tagSource of ["os", "severity"]) {
    const value = selectOf(pickProperty(properties, tagSource, ["select"])).trim();
    if (value && !tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) tags.push(value);
  }

  const markdown = (await client.pageMarkdown(page.id)).trim();
  const fallbackDescription = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180)
    .replace(/\s+\S*$/, "")
    .trim();

  const draftProperty = pickProperty(properties, "draft", ["checkbox"]);
  const featuredProperty = pickProperty(properties, "featured", ["checkbox"]);
  const statusValue = selectOf(pickProperty(properties, "status", ["status", "select"]));
  const published = dateOf(pickProperty(properties, "published", ["date", "created_time"])) ?? page.created_time;
  const updated = dateOf(pickProperty(properties, "updated", ["date", "last_edited_time"]));

  return {
    notionId: page.id,
    notionUrl: page.url,
    lastEdited: page.last_edited_time,
    section,
    slug,
    translationKey,
    lang,
    title,
    description:
      richTextOf(pickProperty(properties, "description", ["rich_text"])).trim() || fallbackDescription || title,
    category,
    tags,
    published,
    updated,
    draft: draftProperty?.checkbox === true || DRAFT_STATUSES.has(statusValue.trim().toLowerCase()),
    featured: featuredProperty?.checkbox === true,
    markdown
  };
}

function contentFile(section, translationKey, lang) {
  return path.join(CONTENT_ROOT, section, `${translationKey}.${lang}.md`);
}

function frontmatterFor(article, overrides = {}) {
  return {
    title: article.title,
    description: article.description,
    lang: article.lang,
    translationKey: article.translationKey,
    category: article.category,
    tags: article.tags,
    publishDate: isoDate(article.published),
    updatedDate: isoDate(article.updated),
    draft: article.draft,
    featured: article.featured,
    sample: false,
    author: process.env.SITE_AUTHOR || undefined,
    translationStatus: "original",
    sourceLang: undefined,
    notionId: article.notionId,
    notionUrl: article.notionUrl,
    notionLastEdited: article.lastEdited,
    ...overrides
  };
}

/**
 * Write one article file, honouring manual edits unless --force is used.
 * Returns "created" | "updated" | "unchanged" | "skipped" | "would-write".
 */
async function writeArticle(file, frontmatter, markdown, { check, force }) {
  const existing = await readIfExists(file);

  if (existing) {
    const localNotionId = existing.data.notionId;
    if (localNotionId && localNotionId !== frontmatter.notionId && !force) {
      log.warn(`${path.relative(process.cwd(), file)} belongs to a different Notion page; use --force to overwrite.`);
      return "skipped";
    }

    const localEdited = new Date(existing.data.notionLastEdited ?? 0).getTime();
    const remoteEdited = new Date(frontmatter.notionLastEdited ?? 0).getTime();
    if (!force && localEdited >= remoteEdited) return "unchanged";

    if (existing.data.translationStatus === "reviewed" && frontmatter.translationStatus === "machine" && !force) {
      log.warn(`${path.relative(process.cwd(), file)} is a reviewed translation; not overwriting with machine output.`);
      return "skipped";
    }
  }

  if (check) {
    log.info(`  would ${existing ? "update" : "create"} ${path.relative(process.cwd(), file)}`);
    return "would-write";
  }

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, renderFile(frontmatter, markdown), "utf8");
  return existing ? "updated" : "created";
}

async function contentFiles() {
  const files = [];
  for (const section of SECTIONS) {
    const directory = path.join(CONTENT_ROOT, section);
    let entries = [];
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md")) files.push(path.join(directory, entry.name));
    }
  }
  return files;
}

async function pruneArticles(articles, { check }) {
  const keep = new Set(articles.map((article) => article.notionId));
  const removed = [];

  for (const file of await contentFiles()) {
    const parsed = await readIfExists(file);
    const notionId = parsed?.data.notionId;
    if (!notionId || keep.has(notionId)) continue;

    removed.push(path.relative(process.cwd(), file));
    if (!check) await rm(file, { force: true });
  }

  if (removed.length > 0) {
    log.info(`\n${check ? "Would remove" : "Removed"} ${removed.length} orphaned file(s):`);
    for (const file of removed) log.info(`  - ${file}`);
  }

  return removed.length;
}

async function collectArticles(client) {
  log.info("Fetching pages from Notion...");
  const pages = await client.queryDatabase();
  log.info(`  ${pages.length} page(s) found`);

  const articles = [];
  for (const page of pages) {
    const article = await pageToArticle(client, page);
    if (!article) {
      log.warn(`Skipping page ${page.id}: missing title`);
      continue;
    }
    articles.push(article);
  }

  let selected = articles;
  if (flags.slugs.length > 0) {
    const wanted = new Set(flags.slugs);
    selected = selected.filter((article) => wanted.has(article.slug) || wanted.has(article.translationKey));
    for (const slug of wanted) {
      if (!selected.some((article) => article.slug === slug || article.translationKey === slug)) {
        log.warn(`No Notion page matches --slug ${slug}`);
      }
    }
  }
  if (flags.newest) selected = newestGroups(selected, flags.newest);
  if (flags.limit) selected = selected.slice(0, flags.limit);
  return selected;
}

function publishedTime(article) {
  const time = new Date(article.published ?? 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Keep every language page of the N newest translation groups. Notion query
 * order is arbitrary, so `--newest` sorts by the Published date instead.
 */
function newestGroups(articles, count) {
  const groups = groupArticles(articles);
  const ranked = [...groups.entries()]
    .map(([key, group]) => ({ key, group, time: Math.max(...group.map(publishedTime)) }))
    .sort((left, right) => right.time - left.time)
    .slice(0, count);

  log.info(`  --newest ${count} selected: ${ranked.map((entry) => entry.key).join(", ")}`);
  return ranked.flatMap((entry) => entry.group);
}

function groupArticles(articles) {
  const groups = new Map();
  for (const article of articles) {
    const key = `${article.section}/${article.translationKey}`;
    const group = groups.get(key) ?? [];
    group.push(article);
    groups.set(key, group);
  }
  return groups;
}

async function syncArticleGroup(key, group, translation, counts) {
  const source = group.find((article) => article.lang === SOURCE_LANGUAGE) ?? group[0];
  log.info(`\n${key} — ${source.title}`);

  const sourceFile = contentFile(source.section, source.translationKey, source.lang);
  const sourceStatus = await writeArticle(
    sourceFile,
    frontmatterFor(source, { translationStatus: "original", sourceLang: undefined }),
    source.markdown,
    flags
  );
  counts[sourceStatus] = (counts[sourceStatus] ?? 0) + 1;
  log.info(`  ${source.lang}: ${sourceStatus}`);

  const explicitTarget = group.find((article) => article !== source);
  if (explicitTarget) {
    const targetFile = contentFile(explicitTarget.section, explicitTarget.translationKey, explicitTarget.lang);
    const status = await writeArticle(
      targetFile,
      frontmatterFor(explicitTarget, { translationStatus: "original", sourceLang: undefined }),
      explicitTarget.markdown,
      flags
    );
    counts[status] = (counts[status] ?? 0) + 1;
    log.info(`  ${explicitTarget.lang}: ${status} (authored in Notion)`);
    return;
  }

  if (!translation.enabled) {
    log.info(`  ${OTHER_LANGUAGE}: skipped (translation disabled)`);
    return;
  }

  const targetLang = OTHER_LANGUAGE;
  const targetFile = contentFile(source.section, source.translationKey, targetLang);
  const existing = await readIfExists(targetFile);

  if (existing && !flags.force && existing.data.translationStatus !== "machine") {
    log.info(`  ${targetLang}: kept existing ${existing.data.translationStatus ?? "local"} translation`);
    return;
  }

  if (existing && !flags.force) {
    const localEdited = new Date(existing.data.notionLastEdited ?? 0).getTime();
    if (localEdited >= new Date(source.lastEdited).getTime()) {
      counts.unchanged = (counts.unchanged ?? 0) + 1;
      log.info(`  ${targetLang}: unchanged`);
      return;
    }
  }

  if (flags.check) {
    log.info(`  ${targetLang}: would translate -> ${path.relative(process.cwd(), targetFile)}`);
    counts["would-write"] = (counts["would-write"] ?? 0) + 1;
    return;
  }

  let result;
  try {
    result = await translation.translateArticle(source, { from: source.lang, to: targetLang });
  } catch (error) {
    if (error instanceof TranslationBudgetError) {
      log.warn(`  ${targetLang}: deferred — ${error.message}`);
      return "budget";
    }
    log.error(`  ${targetLang}: translation failed — ${error.message}`);
    counts.skipped += 1;
    return;
  }

  const targetArticle = { ...source, lang: targetLang, title: result.title, description: result.description };
  const status = await writeArticle(
    targetFile,
    frontmatterFor(targetArticle, { translationStatus: "machine", sourceLang: source.lang }),
    result.markdown,
    flags
  );
  counts[status] = (counts[status] ?? 0) + 1;
  counts.translated += 1;
  log.info(`  ${targetLang}: ${status} (${result.segments} segment(s))`);
}

async function run() {
  const client = new NotionClient({
    token: process.env.NOTION_TOKEN,
    databaseId: process.env.NOTION_DATABASE_ID,
    dataSourceId: process.env.NOTION_DATA_SOURCE_ID,
    apiVersion: NOTION_API_VERSION
  });

  const articles = await collectArticles(client);
  const groups = groupArticles(articles);
  log.info(`  ${groups.size} translation group(s), source language: ${SOURCE_LANGUAGE}`);

  const translation = await createTranslationService();
  const counts = { created: 0, updated: 0, unchanged: 0, skipped: 0, "would-write": 0, translated: 0 };

  for (const [key, group] of groups) {
    const outcome = await syncArticleGroup(key, group, translation, counts);
    if (outcome === "budget") {
      counts.budget = true;
      break;
    }
  }

  let pruned = 0;
  if (flags.prune) pruned = await pruneArticles(articles, flags);
  await translation.flush();

  const stats = translation.stats();
  log.info("\nSummary");
  log.info(`  created: ${counts.created}, updated: ${counts.updated}, unchanged: ${counts.unchanged}`);
  log.info(
    `  skipped: ${counts.skipped}, would-write: ${counts["would-write"]}, translated targets: ${counts.translated}`
  );
  if (flags.prune) log.info(`  pruned: ${pruned}`);
  if (counts.budget) log.info("  translation paused: budget guard reached, run the sync again later");
  if (typeof stats.characters === "number") {
    log.info(
      `  translation: ${stats.segments} segment(s), ${stats.characters} character(s), ` +
        `${stats.requests} request(s), ${stats.calls} call(s), ${stats.cacheHits} cache hit(s)`
    );
    log.info(
      `  apps script calls today: ${stats.daily.calls}/${translation.limits.callsPerDay} ` +
        `(run limit ${translation.limits.callsPerRun})`
    );
  }
  log.info(`  notion requests: ${client.requests}`);

  if (flags.check && counts["would-write"] > 0) {
    log.info("\nChanges are pending. Run without --check to apply them.");
    process.exitCode = 1;
  }
}

run().catch((error) => {
  log.error(error?.message ?? String(error));
  if (error instanceof NotionError) {
    log.info("Check NOTION_TOKEN, NOTION_DATABASE_ID and that the integration is shared with the database.");
  }
  process.exitCode = 1;
});
