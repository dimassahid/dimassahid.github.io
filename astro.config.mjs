import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

// Astro reads its config before Vite loads .env files, so load them explicitly.
// Only build-time/server-side values are read here; nothing is exposed to the client.
const mode = process.env.NODE_ENV === "development" ? "development" : "production";
const env = loadEnv(mode, process.cwd(), "");
// Default matches the production deploy target (GitHub Pages user site).
// Set SITE_URL in .env (local) or in the workflow / host environment to override.
const siteUrl = (process.env.SITE_URL || env.SITE_URL || "https://dimassahid.github.io").replace(/\/+$/, "");

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: siteUrl,
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory"
  },
  markdown: {
    shikiConfig: {
      // Dual Shiki themes; src/styles/global.css selects the active one per theme.
      themes: {
        light: "github-light",
        dark: "github-dark-default"
      },
      wrap: false
    }
  },
  devToolbar: {
    enabled: false
  },
  vite: {
    server: {
      allowedHosts: [".trycloudflare.com"]
    }
  }
});