const fs = require('fs');
const path = require('path');

function getFiles(dir, ext) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file, ext));
    } else {
      if (file.endsWith(ext)) results.push(file);
    }
  });
  return results;
}

const pages = getFiles('app', 'page.tsx');
pages.sort((a,b) => fs.readFileSync(b,'utf8').split('\n').length - fs.readFileSync(a,'utf8').split('\n').length);
console.log('Top 5 Pages:');
pages.slice(0,5).forEach(p => console.log(p, fs.readFileSync(p,'utf8').split('\n').length));

const routes = getFiles(path.join('app','api'), 'route.ts');
routes.sort((a,b) => fs.readFileSync(b,'utf8').split('\n').length - fs.readFileSync(a,'utf8').split('\n').length);
console.log('\nTop 5 Routes:');
routes.slice(0,5).forEach(p => console.log(p, fs.readFileSync(p,'utf8').split('\n').length));

const targetDirs = ['app', 'components', 'hooks', 'lib', 'prisma', 'types'];
let anyCount = 0;
targetDirs.forEach(d => {
  if (!fs.existsSync(d)) return;
  const files = getFiles(d, '.ts').concat(getFiles(d, '.tsx'));
  files.forEach(f => {
    if (f.includes('__tests__') || f.includes('e2e') || f.includes('DOCS')) return;
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/\bany\b|as any|@ts-ignore|@ts-expect-error/g);
    if (matches) anyCount += matches.length;
  })
})
console.log('\nType Escapes:', anyCount);
