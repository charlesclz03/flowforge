# Supabase Storage Setup - Step by Step

## ✅ Step 1: Verify Bucket Configuration

1. Go to your Supabase Dashboard
2. Navigate to **Storage** > **recordings** bucket
3. Verify the following settings:
   - ✅ **Bucket name**: `recordings` (exactly)
   - ✅ **Public bucket**: Should be **checked** (enabled)
   - ✅ **File size limit**: Set to `50 MB` (or your preferred limit)
   - ✅ **Allowed MIME types**: Optional, can leave empty or add `audio/webm,audio/ogg,audio/mp4`

**If the bucket is not public:**
1. Click on the bucket
2. Go to **Settings**
3. Toggle **Public bucket** to **ON**
4. Click **Save**

---

## 🔑 Step 2: Get API Keys

1. Go to **Settings** > **API** in your Supabase Dashboard
2. Copy the following values:

   **Project URL:**
   ```
   https://your-project-ref.supabase.co
   ```
   Copy this → `NEXT_PUBLIC_SUPABASE_URL`

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Copy this → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **service_role key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   ⚠️ **IMPORTANT**: This is a secret key! Copy this → `SUPABASE_SERVICE_ROLE_KEY`
   - Never commit this to git
   - Only use server-side
   - Keep it secure

---

## 📝 Step 3: Update Environment Variables

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add the following variables:

```bash
# Supabase Storage (for recordings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Replace the placeholders with your actual values from Step 2.**

---

## 🔍 Step 4: Verify Environment Variables

1. Make sure your `.env.local` file is in the project root
2. Check that `.env.local` is in `.gitignore` (it should be)
3. Verify the variables are set correctly:
   - No quotes around the values (unless they contain special characters)
   - No trailing spaces
   - Correct URLs (should start with `https://`)

---

## 🧪 Step 5: Test the Setup

1. **Restart your development server** (if it's running):
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Test the connection:**
   - Sign in to your app
   - Go to the Practice page (`/practice`)
   - Select a beat
   - Start a recording session
   - Let it record for a few seconds
   - Stop the recording

3. **Verify the upload:**
   - Check for a success message: "Recording saved successfully!"
   - Go to the Recordings page (`/recordings`)
   - Verify your recording appears in the list
   - Check Supabase Dashboard > Storage > recordings
   - You should see a folder with your user ID
   - Inside the folder, you should see a `.webm` file

---

## 🐛 Troubleshooting

### Issue: "Failed to upload recording"

**Solutions:**
1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Verify the bucket name is exactly `recordings` (case-sensitive)
3. Check that the bucket is public
4. Verify you're authenticated (signed in)
5. Check the browser console for errors
6. Check the server logs for errors

### Issue: "Bucket not found"

**Solutions:**
1. Verify the bucket name is exactly `recordings`
2. Check that `NEXT_PUBLIC_SUPABASE_URL` is correct
3. Make sure the bucket exists in Supabase Dashboard
4. Verify the bucket is public

### Issue: "Unauthorized" error

**Solutions:**
1. Check that you're signed in
2. Verify NextAuth is working correctly
3. Check that `NEXTAUTH_SECRET` is set
4. Verify the session is valid

### Issue: Files not appearing in Storage

**Solutions:**
1. Check browser console for errors
2. Check server logs for errors
3. Verify the API endpoint is being called (check Network tab)
4. Check Supabase Dashboard > Logs for errors
5. Verify the file upload succeeded (check response in Network tab)

---

## ✅ Verification Checklist

- [ ] Bucket name is exactly `recordings`
- [ ] Bucket is public (enabled)
- [ ] File size limit is set (50 MB recommended)
- [ ] API keys are copied from Supabase Dashboard
- [ ] Environment variables are set in `.env.local`
- [ ] Development server is restarted
- [ ] User is signed in
- [ ] Recording upload works
- [ ] Recording appears in `/recordings` page
- [ ] File appears in Supabase Storage
- [ ] Can play, download, and delete recording

---

## 🎉 Next Steps

Once everything is working:

1. **Test all features:**
   - Record a session
   - View recordings
   - Play recordings
   - Download recordings
   - Delete recordings

2. **Monitor storage:**
   - Check Supabase Dashboard > Storage for file sizes
   - Monitor storage usage
   - Set up alerts if needed

3. **Production deployment:**
   - Add environment variables to your production environment (Vercel, etc.)
   - Never commit `SUPABASE_SERVICE_ROLE_KEY` to git
   - Use environment variables in your deployment platform

---

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [FlowForge Storage Setup Guide](DOCS/SUPABASE_STORAGE_SETUP.md)

---

**Ready to test?** Follow Step 5 above and verify everything works!

