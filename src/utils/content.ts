import { getCollection, type CollectionEntry } from "astro:content";
import { defaultLanguage, type Lang } from "../data/site";
import { localizePath } from "./i18n";
import { readingTime } from "./reading-time";

export type Section = "writeups" | "notes";
export type AnyEntry = CollectionEntry<"notes"> | CollectionEntry<"writeups">;

export interface Post {
  section: Section;
  /** Route slug, shared by every language version of the article. */
  slug: string;
  lang: Lang;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishDate: Date;
  updatedDate?: Date;
  featured: boolean;
  /** Demonstration article shipped with the template. */
  sample: boolean;
  readingTime: number;
  translationStatus: "original" | "machine" | "reviewed";
  sourceLang: Lang;
  /** True when this route shows another language because no translation exists. */
  isFallback: boolean;
  href: string;
  author?: string;
}

export interface PostDetail {
  post: Post;
  entry: AnyEntry;
  availableLanguages: Lang[];
}

export const sections: Section[] = ["writeups", "notes"];

function fileName(entry: AnyEntry): string {
  const id = entry.id.split("/").pop() ?? entry.id;
  return id.replace(/\.mdx?$/, "");
}

function routeSlug(entry: AnyEntry): string {
  return entry.data.translationKey?.trim() || fileName(entry);
}

async function loadEntries(section: Section): Promise<AnyEntry[]> {
  const entries: AnyEntry[] =
    section === "notes" ? await getCollection("notes") : await getCollection("writeups");
  return entries.filter((entry) => import.meta.env.DEV || entry.data.draft !== true);
}

function toPost(entry: AnyEntry, section: Section, lang: Lang, isFallback: boolean): Post {
  const slug = routeSlug(entry);
  return {
    section,
    slug,
    lang,
    title: entry.data.title,
    description: entry.data.description,
    category: entry.data.category,
    tags: [...entry.data.tags],
    publishDate: entry.data.publishDate,
    updatedDate: entry.data.updatedDate,
    featured: entry.data.featured,
    sample: entry.data.sample,
    readingTime: readingTime(entry.body),
    translationStatus: entry.data.translationStatus,
    sourceLang: entry.data.sourceLang ?? entry.data.lang,
    isFallback,
    href: localizePath(`/${section}/${slug}/`, lang),
    author: entry.data.author
  };
}

/** Group entries by translationKey and pick the best entry for the requested language. */
function groupByKey(entries: AnyEntry[]): Map<string, Map<Lang, AnyEntry>> {
  const groups = new Map<string, Map<Lang, AnyEntry>>();
  for (const entry of entries) {
    const key = routeSlug(entry);
    const bucket = groups.get(key) ?? new Map<Lang, AnyEntry>();
    const existing = bucket.get(entry.data.lang);
    if (!existing || entry.data.publishDate > existing.data.publishDate) {
      bucket.set(entry.data.lang, entry);
    }
    groups.set(key, bucket);
  }
  return groups;
}

function pickForLang(bucket: Map<Lang, AnyEntry>, lang: Lang): AnyEntry | undefined {
  return bucket.get(lang) ?? bucket.get(defaultLanguage) ?? bucket.get(lang === "id" ? "en" : "id");
}

/** Localized list for a single section, newest first. Missing translations fall back. */
export async function getPosts(section: Section, lang: Lang): Promise<Post[]> {
  const groups = groupByKey(await loadEntries(section));
  const posts: Post[] = [];
  for (const bucket of groups.values()) {
    const entry = pickForLang(bucket, lang);
    if (!entry) continue;
    posts.push(toPost(entry, section, lang, entry.data.lang !== lang));
  }
  return posts.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
}

/** Everything across both sections, newest first (used by the homepage and RSS). */
export async function getLatestPosts(lang: Lang, limit?: number): Promise<Post[]> {
  const all = (await Promise.all(sections.map((section) => getPosts(section, lang)))).flat();
  const sorted = all.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/** Single article plus the raw entry (needed for `entry.render()`). */
export async function getPost(section: Section, lang: Lang, slug: string): Promise<PostDetail | null> {
  const entries = await loadEntries(section);
  const bucket = groupByKey(entries.filter((entry) => routeSlug(entry) === slug)).values().next().value;
  if (!bucket) return null;

  const entry = pickForLang(bucket, lang);
  if (!entry) return null;

  return {
    post: toPost(entry, section, lang, entry.data.lang !== lang),
    entry,
    availableLanguages: [...bucket.keys()]
  };
}

/** Same category or shared tags, newest first. */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const posts = await getPosts(post.section, post.lang);
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      let score = candidate.category === post.category ? 2 : 0;
      score += candidate.tags.filter((tag) => post.tags.includes(tag)).length;
      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.publishDate.getTime() - a.candidate.publishDate.getTime())
    .slice(0, limit)
    .map((item) => item.candidate);
}

/** Neighbouring articles within the same section, for prev/next navigation. */
export async function getAdjacentPosts(
  post: Post
): Promise<{ previous: Post | null; next: Post | null }> {
  const posts = await getPosts(post.section, post.lang);
  const index = posts.findIndex((candidate) => candidate.slug === post.slug);
  return {
    previous: index >= 0 && index + 1 < posts.length ? posts[index + 1] ?? null : null,
    next: index > 0 ? posts[index - 1] ?? null : null
  };
}
