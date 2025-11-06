# NextAuth.js Google OAuth Setup Guide

## Installation

```bash
npm install next-auth
```

## 1. Google Cloud Console Setup

### Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Configure:
   - **Name**: FlowForge Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://flowforge.app`
     - `https://your-vercel-domain.vercel.app`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://flowforge.app/api/auth/callback/google`
     - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

## 2. Environment Variables

Add to `.env.local`:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

For production (Vercel):
```bash
NEXTAUTH_URL=https://flowforge.app
NEXTAUTH_SECRET=<same-secret-as-local>
GOOGLE_CLIENT_ID=<same-as-local>
GOOGLE_CLIENT_SECRET=<same-as-local>
```

## 3. File Structure

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
lib/
└── auth.ts
```

## 4. Implementation Files

### `lib/auth.ts`
```typescript
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}
```

### `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### Update `prisma/schema.prisma`

Add NextAuth models:

```prisma
model Account {
  id                String  @id @default(uuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(uuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  accounts Account[]
  sessions Session[]
  freestyleSessions FreestyleSession[]

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

Update FreestyleSession to link to User:
```prisma
model FreestyleSession {
  // ... existing fields
  userId String? @map("user_id")
  user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
  // ...
}
```

### `types/next-auth.d.ts`
```typescript
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
```

## 5. Client Components

### Sign In Button (`components/auth/SignInButton.tsx`)
```typescript
'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { LogIn, LogOut } from 'lucide-react'

export function SignInButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="h-10 w-24 animate-pulse bg-gray-700 rounded" />
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-orange text-black hover:bg-accent-orange/90 transition-colors"
    >
      <LogIn size={18} />
      <span>Sign In with Google</span>
    </button>
  )
}
```

### Session Provider Wrapper (`components/auth/SessionProvider.tsx`)
```typescript
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

### Update `app/layout.tsx`
```typescript
import { SessionProvider } from '@/components/auth/SessionProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

## 6. Protected API Routes

### Middleware (`middleware.ts`)
```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/api/sessions/:path*',
    '/profile/:path*',
  ],
}
```

### Get Session in API Route
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use session.user.id
  const userId = session.user.id
  // ...
}
```

### Get Session in Server Component
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return <div>Welcome {session.user.name}</div>
}
```

## 7. Database Migration

After updating schema:

```bash
npx prisma migrate dev --name add_auth_models
npx prisma generate
```

## 8. Testing

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000`
3. Click "Sign In with Google"
4. Authorize the app
5. Check database for user/session records

## 9. Security Checklist

- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] Never commit `.env.local` to git
- [ ] Use different secrets for dev/staging/prod
- [ ] Verify redirect URIs match exactly
- [ ] Enable 2FA on Google Cloud Console account
- [ ] Review OAuth consent screen settings
- [ ] Set up proper error pages

## 10. Common Issues

### "Invalid redirect_uri"
- Check authorized redirect URIs in Google Console
- Ensure `NEXTAUTH_URL` matches your domain exactly

### "Client authentication failed"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check for extra spaces or newlines

### Session not persisting
- Check database connection
- Verify session table exists
- Check cookie settings (secure in production)

## 11. Next Steps After Auth

1. Update session creation to link to authenticated user
2. Add user profile page
3. Show user's sessions only
4. Implement subscription status checks
5. Add email verification (optional)

