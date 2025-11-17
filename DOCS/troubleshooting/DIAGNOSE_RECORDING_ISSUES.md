# Diagnose Recording & Redirect Issues

## 🔍 Issues Reported

1. ❌ `/recordings` redirects to home page with `callbackUrl=%2Frecordings`
2. ❌ No success message appeared after recording
3. ❌ No files in Supabase generated

## 🎯 Root Causes

### Issue 1: Recordings Page Redirect
**Problem**: User is **not authenticated**, so middleware redirects to home page.

**Solution**: 
1. **Sign in first** before accessing `/recordings`
2. After signing in, you'll be redirected to `/recordings` automatically

### Issue 2 & 3: Recording Not Saving
**Possible Causes**:
1. User not authenticated when recording
2. Recording stopped too quickly (< 1 second)
3. MediaRecorder didn't collect data
4. API call failed
5. Supabase Storage upload failed

## ✅ Step-by-Step Diagnosis

### Step 1: Check Authentication Status

1. **Open browser console** (F12)
2. **Check if you're signed in:**
   - Look for your avatar/profile in the header
   - If you see "Sign In" button, you're **not authenticated**

3. **Test session API:**
   - Go to: `http://localhost:3000/api/auth/session`
   - If you see `{}`, you're **not authenticated**
   - If you see user data, you're **authenticated**

### Step 2: Fix Recordings Page Access

**If not authenticated:**
1. Go to home page (`/`)
2. Click "Sign In" button
3. Sign in with Google
4. After signing in, you should be redirected to `/recordings` automatically
5. If not, manually go to `/recordings`

**If authenticated but still redirecting:**
1. Clear browser cookies for `localhost:3000`
2. Sign in again
3. Try `/recordings` again

### Step 3: Test Recording Save

1. **Make sure you're signed in** (check header for avatar)
2. **Go to Practice page** (`/practice`)
3. **Select a beat**
4. **Start recording** (click Play)
5. **Record for at least 5 seconds** (important!)
6. **Stop recording** (click Stop button)
7. **Check browser console** for these logs:

**Expected Console Logs:**
```
MediaRecorder stopped, audioChunks: [number], total size: [size]
Blob created: { size: [size], type: "audio/webm" }
Recording complete: [size] bytes
Recording blob type: audio/webm
User session: Authenticated
Selected beat: [beat name]
Saving recording: { blobSize, duration, beatId, userId, title }
FormData prepared, uploading...
Uploading recording to /api/recordings...
API response: { status: 200, data: {...} }
Recording saved successfully: {...}
```

### Step 4: Check What's Missing

**If you see "Not saving recording: { hasSession: false, hasBeat: true }":**
- ❌ **Problem**: User is not authenticated
- ✅ **Solution**: Sign in first

**If you see "Recording blob is empty":**
- ❌ **Problem**: Recording stopped too quickly
- ✅ **Solution**: Record for at least 3-5 seconds

**If you see "Failed to save recording":**
- ❌ **Problem**: API call failed
- ✅ **Solution**: Check server logs, check Supabase Storage config

**If you see "Unauthorized" error:**
- ❌ **Problem**: Authentication issue
- ✅ **Solution**: Sign in again, check NextAuth config

**If you see no logs at all:**
- ❌ **Problem**: Recording didn't complete
- ✅ **Solution**: Check if recording actually started (red dot should appear)

## 🔧 Quick Fixes

### Fix 1: Sign In First

1. Go to home page
2. Click "Sign In"
3. Complete Google OAuth
4. Try `/recordings` again

### Fix 2: Record Longer

1. Start recording
2. **Wait at least 5 seconds** before stopping
3. Stop recording
4. Check console for logs

### Fix 3: Check Browser Console

1. Open browser console (F12)
2. Look for any errors (red text)
3. Look for the expected logs listed above
4. Share the logs if you need help

### Fix 4: Check Server Logs

1. Look at terminal where `npm run dev` is running
2. Look for:
   - API request logs
   - Supabase Storage errors
   - Database errors
   - Authentication errors

## 📋 Verification Checklist

### Authentication
- [ ] User is signed in (avatar visible in header)
- [ ] `/api/auth/session` returns user data
- [ ] Can access `/recordings` without redirect
- [ ] Can access `/profile` without redirect

### Recording
- [ ] Recording starts (red dot appears)
- [ ] Recording indicator shows duration
- [ ] Recording stops when button clicked
- [ ] Console shows "Recording complete"
- [ ] Console shows "Saving recording"
- [ ] Console shows "Recording saved successfully"
- [ ] Success message appears on page

### Storage
- [ ] File appears in Supabase Storage
- [ ] File is in correct folder (`userId/recordingId.webm`)
- [ ] File size > 0
- [ ] Recording appears in `/recordings` page

## 🐛 Common Problems

### Problem: "callbackUrl=%2Frecordings" in URL
**Cause**: User is not authenticated
**Solution**: Sign in first, then try `/recordings` again

### Problem: No success message
**Cause**: Recording didn't save (check console logs)
**Solution**: 
- Make sure you're signed in
- Record for at least 5 seconds
- Check console for errors

### Problem: No files in Supabase
**Cause**: Upload failed or user not authenticated
**Solution**:
- Check console for "Failed to upload recording" error
- Check server logs for Supabase errors
- Verify Supabase Storage is configured correctly
- Make sure you're signed in

## 🧪 Test Flow

1. **Sign in** (if not already)
2. **Go to Practice page**
3. **Select a beat**
4. **Start recording** (click Play)
5. **Record for 10 seconds** (to be safe)
6. **Stop recording** (click Stop)
7. **Check console** for logs
8. **Check for success message**
9. **Go to `/recordings` page**
10. **Check Supabase Storage**

## 📊 Expected Results

### When Everything Works:
- ✅ Can access `/recordings` when signed in
- ✅ Recording saves successfully
- ✅ Success message appears
- ✅ File appears in Supabase Storage
- ✅ Recording appears in `/recordings` page

### When Something's Wrong:
- ❌ Check console for error messages
- ❌ Check server logs for errors
- ❌ Verify authentication status
- ❌ Verify Supabase Storage config

## 🎯 Next Steps

1. **Sign in** to your account
2. **Test recording** (record for 10 seconds)
3. **Check console logs** for any errors
4. **Share console logs** if you need help debugging

---

**Last Updated**: November 11, 2025  
**Status**: Diagnostic guide


