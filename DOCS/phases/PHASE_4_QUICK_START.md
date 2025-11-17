# Phase 4: Recording Management - Quick Start Guide

## 🚀 **SETUP REQUIRED**

### **1. Supabase Storage Setup**

Follow the detailed guide in `DOCS/SUPABASE_STORAGE_SETUP.md`, or quick setup:

1. **Create Storage Bucket**:
   - Go to Supabase Dashboard > Storage
   - Create new bucket: `recordings`
   - Set as **public bucket**
   - File size limit: 50 MB

2. **Set Up Storage** (No RLS policies needed):
   - Bucket is **public** (for easy downloads)
   - Authorization handled in API routes (secure)
   - Service role key used server-side for all operations
   - See `DOCS/SUPABASE_STORAGE_SETUP.md` for details

3. **Get API Keys**:
   - Go to Settings > API
   - Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### **2. Update Environment Variables**

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **3. Restart Development Server**

```bash
npm run dev
```

---

## ✅ **TESTING THE FLOW**

### **Test 1: Record & Save**

1. Sign in to app
2. Go to `/practice`
3. Select a beat
4. Configure frequency and difficulty
5. Click Play
6. Record for a few seconds
7. Session auto-stops at 2 minutes (or click stop)
8. **Expected**: Success message appears
9. **Expected**: Recording saved automatically

### **Test 2: View Recordings**

1. Click "Recordings" in header
2. Go to `/recordings`
3. **Expected**: See your saved recording
4. **Expected**: See statistics (total, minutes, unique beats)

### **Test 3: Play Recording**

1. Click "Play" on a recording card
2. **Expected**: Audio plays in browser
3. Click "Pause"
4. **Expected**: Audio pauses

### **Test 4: Download Recording**

1. Click "Download" on a recording card
2. **Expected**: File downloads as `.webm`
3. **Expected**: File can be played in media player

### **Test 5: Delete Recording**

1. Click "Delete" on a recording card
2. Confirm deletion
3. **Expected**: Recording disappears from list
4. **Expected**: File deleted from storage
5. **Expected**: Statistics update

---

## 🐛 **TROUBLESHOOTING**

### **"Failed to upload recording"**

- ✅ Check Supabase Storage bucket exists: `recordings`
- ✅ Check bucket is public
- ✅ Check RLS policies are set correctly
- ✅ Check `SUPABASE_SERVICE_ROLE_KEY` is set
- ✅ Check user is authenticated

### **"Unauthorized" error**

- ✅ Check user is signed in
- ✅ Check NextAuth session is working
- ✅ Check `NEXTAUTH_SECRET` is set

### **Recordings not appearing**

- ✅ Check database for `FreestyleSession` records
- ✅ Check Supabase Storage for files
- ✅ Check API response in browser network tab
- ✅ Check browser console for errors

### **Download not working**

- ✅ Check recording has `storageUrl`
- ✅ Check Supabase Storage file exists
- ✅ Check CORS settings on bucket (should allow public access)
- ✅ Check browser console for CORS errors

### **Delete not working**

- ✅ Check user owns the recording
- ✅ Check database record exists
- ✅ Check storage file exists
- ✅ Check API response for errors

---

## 📊 **VERIFY SETUP**

### **Check Database**

```sql
-- Check recordings in database
SELECT * FROM freestyle_sessions
ORDER BY created_at DESC
LIMIT 10;
```

### **Check Storage**

1. Go to Supabase Dashboard > Storage > recordings
2. Should see folders with user IDs
3. Should see `.webm` files in folders

### **Check API**

```bash
# Test GET recordings (requires auth)
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  http://localhost:3000/api/recordings
```

---

## 🎉 **SUCCESS INDICATORS**

✅ Recordings save automatically after session  
✅ Recordings appear in library page  
✅ Recordings can be played in browser  
✅ Recordings can be downloaded  
✅ Recordings can be deleted  
✅ Statistics update correctly  
✅ No errors in console  
✅ Files appear in Supabase Storage  
✅ Sessions appear in database

---

## 🚀 **NEXT STEPS**

After Phase 4 is working:

1. Test all flows end-to-end
2. Verify storage usage
3. Monitor API performance
4. Plan Phase 5: Review Page & Advanced Features

---

**Phase 4 is complete!** 🎉
