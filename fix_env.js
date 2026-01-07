const { spawn } = require('child_process')

console.log('Removing old variable...')
// Use shell: true for Windows compatibility
const rm = spawn(
  'npx',
  ['vercel', 'env', 'rm', 'GOOGLE_CLIENT_ID', 'production', '-y'],
  {
    stdio: 'inherit',
    shell: true,
  }
)

rm.on('close', (code) => {
  console.log(`Removal exited with code ${code}. Adding new variable...`)

  const add = spawn(
    'npx',
    ['vercel', 'env', 'add', 'GOOGLE_CLIENT_ID', 'production'],
    {
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true,
    }
  )

  add.stdin.write(
    '954382278791-44o3cghuppscsi192632o18jkom8ekkf.apps.googleusercontent.com'
  )
  add.stdin.end()

  add.on('close', (c) => {
    console.log(`Add exited with code ${c}`)
  })
})
