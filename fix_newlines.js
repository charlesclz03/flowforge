const fs = require('fs')
const path = require('path')

const filePath = process.argv[2]
if (!filePath) {
  console.error('Please provide a file path')
  process.exit(1)
}

const fullPath = path.resolve(filePath)
try {
  let content = fs.readFileSync(fullPath, 'utf8')
  // Replace CRLF with LF
  content = content.replace(/\r\n/g, '\n')
  fs.writeFileSync(fullPath, content, 'utf8')
  console.log(`Fixed line endings in ${fullPath}`)
} catch (err) {
  console.error('Error:', err)
}
