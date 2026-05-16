import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const TS_PATH = path.join(ROOT, 'lib', 'data', 'patch-notes.ts')
const MD_PATH = path.join(ROOT, 'DOCS', 'reference', 'PATCH_NOTES_MASTER.md')

function normalize(value) {
  return String(value || '')
    .replace(/[^\w.]+/g, ' ')
    .trim()
    .toLowerCase()
}

function readPatchNotesData() {
  const source = fs.readFileSync(TS_PATH, 'utf8')
  const match = source.match(
    /export const PATCH_NOTES: PatchNote\[\] = (\[[\s\S]*\])\s*$/
  )

  if (!match) {
    throw new Error(
      'Could not find PATCH_NOTES array in lib/data/patch-notes.ts'
    )
  }

  return eval(match[1])
}

function readMasterEntries() {
  const source = fs.readFileSync(MD_PATH, 'utf8')
  const entries = []
  const headingPattern = /^##\s+v?([^\s]+)\s+-\s+(.+?)\s+\(([^()]*)\)\s*$/gm
  let match

  while ((match = headingPattern.exec(source))) {
    entries.push({
      version: match[1],
      label: match[2],
      date: match[3],
      line: source.slice(0, match.index).split(/\r?\n/).length,
    })
  }

  return entries
}

function addToBucket(map, key, entry) {
  if (!map.has(key)) map.set(key, [])
  map.get(key).push(entry)
}

function releaseKey(entry) {
  return `${entry.version}|${entry.date}`
}

const dataEntries = readPatchNotesData().map((entry) => ({
  version: entry.version,
  date: entry.date,
  title: entry.title,
  codename: entry.codename,
}))
const masterEntries = readMasterEntries()

const dataBuckets = new Map()
const masterBuckets = new Map()
const failures = []

for (const entry of dataEntries)
  addToBucket(dataBuckets, releaseKey(entry), entry)
for (const entry of masterEntries)
  addToBucket(masterBuckets, releaseKey(entry), entry)

for (const key of dataBuckets.keys()) {
  if (!masterBuckets.has(key)) {
    failures.push(`Missing from PATCH_NOTES_MASTER.md: ${key}`)
  }
}

for (const key of masterBuckets.keys()) {
  if (!dataBuckets.has(key)) {
    failures.push(`Missing from lib/data/patch-notes.ts: ${key}`)
  }
}

for (const [key, dataBucket] of dataBuckets.entries()) {
  const masterBucket = masterBuckets.get(key)
  if (!masterBucket) continue

  if (dataBucket.length !== masterBucket.length) {
    failures.push(
      `Release count mismatch for ${key}: TS has ${dataBucket.length}, markdown has ${masterBucket.length}`
    )
    continue
  }

  if (dataBucket.length > 1 || masterBucket.length > 1) {
    const masterLabels = masterBucket.map((entry) => normalize(entry.label))

    for (const entry of dataBucket) {
      const candidates = [normalize(entry.title), normalize(entry.codename)]
      if (!candidates.some((candidate) => masterLabels.includes(candidate))) {
        failures.push(
          `Duplicate release label mismatch for ${key}: markdown labels do not include "${entry.title}" or "${entry.codename}"`
        )
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`[docs:check:patch-notes] FAIL (${failures.length})`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `[docs:check:patch-notes] OK: ${dataEntries.length} patch-note entries synchronized.`
)
