#!/usr/bin/env node

// ============================================================================
// AI Daily Digest — Markdown to HTML Converter
// ============================================================================
// Converts a Markdown digest file into a styled HTML file.
//
// Usage:
//   node generate-html.js <input.md> [output.html]
//   node generate-html.js --dir <directory>        (convert all .md in dir)
//
// If output path is omitted, the HTML file is saved next to the .md file
// with the same name but .html extension.
//
// The output directory can also be set via the OUTPUT_DIR environment variable
// or the .env file at the project root.
// ============================================================================

import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename, extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
loadEnv({ path: join(__dirname, '..', '.env') });

// -- Markdown to HTML conversion ---------------------------------------------

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineFormat(text) {
  let result = text;
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  // Links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return result;
}

function markdownToHtml(md) {
  const lines = md.split('\n');
  const html = [];
  let inList = false;
  let inBlockquote = false;
  let inTable = false;
  let tableHeaders = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+\s*$/.test(line)) {
      if (inList) { html.push('</ul>'); inList = false; }
      if (inBlockquote) { html.push('</blockquote>'); inBlockquote = false; }
      if (inTable) { html.push('</tbody></table>'); inTable = false; }
      html.push('<hr>');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      if (inList) { html.push('</ul>'); inList = false; }
      if (inBlockquote) { html.push('</blockquote>'); inBlockquote = false; }
      if (inTable) { html.push('</tbody></table>'); inTable = false; }
      const level = headingMatch[1].length;
      const text = inlineFormat(escapeHtml(headingMatch[2]));
      html.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Table header detection
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|[\s\-:|]+\|/.test(lines[i + 1])) {
      if (inList) { html.push('</ul>'); inList = false; }
      if (inBlockquote) { html.push('</blockquote>'); inBlockquote = false; }
      if (inTable) { html.push('</tbody></table>'); }
      tableHeaders = line.trim().split('|').filter(c => c.trim()).map(c => c.trim());
      html.push('<table><thead><tr>');
      for (const h of tableHeaders) {
        html.push(`<th>${inlineFormat(escapeHtml(h))}</th>`);
      }
      html.push('</tr></thead><tbody>');
      inTable = true;
      i++; // Skip the separator line
      continue;
    }

    // Table row
    if (inTable && line.trim().startsWith('|')) {
      const cells = line.trim().split('|').filter(c => c.trim()).map(c => c.trim());
      html.push('<tr>');
      for (const cell of cells) {
        html.push(`<td>${inlineFormat(escapeHtml(cell))}</td>`);
      }
      html.push('</tr>');
      continue;
    } else if (inTable) {
      html.push('</tbody></table>');
      inTable = false;
    }

    // Blockquote
    if (line.startsWith('>')) {
      if (!inBlockquote) {
        html.push('<blockquote>');
        inBlockquote = true;
      }
      const text = inlineFormat(escapeHtml(line.replace(/^>\s?/, '')));
      html.push(text);
      continue;
    } else if (inBlockquote) {
      html.push('</blockquote>');
      inBlockquote = false;
    }

    // List items
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      const text = inlineFormat(escapeHtml(line.replace(/^[-*]\s+/, '')));
      html.push(`<li>${text}</li>`);
      continue;
    } else if (inList) {
      html.push('</ul>');
      inList = false;
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Regular paragraph
    html.push(`<p>${inlineFormat(escapeHtml(line))}</p>`);
  }

  // Close any open tags
  if (inList) html.push('</ul>');
  if (inBlockquote) html.push('</blockquote>');
  if (inTable) html.push('</tbody></table>');

  return html.join('\n');
}

// -- HTML template -----------------------------------------------------------

function htmlTemplate(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --bg: #ffffff;
      --fg: #1a1a2e;
      --muted: #6c757d;
      --accent: #2563eb;
      --border: #e2e8f0;
      --code-bg: #f1f5f9;
      --quote-bg: #f8fafc;
      --quote-border: #3b82f6;
      --table-hover: #f8fafc;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f172a;
        --fg: #e2e8f0;
        --muted: #94a3b8;
        --accent: #60a5fa;
        --border: #334155;
        --code-bg: #1e293b;
        --quote-bg: #1e293b;
        --quote-border: #60a5fa;
        --table-hover: #1e293b;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.8;
      max-width: 820px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 { font-size: 1.8em; margin: 30px 0 10px; padding-bottom: 10px; border-bottom: 2px solid var(--accent); }
    h2 { font-size: 1.4em; margin: 28px 0 12px; color: var(--accent); }
    h3 { font-size: 1.15em; margin: 22px 0 8px; }
    p { margin: 10px 0; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    blockquote {
      background: var(--quote-bg);
      border-left: 4px solid var(--quote-border);
      padding: 12px 18px;
      margin: 12px 0;
      border-radius: 0 8px 8px 0;
      color: var(--muted);
    }
    code {
      background: var(--code-bg);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 0.9em;
    }
    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 24px 0;
    }
    ul { padding-left: 24px; margin: 10px 0; }
    li { margin: 4px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 0.95em;
    }
    th, td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th { font-weight: 600; background: var(--code-bg); }
    tr:hover td { background: var(--table-hover); }
    strong { font-weight: 600; }
    em { font-style: italic; }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

// -- Main --------------------------------------------------------------------

async function convertFile(inputPath, outputPath) {
  const md = await readFile(inputPath, 'utf-8');
  const bodyHtml = markdownToHtml(md);

  // Extract title from first H1
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : basename(inputPath, '.md');

  const html = htmlTemplate(title, bodyHtml);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf-8');
  console.log(`HTML generated: ${outputPath}`);
}

async function main() {
  const args = process.argv.slice(2);

  // --dir mode: convert all .md files in a directory
  const dirIdx = args.indexOf('--dir');
  if (dirIdx !== -1) {
    const dir = args[dirIdx + 1] || process.env.OUTPUT_DIR || './output';
    const absDir = resolve(dir);
    if (!existsSync(absDir)) {
      console.error(`Directory not found: ${absDir}`);
      process.exit(1);
    }
    const files = (await readdir(absDir)).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
      console.log('No .md files found in directory');
      return;
    }
    for (const file of files) {
      const inputPath = join(absDir, file);
      const outputPath = join(absDir, file.replace('.md', '.html'));
      await convertFile(inputPath, outputPath);
    }
    console.log(`Converted ${files.length} file(s)`);
    return;
  }

  // Single file mode
  if (args.length === 0) {
    console.error('Usage: node generate-html.js <input.md> [output.html]');
    console.error('       node generate-html.js --dir <directory>');
    process.exit(1);
  }

  const inputPath = args[0];
  if (!existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  // Determine output path
  let outputPath;
  if (args[1]) {
    outputPath = args[1];
  } else {
    const outputDir = process.env.OUTPUT_DIR
      ? resolve(process.env.OUTPUT_DIR)
      : dirname(resolve(inputPath));
    const baseName = basename(inputPath, '.md');
    outputPath = join(outputDir, `${baseName}.html`);
  }

  await convertFile(inputPath, outputPath);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
