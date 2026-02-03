# Quick Start - Next Session

**Last Updated**: 2026-02-03  
**Project Status**: Active Development (v0.9.993)

---

## Instant Start (Windows-Safe)

```powershell
cd "c:\Projects\FlowForge - Freestyle"
git pull --rebase
& "C:/Program Files/nodejs/npm.cmd" install
& "C:/Program Files/nodejs/npx.cmd" prisma generate
& "C:/Program Files/nodejs/npm.cmd" run dev
```

Open: http://localhost:3000

> Note: Local dev requires a valid `.env.local` (Supabase, NextAuth, Stripe if testing payments locally).

---

## Current Focus

- Stripe: subscription activation + webhook reliability (live)
- Mobile: audio reliability smoke + CSP/CORS sanity
- Quality: keep lint/types/tests/build green

---

## Key Docs

| Document | Purpose |
| --- | --- |
| `DOCS/project/PROJECT_STATUS.md` | Current state and priorities |
| `DOCS/reference/PATCH_NOTES_MASTER.md` | Canonical release history |
| `DOCS/guides/DEVELOPER_SETUP.md` | Local setup + env vars |
| `DOCS/guides/DEPLOYMENT.md` | Deployment workflow |

---

## Common Tasks (Windows-Safe)

### Run Dev Server

```powershell
& "C:/Program Files/nodejs/npm.cmd" run dev
```

### Lint

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
```

### Typecheck

```powershell
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
```

### Tests (single run)

```powershell
& "C:/Program Files/nodejs/npm.cmd" run test -- --run
```

### Build

```powershell
& "C:/Program Files/nodejs/npm.cmd" run build
```

### Prisma Studio

```powershell
& "C:/Program Files/nodejs/npx.cmd" prisma studio
```

