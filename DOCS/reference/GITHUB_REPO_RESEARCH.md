# GitHub Repository Research

Purpose:

- capture GitHub research relevant to FlowForge's current beta-polish priorities

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- researched third-party GitHub repositories worth evaluating for adoption or pattern reuse

Last updated:

- 2026-05-16

Related docs:

- `DOCS/project/PROJECT_STATUS.md`
- `DOCS/project/ROADMAP.md`
- `DOCS/summaries/QUICK_START_NEXT_SESSION.md`

**Current Version**: `1.1.2`
**Session Context**: Beta Polish

## Why This Research Exists

The current product focus is:

1. Multilingual prompt quality and TTS fallback reliability.
2. Recording/upload reliability and recovery UX.
3. PWA/TWA polish and release discipline.

This research documents the most relevant GitHub repositories that could accelerate those goals without fighting the current stack (`Next.js`, `TypeScript`, `Supabase`, `Prisma`, `NextAuth`, `@ducanh2912/next-pwa`).

## Search Method

Searches were grouped around the repo's real needs instead of generic "best Next.js repos" queries:

- `nextjs app router pwa twa audio recording waveform typescript`
- `speech synthesis web speech api ios safari voiceschanged fallback`
- `easy-speech web speech api cross browser`
- `wavesurfer react waveform regions record plugin`
- `resumable upload tus browser nextjs`
- `uppy golden retriever crash recovery`
- `cmu pronouncing dictionary javascript rhyme syllables`
- `multilingual word frequency french portuguese english`
- `workbox audio range requests cache media`
- `trusted web activity bubblewrap android browser helper`

## Prioritized Top 5

These are the five repositories that should drive the next implementation spikes.

### 1. `leaonline/easy-speech`

- URL: <https://github.com/leaonline/easy-speech>
- Priority reason: strongest immediate fit for FlowForge's current TTS fallback work.
- Best use in this repo:
  - harden `SpeechSynthesis` initialization inside `hooks/useTTS.ts`
  - reduce custom voice-loading and browser-quirk handling
  - preserve current telemetry and iOS text-only behavior on top
- Recommendation:
  - run a small spike first
  - compare EasySpeech voice readiness events against the current `voiceschanged` + timeout logic

### 2. `katspaugh/wavesurfer.js`

- URL: <https://github.com/katspaugh/wavesurfer.js>
- Companion React wrapper: <https://github.com/katspaugh/wavesurfer-react>
- Priority reason: highest-value waveform/review/calibration upgrade path.
- Best use in this repo:
  - improve review waveform UX
  - support richer calibration markers/regions
  - expose clearer scrub/seek affordances on recordings and beat setup screens
- Recommendation:
  - use surgically on review/calibration surfaces instead of replacing the whole audio engine

### 3. `GoogleChromeLabs/bubblewrap`

- URL: <https://github.com/GoogleChromeLabs/bubblewrap>
- Priority reason: best fit for Android/TWA deployment hardening.
- Best use in this repo:
  - strengthen the release workflow behind `DOCS/guides/ANDROID_DEPLOYMENT.md`
  - validate TWA package generation against the live manifest and asset links
  - reduce manual Android packaging drift
- Recommendation:
  - treat this as deployment tooling, not product runtime code

### 4. `transloadit/uppy`

- URL: <https://github.com/transloadit/uppy>
- Priority reason: fastest path to resilient upload UX if recording or beat uploads remain fragile on mobile networks.
- Best use in this repo:
  - resumable/retry-friendly upload flows
  - visible progress and better failure messaging
  - optional crash recovery patterns
- Recommendation:
  - evaluate first for beat uploads and only expand to recordings if the UI/runtime overhead stays acceptable

### 5. `words/cmu-pronouncing-dictionary`

- URL: <https://github.com/words/cmu-pronouncing-dictionary>
- Supporting helper: <https://github.com/aparrish/pronouncingjs>
- Priority reason: strongest low-risk path to improve English anti-rhyme and pronunciation-aware prompt quality.
- Best use in this repo:
  - improve English phonetic rhyme checks
  - improve syllable confidence for prompt/difficulty handling
  - reduce edge-case repeat/rhyme collisions in session queue building
- Recommendation:
  - keep this scoped to English unless a parallel FR/PT phonetic source is chosen

## Secondary Candidates

These are valuable, but not the first five to pursue.

### `tus/tus-js-client`

- URL: <https://github.com/tus/tus-js-client>
- Why it matters:
  - excellent resumable upload protocol support
- Why it is secondary:
  - Supabase signed-upload flows are not a drop-in tus match, so backend/storage strategy may need to change first

### `hermitdave/FrequencyWords`

- URL: <https://github.com/hermitdave/FrequencyWords>
- Why it matters:
  - useful for expanding curated FR/PT seed dictionaries
- Why it is secondary:
  - vocabulary needs product curation for freestyle usefulness and licensing review before bundling

### `daffinm/audio-cache-test`

- URL: <https://github.com/daffinm/audio-cache-test>
- Why it matters:
  - useful reference for Workbox media caching with seek/range-request support
- Why it is secondary:
  - pattern/reference repo, not a maintained runtime dependency

### `PostHog/posthog`

- URL: <https://github.com/PostHog/posthog>
- Why it matters:
  - stronger funnel, replay, and reliability instrumentation if current analytics become too shallow
- Why it is secondary:
  - product/tooling decision, not a narrow code-level fix

## Repo-to-FlowForge Mapping

| FlowForge need                 | Best candidate                     | Likely touchpoints                                |
| ------------------------------ | ---------------------------------- | ------------------------------------------------- |
| TTS fallback reliability       | `leaonline/easy-speech`            | `hooks/useTTS.ts`, `lib/tts/*`, setup diagnostics |
| Review/calibration waveform UX | `katspaugh/wavesurfer.js`          | review player, calibration UI, recording playback |
| Android/TWA release stability  | `GoogleChromeLabs/bubblewrap`      | deployment workflow, Android packaging docs       |
| Upload retry/recovery UX       | `transloadit/uppy`                 | recording upload flow, beat uploads, retry UI     |
| English anti-rhyme quality     | `words/cmu-pronouncing-dictionary` | `lib/words/*`, queue/rhyme helpers                |

## Adoption Guidance

1. Favor proof-of-concept spikes over broad dependency adoption.
2. Preserve the current mobile-first, TWA-safe UX constraints.
3. Do not swap core audio behavior and waveform rendering in the same change set.
4. For vocabulary or phonetic datasets, verify license fit before bundling data into the repo.
5. For upload tooling, confirm Supabase compatibility before committing to a protocol or SDK.

## Recommended Next Sequence

1. Spike `easy-speech` against the current `useTTS` implementation and compare readiness/fallback behavior.
2. Prototype `wavesurfer.js` on review/calibration only.
3. Add a Bubblewrap validation pass to Android/TWA release work.
4. Evaluate `uppy` for beat uploads and `tus-js-client` only if storage strategy evolves.
5. Improve English phonetic matching with CMU data, then separately research FR/PT phonetic sources.
