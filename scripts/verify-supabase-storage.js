/**
 * Verification script for Supabase Storage setup
 * Run with: node scripts/verify-supabase-storage.js
 *
 * This script verifies that Supabase Storage is configured correctly.
 * It checks environment variables and tests the connection.
 */

// Load environment variables from .env.local
const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
  try {
    const envFile = fs.readFileSync(filePath, 'utf8')
    const envVars = {}
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        envVars[key] = value
      }
    })
    return envVars
  } catch (e) {
    return {}
  }
}

// Load .env.local if it exists
const envLocalPath = path.join(process.cwd(), '.env.local')
const envVars = loadEnvFile(envLocalPath)

// Set environment variables
Object.keys(envVars).forEach((key) => {
  if (!process.env[key]) {
    process.env[key] = envVars[key]
  }
})

async function verifySetup() {
  console.log('🔍 Verifying Supabase Storage setup...\n')

  // Check environment variables
  console.log('1. Checking environment variables...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set')
    return false
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set')
  }

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    return false
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set')
  }

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set')
    return false
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY is set')
  }

  // Verify URL format
  console.log('\n2. Verifying URL format...')
  if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL should start with https://')
    return false
  }
  if (!supabaseUrl.includes('.supabase.co')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL should contain .supabase.co')
    return false
  }
  console.log('✅ URL format is correct')

  // Test Supabase connection
  console.log('\n3. Testing Supabase connection...')
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Test storage bucket access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Error connecting to Supabase:', bucketsError.message)
      return false
    }

    console.log('✅ Successfully connected to Supabase')

    // Check if recordings bucket exists
    console.log('\n4. Checking for recordings bucket...')
    const recordingsBucket = buckets.find((bucket) => bucket.name === 'recordings')

    if (!recordingsBucket) {
      console.error('❌ Recordings bucket not found')
      console.log('💡 Available buckets:', buckets.map((b) => b.name).join(', ') || 'None')
      return false
    }

    console.log('✅ Recordings bucket found')

    // Check bucket configuration
    console.log('\n5. Checking bucket configuration...')
    if (recordingsBucket.public) {
      console.log('✅ Bucket is public')
    } else {
      console.warn('⚠️  Bucket is private (this is OK, but public is recommended for MVP)')
    }

    // Test file listing
    console.log('\n6. Testing storage access...')
    const { data: files, error: filesError } = await supabase.storage.from('recordings').list('', {
      limit: 1,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (filesError) {
      console.error('❌ Error accessing storage:', filesError.message)
      return false
    }

    console.log('✅ Storage access working')
    if (files && files.length > 0) {
      console.log(`   Found ${files.length} file(s) in bucket`)
    } else {
      console.log('   Bucket is empty (this is expected for a new setup)')
    }

    console.log('\n🎉 All checks passed! Supabase Storage is configured correctly.')
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

// Run verification
verifySetup()
  .then((success) => {
    if (!success) {
      console.log('\n❌ Setup verification failed. Please check the errors above.')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
