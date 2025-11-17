# Next Steps: Complete Supabase Storage Setup

## 🎯 What You've Done

✅ Created the `recordings` bucket in Supabase

## 📋 What You Need to Do Now

### 1. Verify Bucket is Public (2 minutes)

1. Go to Supabase Dashboard > Storage > recordings
2. Click on the bucket
3. Go to **Settings** tab
4. Make sure **Public bucket** is **enabled** (checked)
5. Set **File size limit** to `50 MB` (or your preference)
6. Click **Save**

### 2. Get API Keys (3 minutes)

1. Go to Supabase Dashboard > **Settings** > **API**
2. Copy these three values:

   **a) Project URL:**
   - Look for "Project URL" or "Project URL"
   - Copy the URL (should look like: `https://xxxxx.supabase.co`)
   - This is your `NEXT_PUBLIC_SUPABASE_URL`

   **b) anon public key:**
   - Look for "Project API keys"
   - Find the key labeled "anon" or "public"
   - Copy the entire key (starts with `eyJ...`)
   - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **c) service_role key:**
   - In the same "Project API keys" section
   - Find the key labeled "service_role" 
   - ⚠️ **WARNING**: This is a secret key!
   - Copy the entire key (starts with `eyJ...`)
   - This is your `SUPABASE_SERVICE_ROLE_KEY`
   - **Never share this key or commit it to git!**

### 3. Add to .env.local (2 minutes)

1. Open your `.env.local` file
2. Add these three lines at the bottom:

```bash
# Supabase Storage (for recordings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. **Replace the placeholders** with your actual values from Step 2
4. Save the file

### 4. Verify Setup (Optional - 1 minute)

Run the verification script:
```bash
npm run verify:storage
```

This will check:
- ✅ Environment variables are set
- ✅ Can connect to Supabase
- ✅ Recordings bucket exists
- ✅ Bucket is accessible

### 5. Test the Setup (5 minutes)

1. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C if running)
   npm run dev
   ```

2. **Test recording upload:**
   - Sign in to your app
   - Go to Practice page (`/practice`)
   - Select a beat
   - Start a recording
   - Record for a few seconds
   - Stop the recording
   - **Expected**: Success message appears

3. **Verify recording:**
   - Go to Recordings page (`/recordings`)
   - **Expected**: Your recording appears in the list
   - Click Play to test playback
   - Click Download to test download
   - Click Delete to test deletion

4. **Check Supabase Storage:**
   - Go to Supabase Dashboard > Storage > recordings
   - **Expected**: See a folder with your user ID
   - **Expected**: See a `.webm` file inside the folder

---

## ✅ Success Indicators

You'll know it's working when:

- ✅ Success message appears after recording
- ✅ Recording appears in `/recordings` page
- ✅ Can play, download, and delete recordings
- ✅ Files appear in Supabase Storage
- ✅ No errors in browser console
- ✅ No errors in server logs

---

## 🐛 Common Issues

### "Failed to upload recording"
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify bucket name is exactly `recordings` (case-sensitive)
- Make sure bucket is public
- Check you're signed in

### "Bucket not found"
- Verify bucket name is exactly `recordings`
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Make sure bucket exists in Supabase Dashboard

### "Unauthorized"
- Make sure you're signed in
- Check NextAuth is working
- Verify `NEXTAUTH_SECRET` is set

---

## 📚 Helpful Resources

- **Detailed Setup Guide**: `SETUP_SUPABASE_STORAGE_NOW.md`
- **Setup Checklist**: `SETUP_CHECKLIST.md`
- **Storage Documentation**: `DOCS/SUPABASE_STORAGE_SETUP.md`
- **Quick Start**: `PHASE_4_QUICK_START.md`

---

## 🎉 Once Setup is Complete

After verifying everything works:

1. ✅ Test all features (record, play, download, delete)
2. ✅ Monitor storage usage in Supabase Dashboard
3. ✅ Continue with Phase 5 development
4. ✅ Set up production environment variables (when deploying)

---

## 💡 Quick Reference

**Environment Variables Needed:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Verification Command:**
```bash
npm run verify:storage
```

**Test Flow:**
1. Record session → 2. View recording → 3. Play/Download/Delete

---

**Ready to complete the setup?** Follow the steps above! 🚀

