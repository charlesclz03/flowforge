import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MAP_PATH = path.join(ROOT, 'DOCS', 'reference', 'DOC_CANONICAL_MAP.json');
const PKG_PATH = path.join(ROOT, 'package.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function mustExist(relPath) {
  const full = path.join(ROOT, relPath);
  return fs.existsSync(full);
}

const map = readJson(MAP_PATH);
const pkg = readJson(PKG_PATH);
const expectedVersion = pkg.version;
const expectedDate = map.lastUpdated;
const failures = [];

if (map.currentVersion !== expectedVersion) {
  failures.push(`Map currentVersion (${map.currentVersion}) does not match package.json version (${expectedVersion}).`);
}

const domains = map.canonicalDomains || {};
for (const [domain, files] of Object.entries(domains)) {
  for (const rel of files) {
    if (!mustExist(rel)) {
      failures.push(`Canonical file missing [${domain}]: ${rel}`);
    }
  }
}

for (const rule of map.driftRules || []) {
  const full = path.join(ROOT, rule.path);
  if (!fs.existsSync(full)) {
    failures.push(`Drift rule file missing: ${rule.path}`);
    continue;
  }
  const content = fs.readFileSync(full, 'utf8');
  for (const rawPattern of rule.requiredPatterns || []) {
    const pattern = rawPattern
      .replaceAll('{{VERSION}}', expectedVersion)
      .replaceAll('{{DATE}}', expectedDate);
    const re = new RegExp(pattern, 'm');
    if (!re.test(content)) {
      failures.push(`Pattern not satisfied in ${rule.path}: ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`[docs:check:drift] FAIL (${failures.length})`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log('[docs:check:drift] OK: canonical docs and drift rules are aligned.');
