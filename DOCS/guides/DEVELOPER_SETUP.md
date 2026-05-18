# Developer Setup

**Current Version**: `1.1.5`
**Last Updated**: 2026-05-18

## Prerequisites

- Node.js 18+
- npm
- Git
- Access to project `.env.local` values

## Install

```powershell
& "C:/Program Files/nodejs/npm.cmd" install
```

## Environment Variables

Minimum local requirements:

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

For billing features, also configure Stripe keys.

## Database

```powershell
& "C:/Program Files/nodejs/npx.cmd" prisma generate
& "C:/Program Files/nodejs/npx.cmd" prisma migrate dev
```

## Local Run

```powershell
& "C:/Program Files/nodejs/npm.cmd" run dev
```

## Quality Gates

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npm.cmd" run build
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run docs:check
```

## Canonical References

- `DOCS/guides/DEPLOYMENT.md`
- `DOCS/project/PROJECT_STATUS.md`
- `DOCS/reference/PATCH_NOTES_MASTER.md`
- `DOCS/reference/DOC_CANONICAL_MAP.json`
