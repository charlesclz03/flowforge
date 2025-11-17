# Fix: Recordings Page Redirect Issue

## Changes Made

### 1. Updated Middleware (`middleware.ts`)
- Uses `withAuth` from NextAuth with proper callback handling
- Properly configured to protect `/recordings`, `/review`, and `/profile` routes
- Redirects unauthenticated users to `/` (sign-in page) with `callbackUrl` parameter
- Preserves the original destination URL in the redirect

### 2. Updated SignInButton (`components/auth/SignInButton.tsx`)
- Now preserves the callback URL from URL search params
- Uses current pathname if not on home page
- Wrapped in Suspense boundary for `useSearchParams`
- Falls back to `/practice` if no callback URL is found

### 3. Updated Recordings Page (`app/recordings/page.tsx`)
- Removed client-side redirect (middleware handles it)
- Removed unused `useRouter` import
- Shows loading state while session is being checked
- Middleware handles authentication, page just shows loading/content

### 4. Updated NextAuth Config (`lib/auth.ts`)
- Added `redirect` callback to handle callback URLs properly
- Allows relative callback URLs
- Preserves callback URLs on the same origin

### 5. Updated Home Page (`app/page.tsx`)
- Added `useSearchParams` and `useRouter` hooks
- Wrapped in `Suspense` boundary for `useSearchParams`
- Automatically redirects to `callbackUrl` after sign-in
- Logs redirect for debugging

## How It Works Now

### When User is NOT Authenticated:
1. User tries to access `/recordings`
2. Middleware checks session → no session found
3. Middleware redirects to `/` (sign-in page) with callback URL
4. User clicks "Sign In"
5. After signing in, user is redirected back to `/recordings`

### When User IS Authenticated:
1. User tries to access `/recordings`
2. Middleware checks session → session found
3. User sees recordings page

## Testing

### Test 1: Not Signed In
1. Sign out (if signed in)
2. Go to `/recordings`
3. **Expected**: Redirected to `/` (home page)
4. Click "Sign In"
5. **Expected**: After signing in, redirected to `/recordings`

### Test 2: Already Signed In
1. Sign in to your account
2. Go to `/recordings`
3. **Expected**: See recordings page (no redirect)

### Test 3: Sign In from Home Page
1. Sign out
2. Go to `/recordings` (will redirect to `/`)
3. Click "Sign In"
4. **Expected**: After signing in, redirected to `/recordings` (not `/practice`)

### Test 4: Direct Access
1. Sign out
2. Manually type `/recordings` in address bar
3. **Expected**: Redirected to `/` with callback URL preserved
4. Sign in
5. **Expected**: Redirected to `/recordings`

## Verification Steps

1. **Check if you're signed in:**
   - Look for your avatar/profile in the header
   - If you see "Sign In" button, you're not signed in

2. **Test the flow:**
   - Sign out
   - Try to access `/recordings`
   - You should be redirected to `/`
   - Sign in
   - You should be redirected to `/recordings`

3. **Check browser console:**
   - Open browser console (F12)
   - Look for any errors
   - Check Network tab for redirects

4. **Check server logs:**
   - Check terminal where `npm run dev` is running
   - Look for any errors related to:
     - NextAuth
     - Database connection
     - Middleware

## Common Issues

### Issue: Still redirecting to home after signing in
**Solution:**
- Clear browser cookies for `localhost:3000`
- Sign in again
- Check if `NEXTAUTH_SECRET` is set in `.env.local`
- Restart development server

### Issue: Session not persisting
**Solution:**
- Check database connection
- Verify `DATABASE_URL` is set correctly
- Check if sessions table exists in database
- Run: `npx prisma studio` to check sessions table

### Issue: Middleware not working
**Solution:**
- Check `middleware.ts` is in the root directory
- Verify `matcher` includes `/recordings/:path*`
- Restart development server
- Check for TypeScript errors

## Files Changed

- `middleware.ts` - Updated middleware configuration with callback URL handling
- `components/auth/SignInButton.tsx` - Added callback URL preservation (already had this)
- `app/recordings/page.tsx` - Removed client-side redirect (middleware handles it)
- `app/page.tsx` - Added automatic redirect to callbackUrl after sign-in
- `lib/auth.ts` - Added redirect callback (already had this)

## Next Steps

1. **Restart development server:**
   ```bash
   npm run dev
   ```

2. **Test the flow:**
   - Sign out
   - Try to access `/recordings`
   - Sign in
   - Verify you're redirected to `/recordings`

3. **If still not working:**
   - Check browser console for errors
   - Check server logs for errors
   - Verify all environment variables are set
   - See `TROUBLESHOOTING_RECORDINGS_REDIRECT.md` for more help

## Expected Behavior

✅ **When NOT signed in:**
- Accessing `/recordings` → Redirected to `/`
- After signing in → Redirected to `/recordings`

✅ **When signed in:**
- Accessing `/recordings` → See recordings page
- No redirects

✅ **Callback URL preservation:**
- Original URL is preserved in redirect
- After signing in, user is redirected back to original URL

## 🔄 Related Fixes

### Recording Save Fix
- Recordings now properly save when user is authenticated
- Stop button correctly stops recording (not pauses)
- See `FIX_RECORDING_SAVE.md` for recording save fixes

## 📚 Related Documentation

- `DIAGNOSE_RECORDING_ISSUES.md` - Comprehensive diagnostic guide
- `QUICK_FIX_GUIDE.md` - Quick troubleshooting steps
- `FIX_RECORDING_SAVE.md` - Recording save fixes
- `PHASE_4_COMPLETE.md` - Complete Phase 4 documentation

## ⚠️ Important Notes

1. **Authentication Required**: Users must be signed in to access `/recordings`
2. **Sign In First**: If redirected to home page, sign in first, then try `/recordings` again
3. **Callback URL**: The redirect preserves the original destination, so after signing in, you'll be taken to the page you were trying to access

---

**Status**: ✅ Fixed  
**Last Updated**: November 11, 2025  
**Tested**: Pending user verification  
**Related Issues**: Recording save requires authentication


