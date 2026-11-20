#!/usr/bin/env node
/**
 * Content validator for the article collections.
 *
 * The site is published in English from the site root; Indonesian articles are
 * kept in src/content as an archive and are not routed. Errors fail the run,
 * warnings are printed but allowed (for example an archived article that has no
 * English counterpart and therefore never appears on the site).
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const CONTENT_ROOT = path.resolve("src/content");
const SECTIONS = ["writeups", "notes"];
/** Languages that may appear in frontmatter (Indonesian is kept as an archive). */
const LANGS = ["id", "en"];
/** Languages served by the site; routes are built at the root, without a prefix. */
const ROUTED_LANGS = ["en"];
const PAGES = ["about", "portfolio", "contact"];
const ALLOWED_FIELDS = new Set([
  "title",
  "description",
  "lang",
  "translationKey",
  "category",
  "tags",
  "publishDate",
  "updatedDate",
  "draft",
  "featured",
  "sample",
  "author",
  "cover",
  "translationStatus",
  "sourceLang",
  "notionId",
  "notionUrl",
  "notionLastEdited"
]);

const errors = [];
const warnings = [];

const report = {
  error: (message) => errors.push(message),
  warn: (message) => warnings.push(message)
};

function relative(file) {
  return path.relative(process.cwd(), file).replace(/\\/g, "/");
}

function baseName(fileName) {
  return fileName.replace(/\.mdx?$/, "");
}

function translationKeyOf(article) {
  return article.data.translationKey?.trim() || baseName(article.name);
}

async function loadCategoryKeys() {
  try {
    const source = await readFile(path.resolve("src/data/categories.ts"), "utf8");
    const keys = [...source.matchAll(/^\s{2}"?([a-z0-9-]+)"?:\s*\{/gm)].map((match) => match[1]);
    return keys.length > 0 ? new Set(keys) : null;
  } catch {
    return null;
  }
}

async function loadArticles() {
  const articles = [];

  for (const section of SECTIONS) {
    const directory = path.join(CONTENT_ROOT, section);
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      report.warn(`No content directory for "${section}" (${relative(directory)}).`);
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue;
      const file = path.join(directory, entry.name);
      const parsed = matter(await readFile(file, "utf8"));
      articles.push({ section, file, name: entry.name, data: parsed.data, content: parsed.content });
    }
  }

  return articles;
}

function checkFrontmatter(article, categoryKeys) {
  const file = relative(article.file);
  const data = article.data;

  for (const field of ["title", "description"]) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      report.error(`${file}: "${field}" is required and must be a non-empty string.`);
    }
  }

  if (!LANGS.includes(data.lang)) {
    report.error(`${file}: lang must be one of ${LANGS.join(", ")} (got ${JSON.stringify(data.lang)}).`);
  }

  const suffix = baseName(article.name).split(".").pop();
  if (suffix !== data.lang) {
    report.error(`${file}: filename suffix ".${suffix}" does not match lang "${data.lang}".`);
  }

  const expected = `${translationKeyOf(article)}.${data.lang}`;
  if (baseName(article.name) !== expected) {
    report.warn(`${file}: expected filename "${expected}.md" for translationKey "${translationKeyOf(article)}".`);
  }

  const publishDate = new Date(data.publishDate);
  if (Number.isNaN(publishDate.getTime())) {
    report.error(`${file}: publishDate is missing or invalid.`);
  } else if (publishDate.getTime() > Date.now() + 86_400_000 && data.draft !== true) {
    report.warn(`${file}: publishDate is in the future; the article will show as newest content.`);
  }

  if (data.updatedDate && Number.isNaN(new Date(data.updatedDate).getTime())) {
    report.error(`${file}: updatedDate is invalid.`);
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    report.error(`${file}: tags must be a list.`);
  }

  if (categoryKeys && !categoryKeys.has(data.category ?? "general")) {
    report.warn(`${file}: category "${data.category}" is not in src/data/categories.ts; the raw key will be rendered.`);
  }

  if (data.translationStatus && data.translationStatus !== "original" && !data.sourceLang) {
    report.warn(`${file}: translationStatus "${data.translationStatus}" without sourceLang.`);
  }

  for (const field of Object.keys(data)) {
    if (!ALLOWED_FIELDS.has(field)) {
      report.warn(`${file}: frontmatter key "${field}" is not part of the content schema.`);
    }
  }

  if (data.sample === true && article.section === "writeups" && !/ethic|etika/i.test(article.content)) {
    report.warn(`${file}: demonstration writeups should keep an ethics note.`);
  }

  if (/\b(TODO|FIXME)\b|lorem ipsum/i.test(article.content)) {
    report.warn(`${file}: contains placeholder text (TODO/FIXME/lorem ipsum).`);
  }

  return { key: translationKeyOf(article), lang: data.lang };
}

