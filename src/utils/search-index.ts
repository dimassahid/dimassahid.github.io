/**
 * Shared client-side search index builder.
 *
 * Emitted as a single static endpoint (`src/pages/search-index.json.ts`) so the
 * client can fetch `/search-index.json`. A parameterized endpoint would be
 * served at `/search-index.json/` in dev because of `trailingSlash: "always"`.
 */
import { type Lang } from "../data/site";
import { getPost, getPosts, sections, type Post } from "./content";

export interface SearchIndexEntry {
  slug: string;
  text: string;
}

/** Strip markdown syntax so the client only indexes words people search for. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function buildSearchIndex(lang: Lang): Promise<SearchIndexEntry[]> {
  const posts: Post[] = (await Promise.all(sections.map((section) => getPosts(section, lang)))).flat();
  const index: SearchIndexEntry[] = [];

  for (const post of posts) {
    const detail = await getPost(post.section, post.lang, post.slug);
    const body = detail ? plainText(detail.entry.body ?? "") : "";
    index.push({
      slug: `${post.section}/${post.slug}`,
      text: plainText(`${post.title} ${post.description} ${post.tags.join(" ")} ${body}`)
    });
  }

  return index;
}
