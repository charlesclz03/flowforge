## FlowForge

Your AI‑powered freestyle rap practice partner. This README gives new agents a complete context, roadmap, and working assumptions to get productive fast.


## 1) TL;DR
- **What**: Web-first practice tool for freestyle rappers combining curated beats, on‑beat word prompts, and session recording in one browser experience.
- **Why**: Solve writer’s block, timing, and practice consistency with a game‑like loop; long‑term evolve into a "Guitar Hero for freestyle" scoring system.
- **Who**: Primary user is the aspiring artist (16–24); secondary is the hobbyist rapper (25–35).
- **How**: MVP in Next.js (App Router, TypeScript) on Vercel; V2 adds a Python/FastAPI microservice on GCP for AI features.
- **Business**: Freemium; Pro at $4.99/mo ($49.99/yr). Ads on free tier. Focus on habit/retention and conversion via unique AI features.
- **Dev Tooling Recommendation**: Trae IDE + Gemini 2.5 Pro for structured agentic building (free, high-velocity). Strong runner‑up: VS Code + Copilot.


## 2) Problem → Solution
- **Problems**
  - Writer’s block stalls creativity
  - Limited access to high‑quality, practice‑ready beats
  - No consistent practice partner; hard to stay on‑beat; no progress tracking
- **Solution**
  - Curated beat library (pre‑BPM analyzed)
  - On‑beat visual word prompts at user‑selected frequency/difficulty
  - Simple record → review → save/share flow


## 3) Product Overview
- **Core Loop (MVP)**
  1) Sign in with Google → 2) Select beat → 3) Pick prompt frequency (4/8/16 bars) and difficulty → 4) Play and freestyle as words appear on‑beat → 5) Stop → 6) Review and save/share
- **MVP Feature Set**
  - Google sign‑in
  - 15–20 free beats (template library)
  - On‑beat word generation and prominent visual display
  - Frequency/difficulty toggles
  - 2‑minute recording limit (free tier)
  - Local playback, save to profile, sharing
  - AdSense banner ads
- **V2 (Pro Tier)**
  - Subscription (remove ads, expanded beat library, unlimited recording)
  - TTS voice prompts, onboarding word preference wizard
  - User beat uploads + client‑side bpm analysis for uploads
- **V3 (Vision) – "Guitar Hero"**
  - VTT transcription of vocals
  - LLM contextual suggestions
  - Gamified scoring (rhyme density, rhythmic complexity, word usage)
  - Leaderboards/community features


## 4) Users & Positioning
- **Primary Persona**: Aspiring artist (16–24), posts to TikTok/IG, values authenticity/skill
- **Secondary Persona**: Hobbyist rapper (25–35), wants engaging, stress‑relief practice
- **Positioning**: A dedicated, gamified practice tool ("digital gym"), not a social recording studio. Differentiator is on‑beat prompting and future AI scoring.


## 5) Competitive Landscape (Snapshot)
- **RapChat / Rap Fame**: Social recording studios with large libraries; weak real‑time practice tools and engagement loop for skill growth. Historically low monetization/conversion.
- **YouTube Type Beats**: Infinite beats but non‑interactive and multi‑app friction.
- **RapScript/RhymeZone**: Standalone word/rhyme tools; not integrated, not on‑beat.
- **FlowForge Edge**: Integrated beat + on‑beat prompts + recorder; future AI scoring moat.


## 6) Business Model
- **Freemium**
  - Free: 10–15 starter beats, basic prompts, 2‑min recording, banner ads
  - Pro ($4.99/mo or $49.99/yr): Ad‑free, full beat library, unlimited recording, V2 AI features, uploads
- **Revenue Streams**: Subscriptions (primary), Ads (secondary)
- **Pricing Risks**: AI feature API usage (V2+) introduces variable COGS; consider usage limits or a higher "Studio" tier for power users


## 7) Go‑To‑Market (GTM)
- **Pre‑Launch**: Landing page waitlist; TikTok/Instagram content to seed audience
- **Launch**: SEO on "freestyle practice" terms; paid social; micro‑influencers (10k–50k)
- **Post‑Launch**: Community and email marketing to drive retention/upgrades
- **Web‑First**: Low trial friction vs. native; mitigate re‑engagement with email capture/community; plan native apps post‑revenue


## 8) Metrics & Goals
- **Acquisition**: MAU, site traffic, CAC
- **Activation**: Onboarding completion, % completing first session
- **Revenue**: Conversion rate (free→paid), MRR, Ad RPM, LTV
- **Retention**: Churn, DAU/MAU
- **North‑Star**: Habit formation and visible skill progression (streaks, skill score)


## 9) Technical Blueprint (MVP → V2)
- **Architecture (MVP)**
  - Monorepo with Next.js (App Router, TypeScript) for frontend + API routes
  - Deploy on Vercel (serverless, CI/CD, edge network)
  - PostgreSQL (Cloud SQL or Supabase/Railway) + Google Cloud Storage for audio
  - NextAuth.js (Google OAuth)
  - Stripe for subscriptions; AdSense for ads
- **V2 AI Service**
  - Python/FastAPI microservice on GCP (e.g., Cloud Run)
  - Google Cloud TTS and Speech‑to‑Text; Gemini/LLM for advanced prompts
  - Client‑side bpm analysis for user uploaded beats
- **Key Endpoints (illustrative)**
  - GET /api/beats → list beats
  - GET /api/words/random?difficulty=2&count=10 → batch word prompts
  - POST /api/sessions/upload → returns pre‑signed GCS URL; client uploads recording
  - GET /api/sessions → list saved sessions


## 10) Development Tooling Recommendation
- **Primary**: Trae IDE + Gemini 2.5 Pro
  - Structured "Builder Mode" with autonomous multi‑file edits, terminal integration
  - Unlimited access to top‑tier models; zero software cost; fast for non‑coders