function buildRoutes(articles) {
  const routes = new Set();
  routes.add("/");
  for (const page of PAGES) routes.add(`/${page}`);
  for (const section of SECTIONS) {
    routes.add(`/${section}`);
    const published = articles.filter(
      (item) => item.section === section && ROUTED_LANGS.includes(item.data.lang)
    );
    for (const article of published) {
      routes.add(`/${section}/${translationKeyOf(article)}`);
    }
  }
  return routes;
}

function checkLinks(article, routes) {
  // Archived translations are not built, so their links are not checked.
  if (!ROUTED_LANGS.includes(article.data.lang)) return;

  const file = relative(article.file);
  const matches = article.content.matchAll(/\]\((\/[^)\s#?]*)/g);
  for (const match of matches) {
    const target = match[1].replace(/\/+$/, "") || "/";
    if (target.startsWith("/images/") || target.startsWith("/_") || target === "/favicon.svg") continue;
    if (target === "" || target === "/") continue;
    if (!routes.has(target)) {
      report.warn(`${file}: internal link "${match[1]}" does not match a known route.`);
    }
  }
}

function checkGroups(articles) {
  const groups = new Map();
  const seen = new Map();

  for (const article of articles) {
    const key = `${article.section}/${translationKeyOf(article)}`;
    const langs = groups.get(key) ?? new Set();
    langs.add(article.data.lang);
    groups.set(key, langs);

    const identity = `${key}:${article.data.lang}`;
    if (seen.has(identity)) {
      report.error(`Duplicate article for ${identity}: ${relative(seen.get(identity))} and ${relative(article.file)}.`);
    } else {
      seen.set(identity, article.file);
    }
  }

  for (const [key, langs] of groups) {
    if (!ROUTED_LANGS.some((lang) => langs.has(lang))) {
      const archived = [...langs].join(", ");
      report.warn(`${key}: archived in ${archived} only; no English version, so it is not published.`);
    }
  }

  return groups;
}

async function main() {
  const categoryKeys = await loadCategoryKeys();
  const articles = await loadArticles();

  if (articles.length === 0) {
    report.error("No articles found in src/content/writeups or src/content/notes.");
  }

  for (const section of SECTIONS) {
    if (!articles.some((article) => article.section === section)) {
      report.warn(`Section "${section}" has no articles.`);
    }
  }

  for (const article of articles) {
    checkFrontmatter(article, categoryKeys);
  }

  checkGroups(articles);
  const routes = buildRoutes(articles);
  for (const article of articles) {
    checkLinks(article, routes);
  }

  console.log(`Checked ${articles.length} article file(s) in ${SECTIONS.join(", ")}.`);

  for (const message of warnings) console.warn(`warning: ${message}`);
  for (const message of errors) console.error(`error: ${message}`);

  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);

  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("Content is valid.");
}

main().catch((error) => {
  console.error(`error: ${error?.stack ?? error}`);
  process.exitCode = 1;
});
