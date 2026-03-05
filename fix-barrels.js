const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
      file = dir + '/' + file;
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) { 
        results = results.concat(walk(file));
      } else {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
      }
    });
  } catch (e) {
    // ignore
  }
  return results;
}

const barrelPaths = [
  'components/atoms',
  'components/molecules',
  'components/organisms/common',
  'components/organisms/landing',
  'components/organisms/layout',
  'components/organisms/practice',
  'components/organisms/profile',
  'components/organisms/recordings',
  'components/templates'
];

// Build lookup map: { 'components/atoms': { 'Button': '@/components/atoms/Button' } }
const map = {};

barrelPaths.forEach(barrel => {
  map[barrel] = {};
  const indexPath = path.join(__dirname, barrel, 'index.ts');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
      const match = line.match(/export\s+\{\s*([^}]+)\s*\}\s+from\s+['"](.+)['"]/);
      if (match) {
        const exportsList = match[1].split(',').map(s => s.trim()).filter(s => s);
        const sourcePath = match[2];
        const cleanPath = sourcePath.replace(/^\.\//, '');
        exportsList.forEach(exp => {
          // keep ' as ' syntax out of the key, but actually `export { X }` or `export { X as Y }`
          // usually barrel is just `export { X } from './X'`
          map[barrel][exp] = `@/${barrel}/${cleanPath}`;
        });
      }
    });
  }
});

const files = walk(__dirname + '/app')
  .concat(walk(__dirname + '/components'))
  .concat(walk(__dirname + '/contexts'))
  .concat(walk(__dirname + '/hooks'))
  .concat(walk(__dirname + '/lib'));

let changedCount = 0;

files.forEach(file => {
  if (file.endsWith('index.ts') && barrelPaths.some(b => file.includes(b.replace(/\//g, '\\')))) return;

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  barrelPaths.forEach(barrel => {
    // Regex for: import { A, B } from '@/components/atoms'
    // allowing newlines inside {}
    const regexStr = `import\\s+\\{([^}]+)\\}\\s+from\\s+['"]@/${barrel}['"](?:;)?`;
    const regex = new RegExp(regexStr, 'g');
    
    content = content.replace(regex, (match, p1) => {
      const parts = p1.split(',').map(s => s.trim()).filter(s => s);
      const replacements = parts.map(part => {
        const [expName] = part.split(' as ').map(s => s.trim());
        const resolvedPath = map[barrel][expName];
        if (!resolvedPath) {
          console.warn(`WARNING: Could not find export ${expName} in ${barrel} for file ${file}`);
          return `import { ${part} } from '@/${barrel}'`; 
        }
        return `import { ${part} } from '${resolvedPath}'`;
      });
      return replacements.join('\n');
    });
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedCount++;
  }
});

console.log(`Updated ${changedCount} files.`);
