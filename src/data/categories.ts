import type { Lang } from "./site";

/**
 * Canonical category keys stored in article frontmatter / Notion.
 * Store the key in content, render the localized label in the UI.
 */
export const categories = {
  "web-security": { id: "Keamanan Web", en: "Web Security" },
  "api-security": { id: "Keamanan API", en: "API Security" },
  "mobile-security": { id: "Keamanan Mobile", en: "Mobile Security" },
  "reverse-engineering": { id: "Reverse Engineering", en: "Reverse Engineering" },
  cryptography: { id: "Kriptografi", en: "Cryptography" },
  "network-security": { id: "Keamanan Jaringan", en: "Network Security" },
  "security-tools": { id: "Tool Keamanan", en: "Security Tools" },
  "vulnerability-research": { id: "Riset Kerentanan", en: "Vulnerability Research" },
  "application-security": { id: "Keamanan Aplikasi", en: "Application Security" },
  automation: { id: "Otomasi", en: "Automation" },
  "security-awareness": { id: "Kesadaran Keamanan", en: "Security Awareness" },
  "infrastructure-security": { id: "Keamanan Infrastruktur", en: "Infrastructure Security" },
  "lab-writeups": { id: "Writeup Lab", en: "Lab Writeups" },
  general: { id: "Umum", en: "General" }
} as const;

export type CategoryKey = keyof typeof categories;

/**
 * Notion select values are free-form, so map unknown values to a stable slug
 * and render the raw value if no translation exists.
 */
export function categoryKeyFromLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function categoryLabel(key: string, lang: Lang): string {
  const known = categories[key as CategoryKey];
  if (known) return known[lang];
  return key
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const categoryKeys = Object.keys(categories) as CategoryKey[];
