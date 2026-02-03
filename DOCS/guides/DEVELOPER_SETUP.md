# Freestyla Setup Guide

This guide will help you set up the development environment for Freestyla.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

## Initial Setup

### 1. Install Dependencies

**Windows (PowerShell, recommended in this repo):**

```powershell
& "C:/Program Files/nodejs/npm.cmd" install
```

### 2. Database Setup (Supabase)

Freestyla uses Supabase for PostgreSQL database hosting.

#### Steps:

1. Go to [Supabase](https://supabase.com/) and create a free account
2. Create a new project
3. Navigate to Project Settings > Database
4. Copy the "Connection string" (select "URI" format)
5. Replace the placeholders in `.env.local`

#### Connection strings (Supabase best practice)

- Use a **pooled** connection for runtime (PgBouncer/6543):

```
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
```

- Use a **direct** connection for migrations/seeding (5432):

```
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"
```

Notes:

- URL-encode special characters in the password (e.g. `*` becomes `%2A`).
- Prisma reads `.env` by default during CLI. Keep both variables in `.env.local` and `.env` if needed.

#### Create `.env.local`:

```powershell
Copy-Item env.example .env.local
```

Edit `.env.local` and add your Supabase database URL:

```
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Runtime (pooled via PgBouncer, port 6543)
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Migrations/seed (direct 5432)
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"
```

### 3. Initialize Database

```powershell
# Generate Prisma client
& "C:/Program Files/nodejs/npx.cmd" prisma generate

# Run migrations
& "C:/Program Files/nodejs/npx.cmd" prisma migrate dev

# Optional: seed the database
& "C:/Program Files/nodejs/npx.cmd" prisma db seed
```

### 4. Run Development Server

```powershell
& "C:/Program Files/nodejs/npm.cmd" run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Google OAuth Setup (For Later)

When implementing authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

```
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Schema

The database includes the following tables:

- **Beat**: Stores beat metadata (title, BPM, storage URL, premium status)
- **Word**: Word library with difficulty levels and syllable counts
- **FreestyleSession**: Saved practice sessions (currently client-side only for MVP)

## Testing

Run tests:

```powershell
# Unit tests (Vitest)
& "C:/Program Files/nodejs/npm.cmd" run test -- --run
```

Run E2E tests (Playwright):

```powershell
& "C:/Program Files/nodejs/npx.cmd" playwright test
```

## Common Issues

### Database Connection Errors

- Ensure Supabase project is running
- Check DATABASE_URL format
- Verify network connectivity

### Build Errors

- Clear `.next` folder: `Remove-Item -Recurse -Force .next`
- Clear node_modules and reinstall:
  - `Remove-Item -Recurse -Force node_modules`
  - `& "C:/Program Files/nodejs/npm.cmd" install`

### TypeScript Errors

- Regenerate Prisma client: `npx prisma generate`
- Restart TypeScript server in your IDE

## Project Structure

```
flowforge/
  app/                    # Next.js App Router pages
  components/             # React components
  lib/                    # Utility functions and helpers
  prisma/                 # Database schema and migrations
  public/                 # Static assets (beats, images)
  styles/                 # Global styles
  types/                  # TypeScript type definitions
  __tests__/              # Unit tests (Vitest)
  e2e/                    # E2E tests (Playwright)
```

## Development Workflow

1. Create a new branch for features: `git checkout -b feature/your-feature`
2. Write code and tests
3. Run linter: `npm run lint`
4. Run tests: `npm test`
5. Commit changes: `git commit -m "feat: your feature"`
6. Push and create PR

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment instructions.
