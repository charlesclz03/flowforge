
const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, '../lib/data/patch-notes.ts');
const mdPath = path.join(__dirname, '../DOCS/reference/PATCH_NOTES_MASTER.md');

try {
  let tsContent = fs.readFileSync(tsPath, 'utf8');

  // Regex to extract the array content
  // Matches "export const PATCH_NOTES: PatchNote[] =" followed by the array until end of file/declaration
  const match = tsContent.match(/export const PATCH_NOTES: PatchNote\[\] = (\[[\s\S]*\])/);
  
  if (!match) {
    throw new Error('Could not find PATCH_NOTES array in file');
  }

  // Evaluate the array string to get the object
  // This helps avoid strict JSON parsing issues (like trailing commas or comments)
  // safe eval since we trust our own codebase
  const patchNotes = eval(match[1]);

  let content = '# PATCH NOTES MASTER FILE\n\n';

  patchNotes.forEach((note) => {
    content += `## v${note.version} - ${note.codename} (${note.date})\n`;
    content += `**"${note.title}"**\n\n`;
    content += `${note.description}\n\n`;

    if (note.changes) {
      note.changes.forEach((changeGroup) => {
        content += `### ${changeGroup.category}\n`;
        changeGroup.items.forEach((item) => {
          content += `- ${item}\n`;
        });
        content += '\n';
      });
    }
    
    content += '---\n\n';
  });

  content += '*Generated automatically from lib/data/patch-notes.ts*\n';

  fs.writeFileSync(mdPath, content, 'utf8');
  console.log(`Successfully synced ${patchNotes.length} versions to PATCH_NOTES_MASTER.md`);

} catch (error) {
  console.error('Error syncing patch notes:', error);
  process.exit(1);
}
