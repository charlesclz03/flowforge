# 🚀 START HERE - FlowForge Quick Start

**Welcome!** This is your entry point to the FlowForge project.

---

## 📊 Project Status: ✅ MVP COMPLETE (v1.0.0)

**Last Updated**: December 10, 2025  
**Version**: v1.0.0-mvp  
**Completion**: 100% (Core Loop & Core Infrastructure)

> **NOTE**: The MVP (Practice, Recording, Review, Auth) is fully built and deployed. We are currently working on **Phase 5: Premium Features**.

---

## 🎯 What is FlowForge?

**FlowForge** is an AI-powered freestyle rap practice web app that helps aspiring artists:

- Practice with high-quality beats
- Get timed word prompts to spark creativity
- Record and review practice sessions
- Improve their freestyle skills

**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma, Supabase PostgreSQL

---

## ⚡ Quick Start (Development)

### 1. Start the Development Server

```bash
cd "/Users/c0369/Documents/AI BUSINESS/FlowForge - Freestyle"
npm install
npm run dev
```

### 2. Open Your Browser

Visit: http://localhost:3000

### 3. Key Workflows to Test

1.  **Sign In**: Use Google Auth (or mock if local).
2.  **Practice**: Go to `/practice`, select a beat, and record a session.
3.  **Review**: Save the session and play it back on the `/review` page.

---

## 📚 Essential Documentation

### 1. Status & Roadmap
*   **[PROJECT_STATUS.md](DOCS/project/PROJECT_STATUS.md)**: The single source of truth for completion status.
*   **[MVP_ROADMAP.md](DOCS/project/MVP_ROADMAP.md)**: High-level visual timeline.

### 2. Implementation Plans (Active)
*   **[PHASE_5_PREMIUM_PLAN.md](DOCS/phases/PHASE_5_PREMIUM_PLAN.md)**: 👈 **WE ARE HERE**. Plan for Stripe & Guest Mode.
*   **[PHASE_6_SOCIAL_PLAN.md](DOCS/phases/PHASE_6_SOCIAL_PLAN.md)**: Future social features.

### 3. Technical Reference
*   **[FlowForge V1.0: The Bible](DOCS/FlowForge%20V1.0_%20The%20Bible.md)**: The core product vision and logic.
*   **[APP_OVERVIEW_AND_FEATURES.md](DOCS/APP_OVERVIEW_AND_FEATURES.md)**: Detailed feature guide.
*   **[STRIPE_SETUP.md](DOCS/setup/STRIPE_SETUP.md)**: Setup guide for the incoming payments system.

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run lint            # Lint code

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Run migrations
npx tsx prisma/seed.ts  # Seed data
```

---

## 📂 Project Structure

```
FlowForge - Freestyle/
├── app/
│   ├── api/                    # API routes
│   ├── practice/               # Main Practice App (MVP Complete)
│   ├── review/[sessionId]/     # Review Page (MVP Complete)
│   ├── recordings/             # Recording Library (MVP Complete)
│   └── page.tsx                # Landing page
├── components/
│   ├── practice/               # Timer, WordPrompt, BeatSelector
│   └── session/                # Recording logic
├── lib/
│   ├── audio/                  # WebAudio API & Recorder logic
│   └── stripe.ts               # (Coming Soon) Payments
├── DOCS/                       # Documentation Central
└── README.md                   # Project overview
```

---

## 🎯 What to Do Next

**We are starting Phase 5.** Your primary focus should be:

1.  Read **[PHASE_5_PREMIUM_PLAN.md](DOCS/phases/PHASE_5_PREMIUM_PLAN.md)**.
2.  Read **[STRIPE_SETUP.md](DOCS/setup/STRIPE_SETUP.md)**.
3.  Begin implementing the **Stripe Integration** and **Guest Mode** logic.

**Good luck!** 🔨🎤
