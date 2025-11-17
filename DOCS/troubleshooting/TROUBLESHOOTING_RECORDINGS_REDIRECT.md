# Troubleshooting: Recordings Page Redirect Issue

## Issue
Going to `/recordings` redirects to home page instead of showing the recordings page.

## Possible Causes

### 1. User Not Authenticated
The middleware protects `/recordings` and redirects unauthenticated users to the sign-in page (`/`).

**Solution:**
- Make sure you're signed in
- Check if you see your profile/avatar in the header
- Try signing out and signing back in

### 2. Session Not Loading
The session might not be loading correctly, causing the middleware to think you're not authenticated.

**Solution:**
- Check browser console for errors
- Check if NextAuth is working (try going to `/api/auth/session`)
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Restart the development server

### 3. Database Session Issue
Since we're using database sessions, there might be an issue with the database connection.

**Solution:**
- Check if the database is accessible
- Verify `DATABASE_URL` is set correctly in `.env.local`
- Check database connection in Supabase Dashboard
- Verify Prisma client is generated: `npx prisma generate`

### 4. Middleware Configuration
The middleware might not be configured correctly.

**Current Configuration:**
```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/recordings/:path*', '/review/:path*', '/profile/:path*'],
}
```

## Debugging Steps

### Step 1: Check Authentication Status

1. Open browser console (F12)
2. Go to Application/Storage > Cookies
3. Look for `next-auth.session-token` cookie
4. If it doesn't exist, you're not signed in

### Step 2: Check Session API

1. Go to: `http://localhost:3000/api/auth/session`
2. If you see `{}`, you're not authenticated
3. If you see user data, you are authenticated

### Step 3: Check Middleware

1. Check browser Network tab
2. Look for requests to `/recordings`
3. Check the response status code
4. If it's 307/308 (redirect), the middleware is redirecting

### Step 4: Check Server Logs

1. Check terminal/console where `npm run dev` is running
2. Look for any errors related to:
   - Database connection
   - NextAuth
   - Middleware

## Solutions

### Solution 1: Sign In First

1. Make sure you're signed in:
   - Go to home page (`/`)
   - Click "Sign In" button
   - Sign in with Google
   - After signing in, try `/recordings` again

### Solution 2: Clear Cookies and Sign In Again

1. Clear browser cookies for `localhost:3000`
2. Sign in again
3. Try `/recordings` again

### Solution 3: Check Environment Variables

1. Verify `.env.local` has:
   ```bash
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=your_database_url
   ```

2. Restart development server:
   ```bash
   npm run dev
   ```

### Solution 4: Check Database Connection

1. Verify database is accessible:
   ```bash
   npx prisma db pull
   ```

2. Check if sessions table exists:
   ```bash
   npx prisma studio
   ```
   - Look for `sessions` table
   - Check if there are any session records

### Solution 5: Test Middleware Directly

1. Create a test API route: `app/api/test-auth/route.ts`
   ```typescript
   import { getServerSession } from 'next-auth'
   import { authOptions } from '@/lib/auth'
   import { NextResponse } from 'next/server'

   export async function GET() {
     const session = await getServerSession(authOptions)
     return NextResponse.json({ session, authenticated: !!session })
   }
   ```

2. Go to: `http://localhost:3000/api/test-auth`
3. Check if `authenticated` is `true`

## Expected Behavior

### When Authenticated:
1. User goes to `/recordings`
2. Middleware checks session
3. Session is valid
4. User sees recordings page

### When Not Authenticated:
1. User goes to `/recordings`
2. Middleware checks session
3. Session is invalid/missing
4. User is redirected to `/` (sign-in page)
5. After signing in, user should be able to access `/recordings`

## Quick Fix

If you're sure you're signed in but still getting redirected:

1. **Clear browser data:**
   - Clear cookies for `localhost:3000`
   - Clear cache
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

2. **Sign in again:**
   - Go to `/`
   - Click "Sign In"
   - Complete Google OAuth flow

3. **Try `/recordings` again**

4. **If still not working:**
   - Check browser console for errors
   - Check server logs for errors
   - Verify all environment variables are set
   - Restart development server

## Verification

After applying fixes, verify:

1. ✅ Can access `/recordings` when signed in
2. ✅ Cannot access `/recordings` when signed out (redirects to `/`)
3. ✅ After signing in from `/recordings` redirect, can access `/recordings`
4. ✅ Session persists across page refreshes
5. ✅ Can access `/profile` (also protected)
6. ✅ Cannot access `/profile` when signed out

## Still Not Working?

If none of the above solutions work:

1. Check `lib/auth.ts` for NextAuth configuration
2. Check `middleware.ts` for middleware configuration
3. Check `app/recordings/page.tsx` for page logic
4. Check browser console for JavaScript errors
5. Check server logs for server errors
6. Verify database connection
7. Verify NextAuth is working: `/api/auth/session`

## Related Files

- `middleware.ts` - Middleware configuration
- `lib/auth.ts` - NextAuth configuration
- `app/recordings/page.tsx` - Recordings page
- `components/auth/SessionProvider.tsx` - Session provider
- `.env.local` - Environment variables

---

**Last Updated**: November 11, 2025  
**Status**: Active troubleshooting guide


