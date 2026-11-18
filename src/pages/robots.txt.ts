import type { APIRoute } from "astro";
import { site, siteUrl } from "../data/site";

export const GET: APIRoute = () => {
  const body = `# robots.txt for ${site.name}
User-agent: *
Allow: /

# Machine-generated build artefacts are not useful to crawlers.
Disallow: /_astro/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
};