- **Runner‑Up**: VS Code + GitHub Copilot
  - Best stability/ecosystem; excellent polyglot support; more manual steps but highly teachable workflow


## 11) Risks & Mitigations
- **Monetization Risk (High)**: Young audience; competitors show low conversion
  - Mitigate via compelling Pro features, habit/ownership mechanics, and possible tiering/usage limits for expensive AI features
- **Execution Risk (AI Vision)**: VTT/scoring requires applied ML/audio expertise
  - Phase rollouts, advisory support, validate with small cohorts before scale
- **Competitive Copying**: MVP loop is replicable by incumbents
  - Move quickly to V2/V3 where data/scoring creates defensible moat
- **CAC/LTV Sensitivity**: Ensure organic/viral loops and product‑led growth


## 12) Roadmap (Operating View)
- **MVP (Now)**
  - Ship web app with beats, on‑beat prompts, recording, save/share, ads
  - Validate the on‑beat prompt system and practice loop
- **V2 (Fast Follow – Pro Tier)**
  - Subscriptions; remove ads; TTS voice prompts; unlimited recording; user beat uploads; expanded library
  - Begin native app work post‑revenue
- **V3 (Vision)**
  - VTT transcription, LLM contextual prompts, AI scoring, leaderboards


## 13) New Agent Onboarding
Follow this checklist to get productive quickly:
1) Read this README top‑to‑bottom
2) Review the DOCS index (below) for detailed analysis and assumptions
3) Environment
   - Node 18+; pnpm/npm/yarn
   - Vercel account; Google Cloud project (for GCS/Cloud SQL in later phases)
4) Local Dev (MVP)
   - Scaffold Next.js (App Router, TS, Tailwind)
   - Add NextAuth.js (Google provider)
   - Create `Beat`, `Word`, `User`, `FreestyleSession` models
   - Implement endpoints listed above; stub data acceptable initially
   - Basic UI: Play screen (beat selector, frequency/difficulty, play/stop, visual timer ring, word display), Review screen (playback/save)
5) Quality Bar
   - Type‑safe, readable code; consistent naming
   - Early accessibility checks; responsive mobile layout first
6) Data & Privacy
   - Store minimal PII; secure cookies; encrypted at rest/in transit; add Privacy/Cookie policy and data deletion request path


## 14) Working Assumptions
- MVP beat library is free/self‑produced; later expand via partnerships/licensing
- Serverless first; cost‑efficient infra until Pro tier usage grows
- Pricing: $4.99/mo baseline with potential higher tier for heavy AI usage
- Web‑first launch; native apps once revenue validates demand


## 15) Financial Snapshot (Conservative Outlook)
- Benchmarks indicate modest conversion in this market; plan for sub‑industry rates initially and grow with V2/V3 value
- 3‑year model in analysis suggests reaching ~$0.43M annual revenue by Year 3 under conservative assumptions; success depends on retention and conversion uplift from AI features


## 16) DOCS Index (Source Materials)
These internal analyses informed this README. See `DOCS/` for originals.
- Flowforge - AI Development Toolset: comparative evaluation of agentic IDEs; recommends Trae + Gemini 2.5 Pro; includes scoring matrix and implementation steps
- FlowForge Business Analysis and Projections: market/financial deep‑dive; competitive analysis; conservative revenue model and risk recommendations
- FlowForge Business Plan & Technical Blueprint: original business and technical plan; MVP/V2/V3 scope; GTM; KPIs; high‑level API and data model
- FlowForge (one‑pager/pitch content): succinct value prop, roadmap, stack visuals


## 17) Quick Start (Action Items for Today)
- Implement MVP skeleton in Next.js with auth, beats list, word prompt loop UI
- Add minimal `/api/beats`, `/api/words/random`, `/api/sessions/upload`, `/api/sessions`
- Wire basic recording and review flow; save session metadata
- Seed with 15 template beats (bpm metadata); simple word list with difficulty tags
- Ship to Vercel preview; collect initial feedback on the prompt timing and UX

## 20) Current Build & Verification (Updated)
- **Database**: Supabase connected; migrations applied; seed loaded (15 beats, 45 words)
- **Build**: `npm run build` completes successfully (only Prettier-style warnings)
- **APIs**: `/api/beats`, `/api/words/random`, `/api/sessions`, `/api/sessions/upload` online

### How to run locally
```bash
npm install
cp .env.local.example .env.local  # add your DATABASE_URL/DIRECT_URL
npx prisma generate
npx prisma migrate dev
npx prisma db seed                 # optional; uses DIRECT_URL
npm run dev
```

### Useful scripts
- `npm run build` – compile for production
- `npm run lint` – lint with ESLint/Prettier rules
- `npm test` – run Vitest

### New session checklist
- Pull latest `main`
- Verify env in `.env.local` (DATABASE_URL pooled 6543, DIRECT_URL direct 5432)
- `npm install && npx prisma generate`
- `npm run dev` and visit `http://localhost:3000`


## 18) Glossary
- **On‑beat prompts**: Words displayed precisely at musical bar boundaries (e.g., every 8 bars)
- **TTS**: Text‑to‑Speech (V2 prompts)
- **VTT**: Voice‑to‑Text (transcription, V3)
- **LLM**: Large Language Model (contextual suggestions, V2/V3)
- **COGS**: Cost of Goods Sold; here, variable AI API costs for Pro usage


## 19) Contact & Ownership
- Product direction: Practice tool differentiation; habit formation; AI scoring moat
- Engineering: MVP velocity first; defensive V2/V3 features next; cost guardrails for AI
- Business: Conservative financials; experiment with tiering/usage limits for AI


— End of README —


