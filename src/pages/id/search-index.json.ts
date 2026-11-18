import type { APIRoute } from "astro";
import { buildSearchIndex } from "../../utils/search-index";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildSearchIndex("id")), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
