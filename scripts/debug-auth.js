const fs = require('fs')
const path = require('path')

// Load .env.local manually since we're running a standalone script
try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach((line) => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const val = parts.slice(1).join('=').trim()
        if (key && val) process.env[key] = val
      }
    })
  }
} catch (e) {
  console.error('Could not read .env.local', e)
}

console.log('--- AUTH DEBUG INFO ---')
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
console.log(
  `GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'MISSING'}`
)
console.log(
  `GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'PRESENT (Length: ' + process.env.GOOGLE_CLIENT_SECRET.length + ')' : 'MISSING'}`
)
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)

if (process.env.NEXTAUTH_URL !== 'http://localhost:3000') {
  console.warn('WARNING: NEXTAUTH_URL should be http://localhost:3000 for local development.')
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('ERROR: GOOGLE_CLIENT_ID is missing.')
}
