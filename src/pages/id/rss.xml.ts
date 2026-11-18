import type { APIRoute } from "astro";
import { buildFeed } from "../../utils/feeds";

export const GET: APIRoute = () => buildFeed("id");
