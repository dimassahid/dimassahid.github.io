#!/usr/bin/env node
/**
 * Manual probe for the Google Apps Script translation endpoint.
 *
 * Usage:
 *   npm run translate:probe -- --health
 *   npm run translate:probe -- "Hello world"
 *   npm run translate:probe -- --from en --to id "Hello world"
 *   npm run translate:probe -- --markdown src/content/writeups/reset.en.md --no-cache
 *
 * `--no-cache` neither reads nor writes src/data/translation-cache, so the probe
 * spends real Google calls without polluting the committed cache.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { createTranslationService } from "./translation/index.mjs";

const args = process.argv.slice(2);
const VALUE_FLAGS = new Set(["--from", "--to", "--markdown"]);
const positional = [];

for (let index = 0; index < args.length; index += 1) {
  if (VALUE_FLAGS.has(args[index])) {
    index += 1;
    continue;
  }
  if (args[index].startsWith("--")) continue;
  positional.push(args[index]);
}

const valueOf = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : fallback;
};

const from = valueOf("--from", "en");
const to = valueOf("--to", "id");
const markdownPath = valueOf("--markdown");
const noCache = args.includes("--no-cache");

function fail(message) {
  console.error(`error: ${message}`);
  process.exitCode = 1;
}

async function health() {
  const url = String(process.env.APPS_SCRIPT_TRANSLATE_URL ?? "").trim();
  if (!url) {
    fail("APPS_SCRIPT_TRANSLATE_URL is not set in .env.");
    return;
  }

  const response = await fetch(url, { headers: { accept: "application/json" } });
  const body = await response.text();
  console.log(`GET ${url}`);
  console.log(`  status: ${response.status}`);
  console.log(`  body:   ${body.slice(0, 400)}`);

  if (!response.ok || !/"ok"\s*:\s*true/.test(body)) {
    fail("deployment is not healthy. Paste the latest Code.gs, then Deploy -> Manage deployments -> Edit -> New version.");
  }
}

function fences(markdown) {
  return markdown.match(/```[\s\S]*?```/g) ?? [];
}

function reportIntegrity(source, translated) {
  const sourceFences = fences(source);
  const translatedFences = fences(translated);
  const fencesOk = sourceFences.length === translatedFences.length && sourceFences.every((block, index) => block === translatedFences[index]);

  const urls = (text) => text.match(/https?:\/\/[^\s)>\]]+/g) ?? [];
  const sourceUrls = urls(source);
  const translatedUrls = urls(translated);
  const urlsOk = sourceUrls.length === translatedUrls.length && sourceUrls.every((url, index) => url === translatedUrls[index]);

  const sourceTicks = (source.match(/`/g) ?? []).length;
  const translatedTicks = (translated.match(/`/g) ?? []).length;
  const ticksOk = sourceTicks === translatedTicks;

  const line = (label, ok, detail) => console.log(`  ${ok ? "OK  " : "FAIL"} ${label}${detail ? ` (${detail})` : ""}`);
  console.log("\nintegrity:");
  line("fenced code blocks untouched", fencesOk, `${sourceFences.length} block(s)`);
  line("URLs untouched", urlsOk, `${sourceUrls.length} URL(s)`);
  line("inline code markers untouched", ticksOk, `${sourceTicks} backtick(s)`);

  if (!fencesOk || !urlsOk || !ticksOk) process.exitCode = 1;
}

function printStats(service, elapsedMs) {
  const stats = service.stats();
  console.log("\nusage:");
  console.log(`  provider:  ${service.provider ?? "none"}`);
  console.log(`  seconds:   ${(elapsedMs / 1000).toFixed(1)}`);
  console.log(`  segments:  ${stats.segments ?? 0}`);
  console.log(`  characters:${String(stats.characters ?? 0).padStart(7)}`);
  console.log(`  requests:  ${stats.requests ?? 0}`);
  console.log(`  calls:     ${stats.calls ?? 0}`);
  console.log(`  cache hits:${stats.cacheHits ?? 0}`);
  if (stats.daily) console.log(`  calls today: ${stats.daily.calls}/${service.limits?.callsPerDay ?? "?"}`);
}

async function run() {
  if (args.includes("--health")) {
    await health();
    return;
  }

  const env = { ...process.env, TRANSLATION_ENABLED: "true", TRANSLATION_PROVIDER: "apps-script" };
  if (noCache) env.TRANSLATION_CACHE_ENABLED = "false";
  if (!env.APPS_SCRIPT_TRANSLATE_URL || !env.APPS_SCRIPT_TRANSLATE_TOKEN) {
    fail("set APPS_SCRIPT_TRANSLATE_URL and APPS_SCRIPT_TRANSLATE_TOKEN in .env first.");
    return;
  }

  const service = await createTranslationService({ env });
  const started = Date.now();

  if (markdownPath) {
    const file = path.resolve(markdownPath);
    const parsed = matter(await readFile(file, "utf8"));
    const result = await service.translateArticle(
      { title: parsed.data.title ?? "", description: parsed.data.description ?? "", markdown: parsed.content },
      { from, to }
    );
    await service.flush();

    console.log(`file: ${path.relative(process.cwd(), file)}`);
    console.log(`direction: ${from} -> ${to}${noCache ? " (cache disabled)" : ""}`);
    console.log(`\ntitle: ${parsed.data.title}\n   -> ${result.title}`);
    console.log(`description: ${parsed.data.description}\n          -> ${result.description}`);
    reportIntegrity(parsed.content, result.markdown);

    console.log("\npreview:");
    for (const line of result.markdown.split("\n").filter((value) => value.trim() && !value.trim().startsWith("```")).slice(0, 8)) {
      console.log(`  ${line}`);
    }

    printStats(service, Date.now() - started);
    return;
  }

  const texts = positional.length > 0 ? positional : ["Hello world"];
  const translated = await service.translateMany(texts, { from, to });
  await service.flush();

  console.log(`direction: ${from} -> ${to}${noCache ? " (cache disabled)" : ""}`);
  texts.forEach((text, index) => console.log(`  ${text}\n    -> ${translated[index]}`));
  printStats(service, Date.now() - started);
}

run().catch((error) => {
  fail(error?.message ?? String(error));
});
