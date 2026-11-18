/**
 * Reading time + lightweight text helpers shared by pages and scripts.
 */

const DEFAULT_WPM = 200;

/** Strip Markdown syntax so only prose words are counted. */
export function plainText(markdown: string | undefined): string {
  if (!markdown) return "";
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, " ")
    .replace(/[*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(markdown: string | undefined): number {
  const text = plainText(markdown);
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
}

/** Whole minutes, never below 1. */
export function readingTime(markdown: string | undefined, wordsPerMinute = DEFAULT_WPM): number {
  const words = wordCount(markdown);
  return Math.max(1, Math.round(words / wordsPerMinute));
}

/** Shorten plain text at a word boundary without cutting mid-word. */
export function truncate(text: string, maxLength = 160): string {
  const clean = plainText(text);
  if (clean.length <= maxLength) return clean;
  const slice = clean.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  return `${lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice}...`;
}
