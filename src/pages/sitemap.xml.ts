import type { APIRoute } from "astro";
import { defaultLanguage, siteUrl } from "../data/site";
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

function postPath(post: Post): string {
  return `/${post.section}/${post.slug}/`;
}

export const GET: APIRoute = async () => {
  const posts = (await Promise.all(sections.map((section) => getPosts(section, defaultLanguage)))).flat();

  const entries: Array<{ loc: string; lastmod?: Date }> = [];

  for (const route of staticRoutes) {
    entries.push({ loc: `${siteUrl}/${route}` });
  }

  for (const post of posts) {
    entries.push({
      loc: `${siteUrl}${postPath(post)}`,
      lastmod: post.updatedDate ?? post.publishDate
    });
  }

  const urls = entries
    .map((entry) =>
      [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `    <lastmod>${entry.lastmod.toISOString()}</lastmod>` : null,
        "  </url>"
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
};
