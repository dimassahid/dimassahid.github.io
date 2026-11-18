/**
 * Markdown-aware segmentation for machine translation.
 *
 * The goal is boring but important: never translate code, URLs, inline code or
 * table separators, and never lose list/heading/quote markers. Everything else
 * is sent line by line (frontmatter fields separately).
 */
const FENCE_RE = /^\s*(```|~~~)/;
const PREFIX_RE = /^(\s*(?:>\s*)*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+))/;
const TOKEN_RE = /`[^`\n]+`|\]\([^)\s]+\)|https?:\/\/[^\s)>\]]+/g;
const HAS_LETTER = /\p{L}/u;

function createProtector() {
  const tokens = [];
  return {
    protect(text) {
      return text.replace(TOKEN_RE, (match) => {
        const token = `[[[T${tokens.length}]]]`;
        tokens.push(match);
        return token;
      });
    },
    restore(text) {
      return text.replace(/\[\[\[T(\d+)\]\]\]/g, (match, index) => tokens[Number(index)] ?? match);
    }
  };
}

function splitPrefix(line) {
  const match = line.match(PREFIX_RE);
  if (!match) return { prefix: "", text: line };
  return { prefix: match[1], text: line.slice(match[1].length) };
}

function isTableRow(trimmed) {
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 2;
}

/**
 * @param {string} markdown
 * @param {(texts: string[], options: {from: string, to: string}) => Promise<string[]>} translateMany
 */
export async function translateMarkdown(markdown, translateMany, { from, to }) {
  const lines = markdown.split("\n");
  const protector = createProtector();
  const jobs = [];
  const plan = new Array(lines.length).fill(null);
  let insideFence = false;

  lines.forEach((line, index) => {
    if (FENCE_RE.test(line)) {
      insideFence = !insideFence;
      return;
    }
    if (insideFence) return;

    const trimmed = line.trim();
    if (!trimmed || !HAS_LETTER.test(trimmed)) return;
    if (trimmed.startsWith("<")) return;

    if (isTableRow(trimmed)) {
      const cells = line.split("|");
      const cellJobs = [];
      for (let cellIndex = 1; cellIndex < cells.length - 1; cellIndex += 1) {
        const inner = cells[cellIndex].trim();
        if (!inner || !HAS_LETTER.test(inner)) continue;
        const job = { text: protector.protect(inner) };
        jobs.push(job);
        cellJobs.push({ cellIndex, job });
      }
      if (cellJobs.length > 0) plan[index] = { kind: "table", jobs: cellJobs };
      return;
    }

    const { prefix, text } = splitPrefix(line);
    if (!HAS_LETTER.test(text)) return;
    const job = { text: protector.protect(text) };
    jobs.push(job);
    plan[index] = { kind: "line", prefix, job };
  });

  if (jobs.length === 0) return { markdown, segments: 0, characters: 0 };

  const characters = jobs.reduce((total, job) => total + job.text.length, 0);
  const translated = await translateMany(
    jobs.map((job) => job.text),
    { from, to }
  );

  jobs.forEach((job, index) => {
    job.translated = protector.restore(translated[index] ?? job.text);
  });

  const output = lines.map((line, index) => {
    const entry = plan[index];
    if (!entry) return line;
    if (entry.kind === "line") return `${entry.prefix}${entry.job.translated}`;
    const cells = line.split("|");
    for (const { cellIndex, job } of entry.jobs) cells[cellIndex] = ` ${job.translated} `;
    return cells.join("|");
  });

  return { markdown: output.join("\n"), segments: jobs.length, characters };
}

/** Translate a small set of frontmatter fields (title, description, ...). */
export async function translateFields(fields, translateMany, { from, to }) {
  const keys = Object.keys(fields).filter(
    (key) => typeof fields[key] === "string" && fields[key].trim() && HAS_LETTER.test(fields[key])
  );

  if (keys.length === 0) return { values: { ...fields }, characters: 0 };

  const translated = await translateMany(
    keys.map((key) => fields[key]),
    { from, to }
  );

  const values = { ...fields };
  keys.forEach((key, index) => {
    values[key] = translated[index] ?? fields[key];
  });

  return { values, characters: keys.reduce((total, key) => total + fields[key].length, 0) };
}
