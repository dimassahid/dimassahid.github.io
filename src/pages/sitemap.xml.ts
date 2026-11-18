import type { APIRoute } from "astro";
import { languages, siteUrl, type Lang } from "../data/site";
import { getPosts, sections, type Post } from "../utils/content";

const staticRoutes = ["", "about/", "portfolio/", "writeups/", "notes/", "contact/"];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function postKey(post: Post): string {
  return `${post.section}/${post.slug}`;
}

function postPath(post: Post): string {
  return `/${post.lang}/${post.section}/${post.slug}/`;
}

export const GET: APIRoute = async () => {
  const postsByLang = new Map<Lang, Post[]>();
  for (const lang of languages) {
    const posts = (await Promise.all(sections.map((section) => getPosts(section, lang)))).flat();
    postsByLang.set(lang, posts);
  }

  // Only routes backed by a real translation get hreflang alternates.
  const translated = new Map<string, Partial<Record<Lang, string>>>();
  for (const [lang, posts] of postsByLang) {
    for (const post of posts) {
      if (post.isFallback) continue;
      const bucket = translated.get(postKey(post)) ?? {};
      bucket[lang] = postPath(post);
      translated.set(postKey(post), bucket);
    }
  }

  const entries: Array<{ loc: string; lastmod?: Date; alternates: Partial<Record<Lang, string>> }> = [];

  for (const lang of languages) {
    for (const route of staticRoutes) {
      const alternates: Partial<Record<Lang, string>> = {};
      for (const code of languages) alternates[code] = `/${code}/${route}`;
      entries.push({ loc: `${siteUrl}/${lang}/${route}`, alternates });
    }

    for (const post of postsByLang.get(lang) ?? []) {
      entries.push({
        loc: `${siteUrl}${postPath(post)}`,
        lastmod: post.updatedDate ?? post.publishDate,
        alternates: translated.get(postKey(post)) ?? {}
      });
    }
  }

  const urls = entries
    .map((entry) => {
      const alternates = Object.entries(entry.alternates)
        .map(
          ([code, path]) =>
            `    <xhtml:link rel="alternate" hreflang="${code}" href="${escapeXml(`${siteUrl}${path}`)}" />`
        )
        .join("\n");

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `    <lastmod>${entry.lastmod.toISOString()}</lastmod>` : null,
        alternates || null,
        "  </url>"
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
};
