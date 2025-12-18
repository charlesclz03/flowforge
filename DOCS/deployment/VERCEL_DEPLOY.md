# FlowForge Deployment Guide

## ⚠️ IMPORTANT: Deployment Target

> [!CAUTION]
> **NEVER deploy to the `flowforge` project on Vercel.**
> 
> Always deploy to **`flowforge-freestyle`** project.

### Correct Workflow:

```bash
# Push to the correct GitHub repo
git push origin main

# The correct Vercel project (flowforge-freestyle) will auto-deploy
```

### Why This Matters:
- `flowforge` is a different project with different environment variables
- `flowforge-freestyle` is the correct project linked to this codebase
- Deploying to the wrong project will cause build failures and missing env vars

---

## Overview

Deploy FlowForge to Vercel with proper environment variables and configuration.

**Live URL**: https://flowforge-pi.vercel.app

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
NEXT_PUBLIC_SITE_URL=https://flowforge-pi.vercel.app

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://flowforge-pi.vercel.app
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

**`Cannot find module '@vercel/og'`**
- Use `import { ImageResponse } from 'next/og'` instead of `@vercel/og`

**`Prisma Client not generated`**
- Build command should be: `prisma generate && next build`

---

**Last Updated**: December 18, 2025
