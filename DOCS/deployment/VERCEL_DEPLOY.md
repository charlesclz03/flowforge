# Freestyla Deployment Guide

## ✅ Deployment Target: `flowforge-freestyle`

> [!NOTE]
> **December 18, 2025**: The `flowforge` Vercel project has been disconnected from GitHub.
>
> All pushes to `main` now **only** deploy to `flowforge-freestyle`.

### Correct Workflow:

```bash
# Push to deploy
git add .
git commit -m "Your message"
git push origin main

# Vercel auto-deploys flowforge-freestyle from main branch
```

### Why This Matters:

- `flowforge` is a different project with different environment variables
- `flowforge-freestyle` is the correct project linked to this codebase
- Deploying to the wrong project will cause build failures and missing env vars

---

## Overview

Deploy Freestyla to Vercel with proper environment variables and configuration.

**Live URL**: https://flowforge-freestyle.vercel.app

---

## 1. Prerequisites

- GitHub repository: `charlesclz03/flowforge-freestyle`
- Vercel project: `flowforge-freestyle` (NOT `flowforge`)
- Database: Supabase PostgreSQL
- Stripe account for payments

---

## 2. Environment Variables

### Required Variables (set in Vercel Dashboard):

```bash
# Site URL
NEXT_PUBLIC_SITE_URL=https://flowforge-freestyle.vercel.app

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://flowforge-freestyle.vercel.app
NEXTAUTH_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Supabase Storage
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 3. Deployment Commands

```bash
# Local build test
npm run build

# Deploy (auto via git push)
git add .
git commit -m "Your message"
git push origin main
```

---

## 4. Troubleshooting

### Common Errors:

**1. `Cannot find module ...` (e.g., `resend`, `react-intersection-observer`)**

- Use `npm install <package-name>` to ensure it's in `package.json`.
- Running `npm run build` **locally** helps reproduce these errors before pushing.

**2. `Prisma Client` Errors (Stale Cache)**

- If Vercel reports type errors for fields that _exist_ in `schema.prisma`:
  - Ensure `package.json` has `"postinstall": "prisma generate"`.
  - If error persists, use `as any` casting in the API route as a temporary bypass: `createSession({...} as any)`.
  - In Vercel Project Settings, clear the **Build Cache** and redeploy.

**3. `@vercel/og` Resolution**

- Use `import { ImageResponse } from 'next/og'` instead of `@vercel/og`.

---

**Last Updated**: December 18, 2025
