import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MAP_PATH = path.join(ROOT, 'DOCS', 'reference', 'DOC_CANONICAL_MAP.json');

const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
const marker = map.stubMarker || '<!-- DOC_STUB -->';
const stubs = map.stubs || [];
const errors = [];

for (const stub of stubs) {
  const stubPath = path.join(ROOT, stub.path);
  const canonicalPath = path.join(ROOT, stub.canonical);
  const archivePath = path.join(ROOT, stub.archive);

  if (!fs.existsSync(stubPath)) {
    errors.push(`Stub file missing: ${stub.path}`);
    continue;
  }
  if (!fs.existsSync(canonicalPath)) {
    errors.push(`Stub canonical target missing: ${stub.canonical}`);
  }
  if (!fs.existsSync(archivePath)) {
    errors.push(`Stub archive target missing: ${stub.archive}`);
  }

  const content = fs.readFileSync(stubPath, 'utf8');
  if (!content.includes(marker)) {
    errors.push(`Stub marker missing in: ${stub.path}`);
  }
  if (!content.includes(stub.canonical)) {
    errors.push(`Canonical path literal missing in stub: ${stub.path}`);
  }
  if (!content.includes(stub.archive)) {
    errors.push(`Archive path literal missing in stub: ${stub.path}`);
  }
}

const docsRoot = path.join(ROOT, 'DOCS');
const discovered = [];
const stack = [docsRoot];
while (stack.length) {
  const cur = stack.pop();
  for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
    const full = path.join(cur, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(`${path.sep}ARCHIVE${path.sep}`)) continue;
      stack.push(full);
      continue;
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue;
    const txt = fs.readFileSync(full, 'utf8');
    if (txt.includes(marker)) {
      discovered.push(path.relative(ROOT, full).replace(/\\/g, '/'));
    }
  }
}

const mapped = new Set(stubs.map((s) => s.path));
for (const found of discovered) {
  if (!mapped.has(found)) {
    errors.push(`Stub found on disk but missing from DOC_CANONICAL_MAP.json: ${found}`);
  }
}

if (errors.length > 0) {
  console.error(`[docs:check:stubs] FAIL (${errors.length})`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`[docs:check:stubs] OK: ${stubs.length} mapped stubs validated.`);
