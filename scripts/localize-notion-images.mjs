#!/usr/bin/env node
/**
 * Copy the images referenced by the synced Markdown into public/images/<slug>/
 * and rewrite the links to those local paths.
 *
 * Notion serves images from signed S3 URLs that expire after roughly an hour and
 * the site CSP only allows `img-src 'self' data:`, so remote links never render
 * in production even though they work on the dev server.
 *
 * Usage:
 *   npm run images:notion                 # download missing images + rewrite links
 *   npm run images:notion -- --check      # report pending downloads, write nothing
 *   npm run images:notion -- --slug reset
 *   npm run images:notion -- --force      # re-download even when a local copy exists
 *
 * A link is only rewritten after its download succeeded, so a failed run leaves
 * the Markdown untouched. Files are named from a hash of the remote path, which
 * keeps the command idempotent: re-running it reuses what is already on disk.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CONTENT_ROOT = path.resolve("src/content");
const IMAGE_ROOT = path.resolve("public/images");
const SECTIONS = ["writeups", "notes"];
const IMAGE_PATTERN = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
const CONCURRENCY = 16;
const MAX_BYTES = 25 * 1024 * 1024;
const RETRIES = 4;
const REQUEST_TIMEOUT_MS = 15_000;

const args = process.argv.slice(2);
const flags = {
  check: args.includes("--check") || args.includes("--dry-run"),
  force: args.includes("--force")
};

function flagValue(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

const ONLY_SLUG = flagValue("--slug");
const LIMIT = flagValue("--limit") ? Number(flagValue("--limit")) : Number.POSITIVE_INFINITY;

const MIME_EXTENSIONS = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/gif", ".gif"],
  ["image/webp", ".webp"],
  ["image/svg+xml", ".svg"],
  ["image/avif", ".avif"],
  ["image/bmp", ".bmp"]
]);

function digestOf(url) {
  return createHash("sha1").update(new URL(url).pathname).digest("hex").slice(0, 12);
}

function extensionOf(url, contentType = "") {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  if (/^\.(png|jpe?g|gif|webp|svg|avif|bmp)$/.test(extension)) {
    return extension === ".jpeg" ? ".jpg" : extension;
  }
  const mime = contentType.split(";")[0].trim().toLowerCase();
  return MIME_EXTENSIONS.get(mime) ?? ".png";
}

async function readArticles() {
  const articles = [];

  for (const section of SECTIONS) {
    const directory = path.join(CONTENT_ROOT, section);
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue;
      const slug = entry.name.replace(/\.(id|en)\.mdx?$/, "");
      if (ONLY_SLUG && slug !== ONLY_SLUG) continue;
      const file = path.join(directory, entry.name);
      articles.push({ section, slug, file, content: await readFile(file, "utf8") });
    }
  }

  return articles;
}

async function fetchImage(url) {
  let lastError;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0) throw new Error("empty response");
      if (buffer.length > MAX_BYTES) throw new Error("image is larger than 25 MB");
      return { buffer, contentType: response.headers.get("content-type") ?? "" };
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError;
}

const stats = {
  articles: 0,
  references: 0,
  downloaded: 0,
  reused: 0,
  wouldDownload: 0,
  failed: 0,
  bytes: 0
};
const failures = [];
let remaining = LIMIT;

async function localize(article) {
  const urls = [...new Set([...article.content.matchAll(IMAGE_PATTERN)].map((match) => match[2]))];
  if (urls.length === 0) return;

  stats.articles += 1;
  stats.references += urls.length;

  const directory = path.join(IMAGE_ROOT, article.slug);
  const localPrefix = `/images/${article.slug}`;
  const existing = new Set(await readdir(directory).catch(() => []));
  const replacements = new Map();
  const queue = [];
  let reusedHere = 0;

  for (const url of urls) {
    const digest = digestOf(url);
    const cached = [...existing].find((name) => name.startsWith(`${digest}.`));
    if (cached && !flags.force) {
      replacements.set(url, `${localPrefix}/${cached}`);
      stats.reused += 1;
      reusedHere += 1;
      continue;
    }
    if (remaining <= 0) continue;
    remaining -= 1;
    queue.push({ url, digest });
  }

  if (queue.length > 0 && flags.check) {
    stats.wouldDownload += queue.length;
  } else {
    let index = 0;
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (index < queue.length) {
        const item = queue[index];
        index += 1;
        try {
          const { buffer, contentType } = await fetchImage(item.url);
          const name = `${item.digest}${extensionOf(item.url, contentType)}`;
          await mkdir(directory, { recursive: true });
          await writeFile(path.join(directory, name), buffer);
          replacements.set(item.url, `${localPrefix}/${name}`);
          stats.downloaded += 1;
          stats.bytes += buffer.length;
        } catch (error) {
          stats.failed += 1;
          failures.push({ url: item.url, reason: error?.message ?? String(error) });
        }
      }
    });
    await Promise.all(workers);
  }

  if (replacements.size === 0) return;

  const updated = article.content.replace(IMAGE_PATTERN, (full, alt, url) => {
    const local = replacements.get(url);
    return local ? `![${alt}](${local})` : full;
  });
  if (updated === article.content) return;

  if (!flags.check) await writeFile(article.file, updated, "utf8");
  const pending = flags.check ? `would download ${queue.length}` : `downloaded ${queue.length}`;
  console.log(`${article.section}/${article.slug}: ${urls.length} reference(s), ${pending}, ${reusedHere} reused`);
}

function printSummary() {
  console.log("\nSummary");
  console.log(`  articles with remote images: ${stats.articles}`);
  console.log(`  image references: ${stats.references}`);
  if (flags.check) {
    console.log(`  reused local files: ${stats.reused}, would download: ${stats.wouldDownload}`);
  } else {
    console.log(
      `  downloaded: ${stats.downloaded} (${(stats.bytes / 1048576).toFixed(1)} MB), reused: ${stats.reused}, failed: ${stats.failed}`
    );
  }

  for (const failure of failures.slice(0, 15)) {
    console.log(`  failed: ${failure.reason} -> ${failure.url.slice(0, 80)}...`);
  }
  if (failures.length > 15) console.log(`  ... ${failures.length - 15} more failure(s)`);
}

async function main() {
  const articles = await readArticles();
  if (articles.length === 0) {
    console.log("No Markdown articles found in src/content. Run npm run sync:notion first.");
    return;
  }

  for (const article of articles) {
    await localize(article);
  }

  printSummary();

  if (flags.check && stats.wouldDownload > 0) {
    console.log("\nChanges are pending. Run without --check to download them.");
  }

  if (stats.failed > 0) {
    console.log("\nSome downloads failed. Signed Notion URLs expire after about an hour: run npm run sync:notion to refresh them, then retry.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`error: ${error?.stack ?? error}`);
  process.exitCode = 1;
});
