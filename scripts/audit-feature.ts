const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

/**
 * Audit Feature CLI
 *
 * Usage: npx ts-node scripts/audit-feature.ts <FeatureName> <FilePattern1> [FilePattern2] ...
 * Example usage provided in documentation.
 */

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error(
    'Usage: npx ts-node scripts/audit-feature.ts <FeatureName> <FilePatterns...>'
  )
  process.exit(1)
}

const featureName = args[0]
const filePatterns = args.slice(1).join(' ')
const outputDir = path.join(process.cwd(), 'audit_reports')
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
const finalReportPath = path.join(
  outputDir,
  `${featureName.replace(/\s+/g, '_')}_AUDIT_REPORT.md`
)

console.log(`🔍 Starting Forensic Audit for: ${featureName}`)
console.log(`📂 Scope: ${filePatterns}`)

// --- Helpers ---
function runGit(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
  } catch (e: any) {
    return `Error: ${e.message}`
  }
}

// --- Metrics ---

// 1. Churn Analysis (Commits per Month)
console.log('📊 Calculating Churn...')
const churnLog = runGit(
  `git log --name-only --format="%ad" --date=format:"%Y-%m" -- ${filePatterns}`
)
const commitsByMonth: Record<string, number> = {}
churnLog.split('\n').forEach((line) => {
  const date = line.trim()
  if (date.match(/^\d{4}-\d{2}$/)) {
    commitsByMonth[date] = (commitsByMonth[date] || 0) + 1
  }
})

// 2. Hotfix Detection
console.log('🔥 Detecting Hotfixes...')
const hotfixLog = runGit(
  `git log --oneline --grep="fix" --grep="bug" --grep="hotfix" -- ${filePatterns}`
)
const hotfixCount = hotfixLog.split('\n').filter(Boolean).length
const totalCommits = runGit(
  `git rev-list --count HEAD -- ${filePatterns}`
).trim()

// 3. Circular Refactoring (Duplicate Fixes)
console.log('⭕ Checking Circular Refactoring...')
const commitMsgs = runGit(`git log --format="%s" -- ${filePatterns}`).split(
  '\n'
)
const topicCounts: Record<string, number> = {}
const suspiciousTopics = [
  'sync',
  'timer',
  'save',
  'upload',
  'login',
  'auth',
  'drift',
]

suspiciousTopics.forEach((topic) => {
  const count = commitMsgs.filter((msg) =>
    msg.toLowerCase().includes(topic)
  ).length
  if (count > 0) topicCounts[topic] = count
})

// 4. Hall of Fame Candidate Identification (Simple heuristic: 1 month without commits = stable?)
// For now, listing top 5 most recent significant commits
console.log('🏆 Identify Key Versions...')
const keyVersions = runGit(
  `git log -n 5 --format="| %h | %ad | %s |" --date=short -- ${filePatterns}`
)

// --- Report Generation ---
const report = `# ${featureName} - Forensic Audit Report
**Date**: ${new Date().toISOString().slice(0, 10)}
**Scope**: \`${filePatterns}\`

## 1. Executive Summary
- **Total Commits**: ${totalCommits}
- **Hotfix Ratio**: ${hotfixCount}/${totalCommits} (${((hotfixCount / Number(totalCommits || 1)) * 100).toFixed(1)}%)
- **Churn Validation**: ${Object.values(commitsByMonth).some((c) => c > 10) ? '🔴 HIGH CHURN DETECTED' : '🟢 Stable'}

## 2. Forensic Analysis

### A. Activity Heatmap (Commits per Month)
| Month | Commits | Status |
|-------|---------|--------|
${Object.entries(commitsByMonth)
  .sort()
  .reverse()
  .slice(0, 10)
  .map(([m, c]) => `| ${m} | ${c} | ${c > 10 ? '🔥 Hotspot' : 'Normal'} |`)
  .join('\n')}

### B. "Circular Refactoring" Suspects
*Topics that appear consistently in commit messages:*
| Topic | Occurrences | Risk |
|-------|-------------|------|
${Object.entries(topicCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([t, c]) => `| ${t} | ${c} | ${c > 3 ? '🔴 CRITICAL' : '🟡 Warning'} |`)
  .join('\n')}

## 3. Version History (Hall of Fame Candidates)
| Hash | Date | Message |
|------|------|---------|
${keyVersions}

## 4. Recommendations
1. **Verify Hotspots**: Check months with high churn.
2. **Deep Dive**: Run \`git log -p\` on the "Circular Refactoring" topics.
3. **Current State**: Run \`npm run lint\` on these files.
`

fs.writeFileSync(finalReportPath, report)
console.log(`✅ Report Draft Generated: ${finalReportPath}`)
