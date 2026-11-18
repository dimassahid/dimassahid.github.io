/**
 * Shared RSS feed builder.
 *
 * Notion: the per-language feeds used to live in `src/pages/[lang]/rss.xml.ts`.
 * With `trailingSlash: "always"` Astro serves parameterized endpoints at
 * `/en/rss.xml/`, which 404s against the `/en/rss.xml` links used by the layout
 * and footer. Static endpoints (`src/pages/en/rss.xml.ts`) keep the canonical
 * path in both `astro dev` and the static build, so the feed logic lives here
 * and is reused by two thin endpoints.
 */
import rss from "@astrojs/rss";
import { languageMeta, site, siteUrl, type Lang } from "../data/site";
import { getLatestPosts } from "./content";
import { useTranslations } from "./i18n";

export async function buildFeed(lang: Lang) {
  const t = useTranslations(lang);
  const posts = await getLatestPosts(lang);

  return rss({
    title: `${site.name} - ${t.writeups.title} & ${t.notes.title}`,
    description: site.description[lang],
    site: `${siteUrl}/${lang}/`,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      link: post.href,
      pubDate: post.publishDate,
      categories: [post.category, ...post.tags],
      author: site.email
    })),
    customData: `<language>${languageMeta[lang].htmlLang}</language>`,
    trailingSlash: true
  });
}
