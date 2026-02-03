# Deployment Readiness: v0.9.993 ("Type Safe")

**Date**: 2026-02-03  
**Target**: Vercel project `flowforge-freestyle` (auto-deploys from `main`)  
**Status**: Ready to deploy (pending commit + push)

---

## Release Summary (v0.9.993)

- **Stripe reliability**: Eliminated “paid but not Pro yet” race by having `/orderconfirmed` wait for confirmed activation.
- **Webhook hardening**: Stripe webhook handler is idempotent and won’t 500 for unknown customers/users.
- **Version/docs alignment**: Standardized “Type Safe” to `v0.9.993` to avoid collision with `v0.9.93` (Infinity Loop).

---

## Pre-Deploy Checklist (Local)

### Windows-safe commands (PowerShell)

```powershell
& "C:/Program Files/nodejs/npm.cmd" install
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run test -- --run

# Build requires Supabase env vars even for static analysis; set safe dummy values locally:
$env:NEXT_PUBLIC_SUPABASE_URL='https://test.supabase.co'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='test-anon-key'
$env:NEXTAUTH_URL='http://localhost:3000'
& "C:/Program Files/nodejs/npm.cmd" run build
```

**Pass criteria**: no lint/type/test/build errors (warnings OK).

---

## Database / Prisma Check (Critical)

- Confirm `prisma/schema.prisma` has **not** changed since the last deploy.
- If schema changed: run the `.agent/workflows/database_migration.md` workflow before deploying.

---

## Asset Verification (PWA/TWA)

- `public/favicon.ico` exists
- `public/icon-192x192.png` exists
- `public/icon-512x512.png` exists
- `public/.well-known/assetlinks.json` exists and is valid JSON

---

## Stripe Validation (Live, no new charges by default)

1. In Vercel env vars (no values pasted into docs/PRs):
   - `STRIPE_SECRET_KEY` is `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET` is set for the production webhook endpoint
   - `STRIPE_PRICE_ID_MONTHLY` / `STRIPE_PRICE_ID_YEARLY` match your live catalog
2. In Stripe Dashboard:
   - Locate a recent `checkout.session.completed` for a Pro purchase
   - Use **Resend** / **Send to webhook** to hit production `/api/stripe/webhook`
3. Verify:
   - User becomes Pro (`subscriptionStatus` active/trialing) and `/api/subscription/status` returns `isPro: true`
   - `/orderconfirmed` waits until activation before celebrating

---

## Security Audit (Known Issue)

`npm audit --audit-level=high` currently reports **high** vulnerabilities whose automated fix requires breaking upgrades (e.g., `next@16`, `eslint@9`, `vitest@4`). These were **not** applied as part of this release; schedule an upgrade pass separately.

---

## Deploy Steps (Vercel)

```bash
git add .
git commit -m "chore(release): v0.9.993 - Type Safe"
git push origin main
```

After push:
- Monitor the Vercel build logs for the `flowforge-freestyle` project.
- Smoke-test key flows: upgrade → `/orderconfirmed`, billing portal, `/practice` audio playback.

---

**Last Updated**: 2026-02-03  
**Document Version**: 3.0 (Release Checklist)
