const fs = require('fs')
const path = require('path')

const emojiRegex =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F0FF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}]/gu

function removeEmojisFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    if (emojiRegex.test(content)) {
      const newContent = content.replace(emojiRegex, '')
      fs.writeFileSync(filePath, newContent, 'utf8')
      console.log('Cleaned: ' + filePath)
    }
  } catch (err) {
    console.error('Error processing ' + filePath, err)
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      walkDir(filePath)
    } else if (file.endsWith('.md')) {
      removeEmojisFromFile(filePath)
    }
  })
}

// Start cleaning DOCS
walkDir('DOCS')
console.log('Finished cleaning DOCS directory.')
