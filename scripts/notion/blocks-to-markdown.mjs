/**
 * Notion blocks -> Markdown.
 *
 * Only the block types that make sense for technical articles are supported;
 * anything unknown is flattened to its children (or ignored) instead of
 * failing the whole sync. Nested children are fetched lazily and limited to
 * three levels so a runaway page cannot explode into thousands of requests.
 */
const MAX_DEPTH = 3;

export function richTextToMarkdown(richText = []) {
  return richText
    .map((item) => {
      const text = item.plain_text ?? item.text?.content ?? "";
      if (!text) return "";
      let output = text;

      if (item.annotations?.code) output = `\`${output}\``;
      if (item.annotations?.bold) output = `**${output}**`;
      if (item.annotations?.italic) output = `*${output}*`;
      if (item.annotations?.strikethrough) output = `~~${output}~~`;

      const href = item.href ?? item.text?.link?.url;
      if (href) output = `[${output}](${href})`;

      return output;
    })
    .join("");
}

export function plainText(richText = []) {
  return richText.map((item) => item.plain_text ?? "").join("");
}

function indent(markdown, spaces) {
  const pad = " ".repeat(spaces);
  return markdown
    .split("\n")
    .map((line) => (line.trim() ? `${pad}${line}` : line))
    .join("\n");
}

function codeLanguage(block) {
  const language = block.code?.language ?? "text";
  return language === "plain text" ? "text" : language;
}

function tableToMarkdown(rows) {
  const cells = rows.map((row) =>
    (row.table_row?.cells ?? []).map((cell) => plainText(cell).replace(/\|/g, "\\|").trim())
  );
  if (cells.length === 0) return "";
  const width = Math.max(...cells.map((row) => row.length));
  const padded = cells.map((row) => [...row, ...Array(width - row.length).fill("")]);
  const header = `| ${padded[0].join(" | ")} |`;
  const separator = `| ${padded[0].map(() => "---").join(" | ")} |`;
  const body = padded.slice(1).map((row) => `| ${row.join(" | ")} |`);
  return [header, separator, ...body].join("\n") + "\n\n";
}

export async function blocksToMarkdown(blocks, { fetchChildren, depth = 0 } = {}) {
  if (!blocks || blocks.length === 0) return "";
  const parts = [];

  for (const block of blocks) {
    const type = block.type;
    const data = block[type] ?? {};
    const children =
      block.has_children && depth < MAX_DEPTH && fetchChildren ? await fetchChildren(block.id) : [];
    const childMarkdown = children.length
      ? await blocksToMarkdown(children, { fetchChildren, depth: depth + 1 })
      : "";

    switch (type) {
      case "paragraph": {
        const text = richTextToMarkdown(data.rich_text);
        parts.push(text ? `${text}\n\n` : "");
        break;
      }
      case "heading_1":
      case "heading_2":
      case "heading_3": {
        const level = Number(type.slice(-1));
        parts.push(`${"#".repeat(level)} ${richTextToMarkdown(data.rich_text)}\n\n`);
        break;
      }
      case "bulleted_list_item":
      case "numbered_list_item": {
        const marker = type === "numbered_list_item" ? "1." : "-";
        const line = `${marker} ${richTextToMarkdown(data.rich_text)}`;
        parts.push(childMarkdown ? `${line}\n${indent(childMarkdown.trimEnd(), 2)}\n\n` : `${line}\n`);
        break;
      }
      case "to_do": {
        const box = data.checked ? "[x]" : "[ ]";
        parts.push(`- ${box} ${richTextToMarkdown(data.rich_text)}\n`);
        break;
      }
      case "toggle": {
        const summary = richTextToMarkdown(data.rich_text);
        parts.push(`<details>\n<summary>${summary}</summary>\n\n${childMarkdown.trim()}\n\n</details>\n\n`);
        break;
      }
      case "quote":
      case "callout": {
        const text = richTextToMarkdown(data.rich_text);
        const icon = data.icon?.emoji ? `${data.icon.emoji} ` : "";
        parts.push(`> ${icon}${text}\n\n`);
        break;
      }
      case "code": {
        const code = plainText(data.rich_text);
        parts.push(`\`\`\`${codeLanguage(block)}\n${code}\n\`\`\`\n\n`);
        break;
      }
      case "divider":
        parts.push("---\n\n");
        break;
      case "image": {
        const url = data.type === "external" ? data.external?.url : data.file?.url;
        const caption = plainText(data.caption);
        if (url) parts.push(`![${caption}](${url})\n\n`);
        break;
      }
      case "bookmark":
      case "link_preview":
      case "embed": {
        const url = data.url ?? "";
        if (url) parts.push(`[${plainText(data.caption) || url}](${url})\n\n`);
        break;
      }
      case "table": {
        if (children.length > 0) parts.push(tableToMarkdown(children));
        break;
      }
      case "table_row":
        break;
      case "equation": {
        const expression = data.expression ?? "";
        if (expression) parts.push(`$$\n${expression}\n$$\n\n`);
        break;
      }
      default: {
        if (childMarkdown.trim()) parts.push(childMarkdown);
        else if (data.rich_text) {
          const text = richTextToMarkdown(data.rich_text);
          if (text) parts.push(`${text}\n\n`);
        }
      }
    }
  }

  return parts.join("");
}
