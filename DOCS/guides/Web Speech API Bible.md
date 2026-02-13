Below is a production-minded playbook for **Web Speech API `speechSynthesis`** in a **Next.js** app with **EN/FR/PT** word prompts, focused on *voice availability detection, resilient voice selection, UX fallbacks, DB architecture, anti-rhyme logic, and a rollout \+ test plan*.

---

## **0\) Reality check: the spec allows “unknown voices” \+ async loading**

The Web Speech API spec explicitly allows `getVoices()` to return **an empty list** when voices aren’t known yet, and expects the list to change asynchronously (hence `voiceschanged`). ([W3C GitHub](https://w3c.github.io/speech-api/speechapi-errata.html?utm_source=chatgpt.com))  
MDN documents `getVoices()` and the `voiceschanged` event and positions `voiceschanged` as the intended signal to repopulate voice lists. ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices?utm_source=chatgpt.com))

**Implication:** treat voice availability as **eventually consistent** and design for retries/timeouts.

---

## **1\) Detecting voice availability per language across platforms**

### **What you can reliably detect**

* **Whether the API exists**: `('speechSynthesis' in window)` and `('SpeechSynthesisUtterance' in window)` (baseline check). ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis?utm_source=chatgpt.com))  
* **Whether the browser exposes a voice list** (sometimes delayed): `speechSynthesis.getVoices()` may be empty until the engine fetches/initializes voices. This is known behavior in Chromium implementations. ([Chromium Issues](https://issues.chromium.org/41370465?utm_source=chatgpt.com))  
* **Whether there is at least one voice matching a BCP-47 tag** (best effort): `voices.some(v => v.lang === 'fr-FR' || v.lang.startsWith('fr'))`

### **What you *cannot* reliably detect**

* Whether a given platform will **honor** `utterance.voice` or only use a system default (notably on some Safari setups, voice enumeration/selection can be limited or inconsistent in practice). A high-signal field report: Safari may return no voices and pick a system default. ([WebOutLoud](https://weboutloud.io/bulletin/speech_synthesis_in_safari/?utm_source=chatgpt.com))

### **Practical detection algorithm (production pattern)**

1. Call `getVoices()` once immediately (this can “kick” initialization in some Chromium paths). ([Chromium Issues](https://issues.chromium.org/41370465?utm_source=chatgpt.com))  
2. Subscribe to `voiceschanged` and re-read voices. ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event?utm_source=chatgpt.com))  
3. Add a **timeout \+ poll fallback** (some environments are flaky about firing `voiceschanged`).

You do **not** need permissions to list voices; but **speaking** can be gated by autoplay / user-activation rules (see §4). ([Google Groups](https://groups.google.com/a/chromium.org/g/blink-dev/c/WsnBm53M4Pc?utm_source=chatgpt.com))

---

## **2\) Best UX when a language voice is unavailable**

### **UX goals**

* Never “silently do nothing”.  
* Always tell the user what will happen **before** they hit “Speak”.  
* Provide a clear opt-out (mute/disable TTS) and a clear remediation path (install voices) **only when it’s actionable**.

### **Recommended UX states**

**A) Full support (matching voice found)**

* Show language selector \+ “Speak” button.  
* Optional: show chosen voice name in an “Advanced” disclosure.

**B) Partial support (TTS works, but no matching voice for selected language)**

* Default behavior: **still speak** using the system/default voice (unless your app promise requires correct language pronunciation).  
* Inline message (non-blocking):  
  *“No {French (France)} voice found on this device. We’ll use the system voice; pronunciation may be off.”*  
* Provide actions:  
  * “Install voices” → opens a help modal with OS-specific steps.  
  * “Turn off speech” (persist preference).

**C) Likely blocked by user-gesture/autoplay**

* Before first use, show a one-time banner:  
  *“Tap ‘Enable audio’ once so your browser allows speech.”*  
* Provide a dedicated **Enable audio** button (this becomes your “gesture priming” step).

### **When to show “install voice pack” guidance**

Show it only if **all** are true:

* The user attempted to use TTS for that language **at least once**, and  
* You detect **no voice** whose `lang` matches the selected language (exact or prefix), and  
* The platform is one where voice installation is a real end-user action:  
  * **Android**: Install voice data / change TTS engine in system settings. ([Google Help](https://support.google.com/accessibility/android/answer/6006983?hl=en&utm_source=chatgpt.com))  
  * **iOS/macOS**: Download enhanced voices under Accessibility/Spoken Content/VoiceOver speech settings. ([Apple Support](https://support.apple.com/guide/iphone/hear-whats-on-the-screen-or-typed-iph96b214f0/ios?utm_source=chatgpt.com))

Avoid spamming this guidance on first page load—users often haven’t interacted yet, voices may not be loaded, and you’ll misdiagnose.

---

## **3\) Reliable technical patterns: choose voices by lang & quality, handle async loading, avoid silent failures**

### **3.1 Voice loading utility (robust)**

Use a client-only singleton with:

* first `getVoices()` call  
* `voiceschanged` listener  
* polling fallback  
* timeout that resolves with “best we’ve got” (possibly empty)

// app/lib/tts.ts (client-only module)  
export type VoiceInfo \= SpeechSynthesisVoice;

const LANG\_ALIASES: Record\<string, string\[\]\> \= {  
  "en-US": \["en-US", "en\_US", "en"\],  
  "fr-FR": \["fr-FR", "fr\_FR", "fr"\],  
  "pt-PT": \["pt-PT", "pt\_PT", "pt"\],  
  "pt-BR": \["pt-BR", "pt\_BR", "pt"\],  
};

function normLang(s: string) {  
  return s?.toLowerCase() ?? "";  
}

export async function loadVoices(opts?: { timeoutMs?: number }): Promise\<VoiceInfo\[\]\> {  
  const timeoutMs \= opts?.timeoutMs ?? 1500;

  if (typeof window \=== "undefined" || \!("speechSynthesis" in window)) return \[\];  
  const synth \= window.speechSynthesis;

  // Kick initialization  
  let voices \= synth.getVoices();  
  if (voices.length) return voices;

  await new Promise\<void\>((resolve) \=\> {  
    let done \= false;  
    const finish \= () \=\> {  
      if (done) return;  
      done \= true;  
      synth.removeEventListener("voiceschanged", onChanged);  
      resolve();  
    };

    const onChanged \= () \=\> finish();  
    synth.addEventListener("voiceschanged", onChanged);

    // Poll fallback (some envs are flaky)  
    const poll \= setInterval(() \=\> {  
      voices \= synth.getVoices();  
      if (voices.length) {  
        clearInterval(poll);  
        finish();  
      }  
    }, 100);

    setTimeout(() \=\> {  
      clearInterval(poll);  
      finish();  
    }, timeoutMs);  
  });

  return synth.getVoices();  
}

Why this pattern: spec permits empty until known ([W3C GitHub](https://w3c.github.io/speech-api/speechapi-errata.html?utm_source=chatgpt.com)), and Chromium has explicit “first call returns empty then async fetch” behavior reports. ([Chromium Issues](https://issues.chromium.org/41370465?utm_source=chatgpt.com))

### **3.2 Voice selection heuristic (quality \+ locale)**

Pick the “best” voice using scoring:

1. Exact locale match (`fr-FR`)  
2. Base language match (`fr-*`)  
3. Prefer `localService === true` (often faster/more reliable offline; not guaranteed)  
4. Prefer known higher-quality families by name (best-effort; maintain a small allowlist)  
5. Prefer `default === true` only *after* language match (otherwise it’s usually wrong language)

export function pickVoice(voices: VoiceInfo\[\], target: string): VoiceInfo | null {  
  const aliases \= LANG\_ALIASES\[target\] ?? \[target, target.split("-")\[0\]\];  
  const targetSet \= new Set(aliases.map(normLang));

  const score \= (v: VoiceInfo) \=\> {  
    const l \= normLang(v.lang);  
    const base \= l.split("-")\[0\];  
    const isExact \= targetSet.has(l);  
    const isBase \= targetSet.has(base);  
    let s \= 0;  
    if (isExact) s \+= 100;  
    else if (isBase) s \+= 60;  
    if (v.localService) s \+= 10;  
    if (v.default) s \+= 3;

    // Very small heuristic allowlist (tune with telemetry):  
    const name \= (v.name ?? "").toLowerCase();  
    if (name.includes("google")) s \+= 2;  
    if (name.includes("microsoft")) s \+= 2;  
    if (name.includes("siri")) s \+= 1;

    return s;  
  };

  const ranked \= \[...voices\].sort((a, b) \=\> score(b) \- score(a));  
  const best \= ranked\[0\];  
  // Reject if it doesn't match language at all  
  const bestLang \= normLang(best?.lang);  
  const bestBase \= bestLang.split("-")\[0\];  
  if (\!targetSet.has(bestLang) && \!targetSet.has(bestBase)) return null;  
  return best ?? null;  
}

### **3.3 Speaking without silent failures**

Attach events and enforce a watchdog timer:

* `onstart`, `onend`, `onerror`  
* Call `speechSynthesis.cancel()` before speaking new utterances (prevents stuck queue)  
* Provide a maximum duration (e.g., 6–10 seconds for a single word) and “unstick” if nothing happens.

export async function speakWord(text: string, lang: string) {  
  const synth \= window.speechSynthesis;  
  const voices \= await loadVoices({ timeoutMs: 1500 });  
  const voice \= pickVoice(voices, lang);

  return await new Promise\<void\>((resolve, reject) \=\> {  
    const u \= new SpeechSynthesisUtterance(text);  
    u.lang \= lang;

    // Some Safari setups may ignore u.voice; still safe to set.  
    if (voice) u.voice \= voice;

    let settled \= false;  
    const finish \= (err?: unknown) \=\> {  
      if (settled) return;  
      settled \= true;  
      try { synth.cancel(); } catch {}  
      err ? reject(err) : resolve();  
    };

    const watchdog \= setTimeout(() \=\> {  
      finish(new Error("TTS watchdog timeout (possible autoplay/user-gesture block or engine stall)"));  
    }, 8000);

    u.onstart \= () \=\> {};  
    u.onend \= () \=\> { clearTimeout(watchdog); finish(); };  
    u.onerror \= (e) \=\> { clearTimeout(watchdog); finish(e); };

    try {  
      synth.cancel();  
      synth.speak(u);  
    } catch (e) {  
      clearTimeout(watchdog);  
      finish(e);  
    }  
  });  
}

Also note: the spec defines error events and error codes (including language/voice unavailable). ([W3C GitHub](https://w3c.github.io/speech-api/speechapi-errata.html?utm_source=chatgpt.com))

---

## **4\) Known platform limitations \+ user-gesture constraints**

### **User activation / autoplay constraints**

* Chromium has explicitly discussed aligning `speechSynthesis.speak()` with autoplay rules: it may error when the document/frame hasn’t had user activation. ([Google Groups](https://groups.google.com/a/chromium.org/g/blink-dev/c/WsnBm53M4Pc?utm_source=chatgpt.com))  
* In practice, treat speech like audio playback: require a click/tap before first speech and be prepared for “not allowed” style failures.  
* General autoplay guidance varies by browser and is documented broadly (media/WebAudio policies). ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay?utm_source=chatgpt.com))

**Production mitigation:** a one-time “Enable audio” button that calls a short “priming” utterance or triggers your first real utterance directly from the click handler.

### **Safari-specific practical constraints (high-signal caveats)**

* Safari’s speech synthesis behavior can be inconsistent regarding voice enumeration and selection (reports of `getVoices()` returning nothing and system default voice usage). ([WebOutLoud](https://weboutloud.io/bulletin/speech_synthesis_in_safari/?utm_source=chatgpt.com))  
* iOS/macOS voice availability is often tied to OS voices; users may need to download enhanced voices in Accessibility settings. ([Apple Support](https://support.apple.com/guide/iphone/hear-whats-on-the-screen-or-typed-iph96b214f0/ios?utm_source=chatgpt.com))

**Design implication:** on Safari, expect fewer controllable knobs; prioritize “works at all” \+ clear fallback messaging.

---

## **5\) Multilingual word dictionaries: DB schema patterns**

Assuming **PostgreSQL**, this is a solid baseline that supports:

* EN/FR/PT  
* difficulty buckets (easy/medium/hard)  
* random sampling per language+difficulty  
* unique constraints  
* phonetic fields for anti-rhyme (optional at MVP)

### **Core table**

CREATE TYPE difficulty\_level AS ENUM ('easy','medium','hard');

CREATE TABLE words (  
  id              BIGSERIAL PRIMARY KEY,  
  language        TEXT NOT NULL,             \-- 'en-US', 'fr-FR', 'pt-PT', 'pt-BR'  
  text            TEXT NOT NULL,             \-- display form  
  norm            TEXT NOT NULL,             \-- normalized for uniqueness/search  
  difficulty      difficulty\_level NOT NULL,  
  frequency\_rank  INTEGER,                   \-- optional (for curated difficulty)  
  \-- anti-rhyme fields (optional for MVP)  
  phonemes        TEXT,                      \-- IPA/ARPABET serialized  
  rhyme\_key       TEXT,                      \-- last stressed vowel \+ coda (or heuristic)  
  created\_at      TIMESTAMPTZ NOT NULL DEFAULT now()  
);

\-- Unique per language  
CREATE UNIQUE INDEX words\_language\_norm\_uq ON words(language, norm);

\-- Fast filters  
CREATE INDEX words\_language\_difficulty\_idx ON words(language, difficulty);

\-- Optional random sampling optimization (see note below)  
CREATE INDEX words\_language\_difficulty\_id\_idx ON words(language, difficulty, id);

### **Notes on “random”**

`ORDER BY random()` doesn’t scale. For production:

* Use **id-range sampling**: pick a random id in the filtered set range, then `WHERE id >= r` with the same filters and `LIMIT 1`.  
* Or maintain per (language,difficulty) **bucket tables** / materialized views with dense integer keys.

### **Optional: variants \+ metadata**

If you want multiple spellings/aliases, add:

* `word_variants(word_id, variant_text, variant_norm, kind)` with a unique `(word_id, variant_norm)`.

---

## **6\) Anti-rhyme logic (EN/FR/PT): approaches \+ tradeoffs**

### **Best quality: phonetic “rhyme key” per word (precomputed)**

For each word, compute a **rhyme key** and block repeats within a sliding window (e.g., last 10 prompts in the same language).

**English (EN)**

* Use **CMU Pronouncing Dictionary (CMUdict)** (ARPABET \+ stress). ([CMU Speech](https://www.speech.cs.cmu.edu/cgi-bin/cmudict?utm_source=chatgpt.com))  
* Rhyme key: from **last stressed vowel** to end (common rhyming heuristic).

**French (FR)**

* Use **Lexique (Lexique3 / Lexique382/383)** which includes phonemic representations and other lexical info. ([Lexique](https://www.lexique.org/?lang=en&page_id=790&utm_source=chatgpt.com))  
* Rhyme key: last syllable nucleus+coda (French rhyme is often more about the final vowel/consonant cluster; stress is different than English).

**Portuguese (PT)**

* For **European Portuguese**, **pt-lex** provides a pronunciation lexicon. ([GitHub](https://github.com/msamribeiro/pt-lex?utm_source=chatgpt.com))  
* For broader coverage, consider IPA dictionaries (multi-language) or a grapheme-to-phoneme toolchain. ([GitHub](https://github.com/open-dict-data/ipa-dict?utm_source=chatgpt.com))

### **Lightweight & multilingual: phonemizer backend (server-side)**

Use a phonemization library backed by **espeak-ng** to generate IPA for many languages:

* `phonemizer` \+ espeak-ng backend supports many languages and IPA output. ([GitHub](https://github.com/bootphon/phonemizer?utm_source=chatgpt.com))

**Tradeoffs**

* Pros: one pipeline for EN/FR/PT, handles OOV words.  
* Cons: quality varies by language and word, and IPA output conventions can be inconsistent across backends.

### **MVP fallback: orthographic anti-rhyme heuristic**

If phonetics are too heavy initially:

* Normalize (lowercase, remove diacritics)  
* Extract last 3–5 letters, with language-specific tweaks:  
  * EN: treat “-tion/-sion/-cion” similarly  
  * FR: treat silent endings (e.g., `e`, `ent`) cautiously  
  * PT: consider nasal endings `-ão`, `-ões`, `-em` (after diacritic stripping they collapse, so keep an exception map)

This won’t catch true rhymes reliably, but it prevents **obvious** repeats cheaply.

### **Multilingual context: do you need cross-language anti-rhyme?**

Usually no—users perceive rhyme within the current language prompt stream. Do anti-rhyme per language session unless your UX mixes languages in a single rapid drill.

---

## **7\) Compatibility matrix (practical, not theoretical)**

| Platform | API present | `getVoices()` list reliability | Voice selection (`utterance.voice`) | User-gesture sensitivity | Production guidance |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Chrome Desktop | Yes ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API?utm_source=chatgpt.com)) | Often delayed/async; first call can be empty ([Chromium Issues](https://issues.chromium.org/41370465?utm_source=chatgpt.com)) | Generally works when voice exists | Increasingly aligned w/ autoplay activation ([Google Groups](https://groups.google.com/a/chromium.org/g/blink-dev/c/WsnBm53M4Pc?utm_source=chatgpt.com)) | Use loadVoices() \+ scoring \+ watchdog \+ “Enable audio” |
| Chrome Android | Yes ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API?utm_source=chatgpt.com)) | Similar async behavior; voice inventory depends on OS TTS packs | Generally works; depends on installed TTS voices | Gesture recommended | Offer “Install voice data” steps when missing ([Google Help](https://support.google.com/accessibility/android/answer/6006983?hl=en&utm_source=chatgpt.com)) |
| Safari macOS | Yes (feature supported broadly) ([Can I Use](https://caniuse.com/?utm_source=chatgpt.com)) | Can be limited/inconsistent in practice ([WebOutLoud](https://weboutloud.io/bulletin/speech_synthesis_in_safari/?utm_source=chatgpt.com)) | May not reliably honor voice selection | Autoplay policies can block audio-like actions ([WebKit](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/?utm_source=chatgpt.com)) | Expect defaults; focus on graceful fallback \+ user gesture priming |
| Safari iOS | Yes on modern iOS Safari ([Can I Use](https://caniuse.com/?utm_source=chatgpt.com)) | Often the flakiest for enumeration/selection ([WebOutLoud](https://weboutloud.io/bulletin/speech_synthesis_in_safari/?utm_source=chatgpt.com)) | May ignore `voice` and use system default | Strong gesture requirement patterns | Provide explicit “Tap to enable audio” \+ OS voice download guidance ([Apple Support](https://support.apple.com/guide/iphone/hear-whats-on-the-screen-or-typed-iph96b214f0/ios?utm_source=chatgpt.com)) |

*(Can I use is useful for broad support baselines; the runtime behavior differences above are what usually break apps.)* ([Can I Use](https://caniuse.com/?utm_source=chatgpt.com))

---

## **8\) MVP vs full production rollout plan**

### **MVP (ship fast, low risk)**

**Scope**

* EN/FR/PT word prompts \+ speak button  
* Best-effort voice matching by `lang` (exact/prefix)  
* Clear UX states (supported / fallback / blocked)  
* Basic telemetry (counts only): voices length, chosen `voice.lang`, errors

**Anti-rhyme**

* Orthographic heuristic only (last 3–5 letters) per language

**Risk level:** Low–Medium  
Main risk is Safari oddities \+ user-gesture blocking → mitigated by “Enable audio” and watchdog.

### **Production (hardened, higher fidelity)**

**Scope**

* Persist user’s preferred voice (when supported) \+ “Test voice” button  
* Voice quality scoring tuned via telemetry  
* Per-platform help flows (Android install voice data, iOS/macOS download voices)  
* Robust failure recovery: auto-cancel stuck speech, retry after gesture

**Anti-rhyme**

* Precompute phonetics \+ rhyme keys:  
  * EN: CMUdict ([CMU Speech](https://www.speech.cs.cmu.edu/cgi-bin/cmudict?utm_source=chatgpt.com))  
  * FR: Lexique ([Lexique](https://www.lexique.org/?lang=en&page_id=790&utm_source=chatgpt.com))  
  * PT: pt-lex \+ fallback phonemizer/espeak ([GitHub](https://github.com/msamribeiro/pt-lex?utm_source=chatgpt.com))

**Risk level:** Medium  
Biggest risks: phonetic pipeline complexity \+ licensing/coverage gaps \+ Safari’s limited controllability.

---

## **9\) Concrete implementation recommendations \+ risk levels**

### **Recommendation A (Browser TTS only, best-effort voices)**

* Use the `loadVoices()` \+ `pickVoice()` pattern  
* Safari: expect default voice, don’t over-promise selection  
* UX: fallback messaging \+ optional OS guidance

**Risk:** Medium (Safari behavior variability)  
**Best for:** consumer web app MVP, low infra.

### **Recommendation B (Hybrid: browser TTS when good, server TTS fallback when not)**

* Detect “no matching voice \+ user cares about pronunciation”  
* Provide a server-generated audio fallback (cached mp3/ogg) for that word/language

**Risk:** Medium–High (cost, latency, privacy, caching complexity)  
**Best for:** language-learning where pronunciation correctness is critical.

*(If you go this route, treat browser TTS as “fast path” and server TTS as “correctness path”.)*

---

## **10\) Test plan (what actually catches bugs)**

### **Manual device matrix (minimum)**

* iOS Safari (2 versions if possible), macOS Safari, Android Chrome, Desktop Chrome  
* Test each language: `en-US`, `fr-FR`, `pt-PT`, `pt-BR`

### **Test cases**

1. **First load**: voices list empty → later available (ensure UI updates on `voiceschanged` \+ polling). ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event?utm_source=chatgpt.com))  
2. **First speak without gesture**: confirm you show “Enable audio” and recover after click. ([Google Groups](https://groups.google.com/a/chromium.org/g/blink-dev/c/WsnBm53M4Pc?utm_source=chatgpt.com))  
3. **Missing voice**: pick fallback, show install guidance only after attempt. ([Google Help](https://support.google.com/accessibility/android/answer/6006983?hl=en&utm_source=chatgpt.com))  
4. **Rapid interactions**: spam speak/cancel, route changes (Next.js), verify no stuck queue.  
5. **Backgrounding** (especially iOS): speak then background/foreground; ensure you can recover (cancel \+ re-prime if needed).  
6. **Error handling**: force errors (empty text, extremely long text) and confirm you surface readable messages (not silent). ([W3C GitHub](https://w3c.github.io/speech-api/speechapi-errata.html?utm_source=chatgpt.com))

### **Automation**

* Use Playwright/Cypress for UI state transitions and telemetry events, but **don’t** try to assert audio output correctness (not reliable in CI/headless; `getVoices()` can be empty in headless contexts). ([Chromium Issues](https://issues.chromium.org/issues/40885239?utm_source=chatgpt.com))

---

If you want, paste your current voice selection/speak code (or describe your UI flow) and I’ll rewrite it into a **single client-side TTS module \+ React hook** pattern tailored to your exact language toggles and Next.js app router structure.

