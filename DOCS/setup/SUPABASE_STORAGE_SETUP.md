# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for recording uploads in FlowForge.

## Prerequisites

- Supabase project created
- Database already configured
- NextAuth.js authentication working

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `recordings`
   - **Public bucket**: ✅ **Checked** (so users can download their recordings)
   - **File size limit**: `50 MB` (adjust based on your needs)
   - **Allowed MIME types**: `audio/webm,audio/ogg,audio/mp4` (optional, for validation)

5. Click **Create bucket**

## Step 2: Set Up Storage Policies

### Option A: Public Bucket (Recommended for MVP)

Since we're using **NextAuth** (not Supabase Auth), the simplest approach is to make the bucket **public** and handle authorization in our API routes.

1. Go to **Storage** > **Policies** for the `recordings` bucket
2. The bucket is already public, so files are accessible via public URLs
3. **Authorization is handled in API routes** - users can only access their own recordings through our API

**Why this works**:

- Our API routes verify user authentication
- Our API routes verify user ownership before allowing upload/delete
- Public URLs are convenient for downloads
- Service role key is used server-side for all operations

### Option B: Private Bucket with Signed URLs (Advanced)

If you want private storage, you can:

1. Make the bucket private
2. Use signed URLs for downloads (requires updating API)
3. Use service role key for all operations (current approach)

**For MVP, Option A (public bucket) is recommended** since:

- Simpler setup
- Faster downloads (no signed URL generation)
- Authorization handled in API (secure)
- Service role key used server-side only

### Policy Setup (Optional - for future Supabase Auth integration)

If you plan to use Supabase Auth in the future, you can set up these policies:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Allow users to read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Note**: These policies won't work with NextAuth. They're only needed if you switch to Supabase Auth.

## Step 3: Get API Keys

1. Go to **Settings** > **API** in your Supabase Dashboard
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Step 4: Update Environment Variables

Add these to your `.env.local`:

```bash
# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**:

- Never commit `SUPABASE_SERVICE_ROLE_KEY` to git
- The service role key bypasses RLS policies, so it's only used server-side
- The anon key is safe to expose client-side

## Step 5: Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Sign in to your app
3. Go to the Practice page
4. Select a beat and start a session
5. Let it record for a few seconds, then stop
6. Check that:
   - Recording saves successfully
   - Success message appears
   - Recording appears in `/recordings` page
   - You can play, download, and delete the recording

## Step 6: Verify Storage

1. Go to **Storage** > **recordings** in Supabase Dashboard
2. You should see folders named with user IDs (UUIDs)
3. Inside each folder, you should see `.webm` files
4. Test downloading a file from the dashboard

## Troubleshooting

### "Failed to upload recording"

- Check that the bucket name is exactly `recordings`
- Verify storage policies are set correctly
- Check that the user is authenticated
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### "Forbidden" error

- Check RLS policies are enabled on the bucket
- Verify policies match the SQL above
- Check that user ID matches the folder name in storage

### "Bucket not found"

- Verify bucket name is `recordings` (case-sensitive)
- Check that bucket is created and public
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

### Files not appearing in Storage

- Check browser console for errors
- Verify API endpoint is being called
- Check Supabase logs for errors
- Verify file upload is successful in network tab

## Security Considerations

1. **Service Role Key**: Only use server-side, never expose to client
2. **Storage Policies**: Always use RLS policies to restrict access
3. **File Size Limits**: Set reasonable limits (50MB default)
4. **MIME Type Validation**: Optionally restrict to audio files only
5. **User Isolation**: Each user's files are in their own folder (`userId/filename.webm`)

## File Structure

Recordings are stored in the following structure:

```
recordings/
├── {userId1}/
│   ├── {recordingId1}.webm
│   └── {recordingId2}.webm
├── {userId2}/
│   └── {recordingId3}.webm
└── ...
```

This ensures:

- User isolation (each user can only access their own files)
- Easy cleanup (delete user folder when user is deleted)
- Organized storage (easy to find user's recordings)

## Next Steps

After setup is complete:

1. Test recording upload from practice page
2. Test recording playback in library
3. Test recording download
4. Test recording deletion
5. Monitor storage usage in Supabase Dashboard

## Support

If you encounter issues:

1. Check Supabase logs in Dashboard > Logs
2. Check browser console for client errors
3. Check server logs for API errors
4. Verify all environment variables are set
5. Verify storage policies are correct
