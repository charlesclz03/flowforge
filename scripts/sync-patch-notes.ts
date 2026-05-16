import fs from 'fs'
import path from 'path'
import { PATCH_NOTES } from '../lib/data/patch-notes.js'

const TARGET_FILE = path.join(
  __dirname,
  '../DOCS/reference/PATCH_NOTES_MASTER.md'
)

function generateMarkdown() {
  let content = '# PATCH NOTES MASTER FILE\n\n'

  PATCH_NOTES.forEach((note) => {
    content += `## v${note.version} - ${note.codename} (${note.date})\n`
    content += `**"${note.title}"**\n\n`
    content += `${note.description}\n\n`

    if (note.changes) {
      // Group by category if needed, or just list them as they are in the array
      // The array is already grouped by category objects
      note.changes.forEach((changeGroup) => {
        content += `### ${changeGroup.category}\n`
        changeGroup.items.forEach((item) => {
          content += `- ${item}\n`
        })
        content += '\n'
      })
    }

    content += '---\n\n'
  })

  content += '*Generated automatically from lib/data/patch-notes.ts*\n'

  fs.writeFileSync(TARGET_FILE, content, 'utf8')
  console.log(
    `Successfully wrote ${PATCH_NOTES.length} versions to ${TARGET_FILE}`
  )
}

generateMarkdown()
