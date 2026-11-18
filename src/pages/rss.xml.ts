import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { defaultLanguage, languageMeta, site, siteUrl } from "../data/site";
import { getLatestPosts } from "../utils/content";
import { useTranslations } from "../utils/i18n";

/**
 * Root feed: the default language. Per-language feeds live at /id/rss.xml and
 * /en/rss.xml and are what the site itself links to.
 */
export const GET: APIRoute = async () => {
  const lang = defaultLanguage;
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
};
