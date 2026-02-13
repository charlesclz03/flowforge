import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'DOCS');
const ARCHIVE_SEGMENT = `${path.sep}ARCHIVE${path.sep}`;

function collectMarkdown(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        if (e.name === 'ARCHIVE' || full.includes(ARCHIVE_SEGMENT)) continue;
        stack.push(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        out.push(full);
      }
    }
  }
  return out;
}

function normalizeLinkTarget(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('#')) return null;
  if (/^[a-zA-Z]+:\/\//.test(trimmed)) return null;
  if (trimmed.startsWith('mailto:')) return null;
  const noQuery = trimmed.split('?')[0];
  const noHash = noQuery.split('#')[0];
  if (!noHash) return null;
  try {
    return decodeURIComponent(noHash);
  } catch {
    return noHash;
  }
}

const mdFiles = collectMarkdown(DOCS_DIR);
const broken = [];

for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /!?\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const token = match[0];
    if (token.startsWith('![')) continue;
    const target = normalizeLinkTarget(match[1]);
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) {
      broken.push({
        file: path.relative(ROOT, file).replace(/\\/g, '/'),
        link: match[1],
      });
    }
  }
}

if (broken.length > 0) {
  console.error(`[docs:check:links] Broken internal links: ${broken.length}`);
  for (const b of broken) {
    console.error(`- ${b.file} -> ${b.link}`);
  }
  process.exit(1);
}

console.log(`[docs:check:links] OK: ${mdFiles.length} markdown files scanned, 0 broken internal links.`);
