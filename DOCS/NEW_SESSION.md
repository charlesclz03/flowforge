# New Session Playbook

Use this checklist to get productive fast in a new session.

## 1) Pull and Install
```bash
git pull origin main
npm install
```

## 2) Env Vars
- Ensure `.env.local` exists with:
  - `DATABASE_URL` (pooled, port 6543, `pgbouncer=true&sslmode=require`)
  - `DIRECT_URL` (direct, port 5432, `sslmode=require`)
- If password has special chars, URL-encode them (e.g. `*` -> `%2A`).

## 3) Prisma
```bash
npx prisma generate
npx prisma migrate dev
# optional seed (uses DIRECT_URL)
export $(grep -E '^(DIRECT_URL)=' .env | xargs)
DATABASE_URL="$DIRECT_URL" npx prisma db seed
```

## 4) Run
```bash
npm run dev
# open http://localhost:3000
```

## 5) Smoke Checks
- Home loads
- `/api/beats` returns JSON
- `/api/words/random?count=5&difficulty=2` returns JSON

## 6) Common Fixes
- Build failures due to Prettier are warnings; not blocking.
- If seed fails with PgBouncer, use the `DIRECT_URL` override snippet above.

## 7) Useful Scripts
- `npm run build` – production build
- `npm run lint` – linting
- `npm test` – unit tests

Ready to code.


