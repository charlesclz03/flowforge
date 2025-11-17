# Quick Fix Guide - Common Issues

## 📋 Quick Links

- [macOS Permission Issues](#macos-permission-issues) - EPERM, EMFILE errors
- [Recording & Redirect Issues](#recording--redirect-issues)
- [Server Won't Start](#server-wont-start)

---

## macOS Permission Issues

**See:** [MACOS_PERMISSION_FIX.md](MACOS_PERMISSION_FIX.md) for detailed guide

### Quick Fix

```bash
killall -9 node
cd "/Users/c0369/Documents/AI BUSINESS/FlowForge - Freestyle"
xattr -cr .
rm -rf node_modules .next
npm install
npm run dev
```

### Common Errors

- `EPERM: operation not permitted`
- `EMFILE: too many open files`
- Server starting on wrong port (3001, 3002, etc.)

---

## Recording & Redirect Issues

### 🚨 Issues

1. `/recordings` redirects to home with `callbackUrl=%2Frecordings`
2. No success message after recording
3. No files in Supabase

## ✅ Quick Fixes

### Fix 1: Sign In First (CRITICAL)

**The redirect happens because you're NOT authenticated.**

1. **Go to home page** (`/`)
2. **Click "Sign In" button**
3. **Sign in with Google**
4. **After signing in, you'll be redirected to `/recordings` automatically**

**OR** manually go to `/recordings` after signing in.

### Fix 2: Test Recording Save

**Make sure you're signed in first!**

1. **Go to Practice page** (`/practice`)
2. **Select a beat**
3. **Click Play** to start recording
4. **Record for at least 10 seconds** (important!)
5. **Click Stop** (the square button)
6. **Check browser console** (F12) for logs

**Expected Console Logs:**

```
Recording complete: [size] bytes
Saving recording: {...}
Recording saved successfully: {...}
```

### Fix 3: Check Authentication

**Quick Check:**

- Look at the header - do you see your avatar/profile picture?
- If you see "Sign In" button → **You're NOT signed in**
- If you see your avatar → **You're signed in**

**API Check:**

- Go to: `http://localhost:3000/api/auth/session`
- If you see `{}` → Not authenticated
- If you see user data → Authenticated

## 🔍 Debugging Steps

### Step 1: Check if Signed In

- [ ] Avatar visible in header?
- [ ] `/api/auth/session` returns user data?
- [ ] Can access `/profile` without redirect?

### Step 2: Test Recording

- [ ] Signed in?
- [ ] Beat selected?
- [ ] Recording starts (red dot appears)?
- [ ] Record for 10+ seconds?
- [ ] Stop recording?
- [ ] Console shows "Recording complete"?
- [ ] Console shows "Saving recording"?
- [ ] Success message appears?

### Step 3: Check Supabase

- [ ] File in Supabase Storage?
- [ ] Recording in `/recordings` page?

## 🐛 Common Problems

### Problem: "callbackUrl=%2Frecordings" in URL

**Cause**: Not authenticated  
**Fix**: Sign in first

### Problem: No success message

**Cause**: Recording didn't save  
**Check**:

- Are you signed in?
- Did you record for 10+ seconds?
- Check console for errors

### Problem: No files in Supabase

**Cause**: Upload failed  
**Check**:

- Console for "Failed to upload" error
- Server logs for Supabase errors
- Supabase Storage configuration

## 📋 Action Items

1. ✅ **Sign in** (if not already)
2. ✅ **Go to `/recordings`** (should work now)
3. ✅ **Test recording** (record for 10 seconds)
4. ✅ **Check console** for logs
5. ✅ **Check Supabase Storage** for files

## 🎯 Expected Results

### After Signing In:

- ✅ Can access `/recordings` without redirect
- ✅ Can access `/profile` without redirect
- ✅ Recordings page loads

### After Recording:

- ✅ Success message appears
- ✅ File in Supabase Storage
- ✅ Recording in `/recordings` page

---

**Most Important**: **Sign in first!** The redirect happens because you're not authenticated.
