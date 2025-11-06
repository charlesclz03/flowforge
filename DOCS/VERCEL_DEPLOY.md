# Vercel Deployment Guide

## Overview
Deploy FlowForge to Vercel with proper environment variables and configuration.

## 1. Prerequisites

- GitHub repository with FlowForge code
- Vercel account (free tier works for MVP)
- Database (Supabase recommended)
- Domain (optional, Vercel provides free subdomain)

## 2. Initial Setup

### Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select "FlowForge - Freestyle"
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

## 3. Environment Variables

### Required Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Site URL (update after first deploy)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# Database (Supabase)
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require

# NextAuth (generate secret: openssl rand -base64 32)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...

# Google Cloud Storage
GCS_BUCKET_NAME=flowforge-audio
GCS_PROJECT_ID=flowforge-prod
GOOGLE_APPLICATION_CREDENTIALS=./flowforge-uploader-key.json

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# AdSense (optional)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_AD_SLOT_BOTTOM=1234567890
NEXT_PUBLIC_AD_SLOT_SIDEBAR=0987654321
NEXT_PUBLIC_AD_SLOT_FEED=1122334455
```

### Environment Scopes

For each variable, select appropriate scopes:
- **Production**: Live site
- **Preview**: PR deployments
- **Development**: Local (usually use `.env.local` instead)

## 4. Build Configuration

### `vercel.json` (optional)

Create in project root:

```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=0, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

## 5. Database Setup

### Run Migrations

After first deploy, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run migration
vercel env pull .env.vercel
npx prisma migrate deploy
npx prisma db seed
```

Or use Vercel's built-in Postgres (alternative to Supabase):

```bash
vercel postgres create
```

## 6. Custom Domain (Optional)

### Add Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `flowforge.app`)
3. Follow DNS configuration instructions
4. Update environment variables:
   - `NEXT_PUBLIC_SITE_URL=https://flowforge.app`
   - `NEXTAUTH_URL=https://flowforge.app`

### DNS Configuration

Add these records to your DNS provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 7. Webhook Configuration

### Stripe Webhook

Update webhook endpoint in Stripe Dashboard:
- Old: `http://localhost:3000/api/stripe/webhook`
- New: `https://flowforge.app/api/stripe/webhook`

### Google OAuth

Add redirect URIs in Google Cloud Console:
- `https://flowforge.app/api/auth/callback/google`
- `https://your-app.vercel.app/api/auth/callback/google`

## 8. Post-Deployment Checklist

- [ ] Site loads successfully
- [ ] Database connection works
- [ ] Authentication works (Google Sign-In)
- [ ] API endpoints respond
- [ ] Stripe checkout works
- [ ] Webhooks receive events
- [ ] Analytics tracking works
- [ ] Error monitoring set up
- [ ] Performance acceptable (Lighthouse score)
- [ ] Mobile responsive
- [ ] SEO meta tags correct

## 9. Monitoring

### Vercel Analytics

Enable in Project Settings → Analytics:
- Web Vitals
- Real User Monitoring
- Error tracking

### Custom Monitoring

Add Sentry or similar:

```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 0.1,
})
```

## 10. CI/CD with GitHub Actions

The `.github/workflows/ci.yml` already set up will:
- Run on every push to `main`
- Lint code
- Type-check
- Run tests
- Build project

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests

## 11. Performance Optimization

### Edge Functions

For faster global performance, use Edge Runtime:

```typescript
// app/api/beats/route.ts
export const runtime = 'edge'
```

### Image Optimization

Already configured in `next.config.js`:

```javascript
images: {
  domains: ['storage.googleapis.com'],
}
```

### Caching

Add caching headers for static assets:

```typescript
// next.config.js
async headers() {
  return [
    {
      source: '/beats/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

## 12. Rollback Strategy

### Instant Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Git Rollback

```bash
git revert HEAD
git push origin main
```

## 13. Environment Management

### Multiple Environments

Create separate projects for:
- **Production**: `flowforge-prod`
- **Staging**: `flowforge-staging`
- **Development**: Local only

### Secrets Management

For sensitive keys:
1. Use Vercel's encrypted environment variables
2. Never commit secrets to git
3. Rotate keys regularly
4. Use different keys per environment

## 14. Cost Estimation

### Vercel Pricing

**Hobby (Free)**:
- 100 GB bandwidth/month
- Unlimited deployments
- 100 GB-hours serverless execution
- Good for MVP

**Pro ($20/month)**:
- 1 TB bandwidth
- Unlimited serverless execution
- Team collaboration
- Analytics
- Recommended for launch

### When to Upgrade

Upgrade when you hit:
- 100 GB bandwidth (≈10K active users)
- Need team access
- Want advanced analytics
- Need priority support

## 15. Troubleshooting

### Build Failures

**Error**: `Prisma Client not generated`
```bash
# Add to build command
prisma generate && next build
```

**Error**: `Module not found`
```bash
# Clear cache and redeploy
vercel --force
```

### Runtime Errors

**Error**: `Database connection failed`
- Check DATABASE_URL is correct
- Verify IP whitelist (Supabase)
- Check connection pooling settings

**Error**: `Authentication failed`
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches domain
- Verify OAuth redirect URIs

### Performance Issues

**Slow API responses**:
- Check database query performance
- Add database indexes
- Implement caching
- Consider Edge Runtime

**High bandwidth usage**:
- Optimize images
- Enable compression
- Add CDN for static assets
- Implement lazy loading

## 16. Security Checklist

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables encrypted
- [ ] Database credentials secure
- [ ] API rate limiting implemented
- [ ] CORS configured properly
- [ ] CSP headers set
- [ ] No secrets in client code
- [ ] Dependencies up to date

## 17. Launch Checklist

### Pre-Launch
- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Webhooks configured
- [ ] Analytics tracking
- [ ] Error monitoring
- [ ] Performance tested

### Launch Day
- [ ] Final production deploy
- [ ] Smoke test all features
- [ ] Monitor error rates
- [ ] Check webhook delivery
- [ ] Verify payment processing
- [ ] Monitor performance metrics

### Post-Launch
- [ ] Set up alerts for errors
- [ ] Monitor user feedback
- [ ] Track key metrics
- [ ] Plan first hotfix if needed

## 18. Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add

# Link local project
vercel link

# Check deployment status
vercel inspect <deployment-url>
```

## 19. Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Status Page](https://www.vercel-status.com/)

