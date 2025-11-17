# Google Cloud Storage Upload Plan

> **Status (Nov 2025):** `/api/sessions/upload` has been deprecated in favour of the unified `/api/recordings` endpoint, which now uploads blobs to Supabase Storage and persists session metadata in a single request. This document is retained for historical context and future GCS explorations.

## Overview
This document outlines the implementation plan for audio file uploads to Google Cloud Storage (GCS) for FlowForge V2.

## Architecture

### Flow
1. Client records audio (browser MediaRecorder API)
2. Client requests upload URL from `/api/sessions/upload`
3. Server generates pre-signed GCS URL
4. Client uploads audio directly to GCS using pre-signed URL
5. Client sends session metadata to `/api/sessions` with GCS URL

### Benefits
- Direct client-to-GCS upload (no server bandwidth)
- Secure (pre-signed URLs expire)
- Scalable (no server bottleneck)

## GCS Setup

### 1. Create GCS Bucket
```bash
# Set project
gcloud config set project flowforge-prod

# Create bucket (choose region close to users)
gsutil mb -l us-central1 -c STANDARD gs://flowforge-audio

# Set lifecycle policy (optional: delete old files)
gsutil lifecycle set lifecycle.json gs://flowforge-audio
```

**lifecycle.json:**
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
```

### 2. Configure CORS
```bash
gsutil cors set cors.json gs://flowforge-audio
```

**cors.json:**
```json
[
  {
    "origin": ["http://localhost:3000", "https://flowforge.app", "https://*.vercel.app"],
    "method": ["GET", "PUT", "POST"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

### 3. Create Service Account
```bash
# Create service account
gcloud iam service-accounts create flowforge-uploader \
  --display-name="FlowForge Audio Uploader"

# Grant Storage Object Creator role
gcloud projects add-iam-policy-binding flowforge-prod \
  --member="serviceAccount:flowforge-uploader@flowforge-prod.iam.gserviceaccount.com" \
  --role="roles/storage.objectCreator"

# Create key
gcloud iam service-accounts keys create flowforge-uploader-key.json \
  --iam-account=flowforge-uploader@flowforge-prod.iam.gserviceaccount.com
```

### 4. Environment Variables
Add to `.env.local`:
```bash
# GCS Configuration
GCS_BUCKET_NAME=flowforge-audio
GCS_PROJECT_ID=flowforge-prod
GOOGLE_APPLICATION_CREDENTIALS=./flowforge-uploader-key.json
```

## Implementation

### 1. Install Dependencies
```bash
npm install @google-cloud/storage
```

### 2. Create GCS Utility (`lib/storage/gcs.ts`)
```typescript
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!)

export async function generateSignedUploadUrl(
  filename: string,
  contentType: string = 'audio/webm'
): Promise<string> {
  const file = bucket.file(`sessions/${Date.now()}-${filename}`)
  
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  })
  
  return url
}

export async function getSignedDownloadUrl(
  filepath: string,
  expiresIn: number = 3600
): Promise<string> {
  const file = bucket.file(filepath)
  
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresIn * 1000,
  })
  
  return url
}

export async function deleteFile(filepath: string): Promise<void> {
  await bucket.file(filepath).delete()
}
```

### 3. Update `/api/sessions/upload/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { generateSignedUploadUrl } from '@/lib/storage/gcs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { beatId, title, durationSeconds, filename } = body

    if (!beatId || !title || !durationSeconds || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate pre-signed upload URL
    const uploadUrl = await generateSignedUploadUrl(filename, 'audio/webm')
    
    // Extract the GCS path from the signed URL
    const gcsPath = `sessions/${Date.now()}-${filename}`

    return NextResponse.json({
      uploadUrl,
      gcsPath,
      expiresIn: 900, // 15 minutes
    })
  } catch (error) {
    console.error('Upload URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
```

### 4. Client-Side Upload (`lib/storage/uploadSession.ts`)
```typescript
export async function uploadSessionAudio(
  audioBlob: Blob,
  sessionData: {
    beatId: string
    title: string
    durationSeconds: number
  }
): Promise<{ sessionId: string; storageUrl: string }> {
  // 1. Request upload URL
  const uploadResponse = await fetch('/api/sessions/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...sessionData,
      filename: `${sessionData.title.replace(/\s+/g, '-')}.webm`,
    }),
  })

  if (!uploadResponse.ok) {
    throw new Error('Failed to get upload URL')
  }

  const { uploadUrl, gcsPath } = await uploadResponse.json()

  // 2. Upload audio directly to GCS
  const uploadResult = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'audio/webm',
    },
    body: audioBlob,
  })

  if (!uploadResult.ok) {
    throw new Error('Failed to upload audio')
  }

  // 3. Save session metadata with GCS path
  const sessionResponse = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...sessionData,
      storageUrl: gcsPath,
    }),
  })

  if (!sessionResponse.ok) {
    throw new Error('Failed to save session')
  }

  const { session } = await sessionResponse.json()
  return {
    sessionId: session.id,
    storageUrl: gcsPath,
  }
}
```

### 5. Update Session Playback
When playing back a session, generate a signed download URL:

```typescript
// In API route or server component
import { getSignedDownloadUrl } from '@/lib/storage/gcs'

const downloadUrl = await getSignedDownloadUrl(session.storageUrl)
// Pass downloadUrl to client for playback
```

## Security Considerations

1. **Pre-signed URLs**: Expire after 15 minutes
2. **CORS**: Restrict origins to your domains
3. **Service Account**: Minimal permissions (objectCreator only)
4. **Bucket Access**: Not publicly readable
5. **File Validation**: Validate file size/type on upload

## Cost Estimation

### Storage
- $0.020 per GB/month (Standard storage)
- Average session: 2MB
- 10,000 sessions = 20GB = $0.40/month

### Operations
- Class A (write): $0.05 per 10,000 ops
- Class B (read): $0.004 per 10,000 ops
- 10,000 uploads + 50,000 plays = $0.07/month

### Network
- Egress (downloads): $0.12 per GB
- 50,000 plays × 2MB = 100GB = $12/month

**Total for 10K active users: ~$12.50/month**

## Rollout Plan

### Phase 1: MVP (Current)
- Client-side localStorage only
- No server storage

### Phase 2: GCS Integration
1. Set up GCS bucket and service account
2. Deploy updated API routes
3. Test with staging environment
4. Roll out to 10% of users
5. Monitor costs and errors
6. Full rollout

### Phase 3: Optimization
- Implement CDN caching
- Add audio compression
- Implement cleanup jobs for old files

## Monitoring

Track these metrics:
- Upload success rate
- Average upload time
- Storage costs
- Bandwidth costs
- Failed uploads (retry logic)

## Backup Strategy

- Enable versioning on bucket
- Daily snapshots to separate bucket
- Retention: 30 days

## Migration from localStorage

For users with existing localStorage sessions:
1. Detect localStorage sessions on login
2. Offer "Upload to cloud" option
3. Batch upload with progress indicator
4. Clear localStorage after successful upload

