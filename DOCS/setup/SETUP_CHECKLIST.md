# Supabase Storage Setup Checklist

## ✅ Pre-Setup (Already Done)

- [x] Created `recordings` bucket in Supabase
- [ ] Verified bucket is public
- [ ] Got API keys from Supabase Dashboard
- [ ] Added environment variables to `.env.local`
- [ ] Tested the setup

---

## 📋 Setup Steps

### Step 1: Verify Bucket Configuration

1. Go to Supabase Dashboard > Storage > recordings
2. Click on the bucket
3. Verify:
   - [ ] Bucket name is exactly `recordings`
   - [ ] **Public bucket** is **enabled** (checked)
   - [ ] File size limit is set (50 MB recommended)
   - [ ] MIME types are set (optional: `audio/webm,audio/ogg,audio/mp4`)

### Step 2: Get API Keys

1. Go to Supabase Dashboard > Settings > API
2. Copy the following:
   - [ ] **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Keep secret!)

### Step 3: Update .env.local

1. Open `.env.local` file
2. Add these variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
3. Replace placeholders with actual values
4. Save the file

### Step 4: Verify Setup (Optional)

Run the verification script:
```bash
npm run verify:storage
```

Or manually verify:
- [ ] Environment variables are set
- [ ] Bucket exists and is public
- [ ] Can connect to Supabase

### Step 5: Test the Setup

1. Restart development server:
   ```bash
   npm run dev
   ```

2. Sign in to your app

3. Go to Practice page (`/practice`)

4. Record a session:
   - [ ] Select a beat
   - [ ] Start recording
   - [ ] Record for a few seconds
   - [ ] Stop recording
   - [ ] See success message: "Recording saved successfully!"

5. Verify recording:
   - [ ] Go to Recordings page (`/recordings`)
   - [ ] See your recording in the list
   - [ ] Can play the recording
   - [ ] Can download the recording
   - [ ] Can delete the recording

6. Check Supabase Storage:
   - [ ] Go to Supabase Dashboard > Storage > recordings
   - [ ] See folder with your user ID
   - [ ] See `.webm` file inside the folder

---

## 🐛 Troubleshooting

### Issue: "Failed to upload recording"

**Check:**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- [ ] Bucket name is exactly `recordings` (case-sensitive)
- [ ] Bucket is public
- [ ] User is authenticated (signed in)
- [ ] Check browser console for errors
- [ ] Check server logs for errors

### Issue: "Bucket not found"

**Check:**
- [ ] Bucket name is exactly `recordings`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is correct
- [ ] Bucket exists in Supabase Dashboard
- [ ] Bucket is public

### Issue: "Unauthorized" error

**Check:**
- [ ] User is signed in
- [ ] NextAuth is working correctly
- [ ] `NEXTAUTH_SECRET` is set
- [ ] Session is valid

### Issue: Files not appearing

**Check:**
- [ ] Browser console for errors
- [ ] Server logs for errors
- [ ] Network tab for API calls
- [ ] Supabase Dashboard > Logs for errors

---

## ✅ Final Verification

Once everything is working:

- [ ] Can record a session
- [ ] Recording saves automatically
- [ ] Success message appears
- [ ] Recording appears in library
- [ ] Can play recording
- [ ] Can download recording
- [ ] Can delete recording
- [ ] File appears in Supabase Storage
- [ ] Statistics update correctly

---

## 🎉 Setup Complete!

If all checks pass, your Supabase Storage is configured correctly!

**Next Steps:**
1. Test all features
2. Monitor storage usage
3. Set up production environment variables
4. Continue with Phase 5 development

---

## 📚 Resources

- [Setup Guide](SETUP_SUPABASE_STORAGE_NOW.md) - Detailed setup instructions
- [Storage Setup Doc](DOCS/SUPABASE_STORAGE_SETUP.md) - Complete documentation
- [Quick Start](PHASE_4_QUICK_START.md) - Quick start guide

---

**Need help?** Check the troubleshooting section above or refer to the documentation.

