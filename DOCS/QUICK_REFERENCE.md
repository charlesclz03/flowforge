# Freestyla - Quick Reference Card 

## Start Development Server

```powershell
cd "c:\Projects\FlowForge - Freestyle"
& "C:/Program Files/nodejs/npm.cmd" run dev
```

Visit: http://localhost:3000

## Database Status

-  **Connected**: Supabase PostgreSQL
-  **Seeded**: 15 beats, 45 words
-  **Working**: All API endpoints operational

## API Endpoints

### Get Beats

```bash
curl http://localhost:3000/api/beats
curl http://localhost:3000/api/beats?free=true
```

### Get Random Words

```bash
curl "http://localhost:3000/api/words/random?count=10&difficulty=2"
```

### Create Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"beatId":"<BEAT_ID>","title":"Session","durationSeconds":120,"frequency":8,"difficulty":2}'
```

### Get Sessions

```bash
curl http://localhost:3000/api/sessions
```

## Environment Variables

### `.env.local` (Next.js)

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10"
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres"
```

> **Security**: Never commit real secrets. Rotate credentials if they were ever exposed.

### Optional (When Ready)

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

## Database Commands

### Generate Prisma Client

```powershell
& "C:/Program Files/nodejs/npx.cmd" prisma generate
```

### Run Migrations

```powershell
& "C:/Program Files/nodejs/npx.cmd" prisma migrate dev
```

### Seed Database

```powershell
& "C:/Program Files/nodejs/npx.cmd" tsx prisma/seed.ts
```

### Reset Database

```powershell
& "C:/Program Files/nodejs/npx.cmd" prisma migrate reset
```

### Open Prisma Studio

```bash
npx prisma studio
```

## Build & Test

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Type Check

```bash
npm run build  # Includes type checking
```

### Run Tests

```bash
npm test
```

## File Structure

```
Freestyla - Freestyle/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── beats/
│   │   ├── words/
│   │   └── sessions/
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities & database
│   ├── db/               # Database access layer
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema & seeds
├── public/               # Static assets
├── DOCS/                 # Documentation
└── .env.local           # Environment variables
```

## Important Files

- `DATABASE_SETUP_COMPLETE.md` - Database setup guide
- `ASSETS_GUIDE.md` - Asset creation guide
- `SESSION_SUMMARY.md` - What we accomplished
- `DOCS/VERCEL_DEPLOY.md` - Deployment guide

## Pending Tasks

1. **Create Visual Assets** (See `ASSETS_GUIDE.md`)
   - Icons: favicon, PWA icons, apple-touch-icon
   - OG image for social media (1200x630px)

2. **Deploy to Vercel** (See `DOCS/VERCEL_DEPLOY.md`)
   - Connect GitHub repo
   - Add environment variables
   - Deploy

## Supabase Dashboard

https://supabase.com/dashboard/project/<PROJECT_REF>

## Common Issues

### "Tenant or user not found"

- Check hostname has double 'v': `<PROJECT_REF>`
- Verify password is URL-encoded

### Connection pool timeout

- Already configured with `connection_limit=1`
- Restart dev server if persists

### Database not updating

- Check `DISABLE_DB` is not set in `.env.local`
- Verify connection strings are correct

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Open database GUI
npx prisma studio

# Test API
./test-api.sh
```

## Support Resources

- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Supabase Docs: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

**Pro Tip**: Keep this file open while developing for quick command reference!
