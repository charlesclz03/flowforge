const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.addInitScript(() => {
    const OriginalAudio = window.Audio;
    // @ts-ignore
    window.__audioInstances = [];
    // @ts-ignore
    window.__playCalls = [];
    const origPlay = HTMLMediaElement.prototype.play;
    const origPause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function (...args) {
      const startedAt = Date.now();
      const stack = new Error().stack;
      const p = origPlay.apply(this, args);
      // @ts-ignore
      const pushCall = (entry) => window.__playCalls.push(entry);
      if (p && typeof p.then === "function") {
        return p
          .then((v) => {
            pushCall({
              type: "play",
              result: "resolved",
              startedAt,
              endedAt: Date.now(),
              paused: this.paused,
              currentTime: this.currentTime,
              readyState: this.readyState,
              stack,
            });
            return v;
          })
          .catch((err) => {
            pushCall({
              type: "play",
              result: "rejected",
              startedAt,
              endedAt: Date.now(),
              paused: this.paused,
              currentTime: this.currentTime,
              readyState: this.readyState,
              message: err && err.message ? err.message : String(err),
              name: err && err.name ? err.name : "Error",
              stack,
            });
            throw err;
          });
      }
      pushCall({
        type: "play",
        result: "sync-return",
        startedAt,
        endedAt: Date.now(),
        paused: this.paused,
        currentTime: this.currentTime,
        readyState: this.readyState,
        stack,
      });
      return p;
    };
    HTMLMediaElement.prototype.pause = function (...args) {
      const stack = new Error().stack;
      // @ts-ignore
      window.__playCalls.push({
        type: "pause",
        at: Date.now(),
        paused: this.paused,
        currentTime: this.currentTime,
        readyState: this.readyState,
        stack,
      });
      return origPause.apply(this, args);
    };
    // @ts-ignore
    window.Audio = class TrackingAudio extends OriginalAudio {
      constructor(...args) {
        super(...args);
        // @ts-ignore
        window.__audioInstances.push(this);
      }
    };
  });
  const page = await context.newPage();

  const logs = [];
  const errors = [];
  const unauthorized = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("response", (res) => {
    const url = res.url();
    if (res.status() === 401 && (url.includes("/api/recordings") || url.includes("/api/session/complete"))) {
      unauthorized.push(url);
    }
  });

  await page.goto("http://127.0.0.1:3010/practice", { waitUntil: "networkidle" });
  const startButton = page.locator("#tour-record-btn");
  const ready = await startButton.isVisible().catch(() => false);
  if (!ready) {
    await page.waitForTimeout(30000);
  }
  const visible = await startButton.isVisible().catch(() => false);
  if (!visible) {
    const title = await page.title().catch(() => "");
    const bodyText = (await page.textContent("body").catch(() => "")) || "";
    console.log(JSON.stringify({
      startupFailure: true,
      title,
      bodySnippet: bodyText.replace(/\s+/g, " ").trim().slice(0, 500),
      errors,
    }, null, 2));
    await context.close();
    await browser.close();
    process.exit(0);
  }

  async function audioState(tag) {
    const st = await page.evaluate(() => {
      // @ts-ignore
      const arr = window.__audioInstances || [];
      const a = arr[0] || null;
      if (!a) return { hasAudio: false };
      return {
        instances: arr.length,
        hasAudio: true,
        paused: a.paused,
        currentTime: a.currentTime,
        duration: Number.isFinite(a.duration) ? a.duration : null,
        readyState: a.readyState,
        networkState: a.networkState,
        volume: a.volume,
        loop: a.loop,
        src: a.currentSrc || a.src || null,
      };
    });
    logs.push({ tag, audio: st });
    return st;
  }

  async function sessionTimer() {
    return await page.evaluate(() => {
      const root = document.querySelector("#tour-record-btn") || document.body;
      const candidates = [...root.querySelectorAll("span")]
        .map((n) => n.textContent?.trim() || "")
        .filter(Boolean);
      const timer = candidates.find((t) => /^\d+:\d{2}$/.test(t));
      return timer || null;
    });
  }

  async function startButtonText(tag) {
    const txt = ((await startButton.textContent()) || "").replace(/\s+/g, " ").trim();
    logs.push({ tag, startButtonText: txt });
    return txt;
  }

  const pre = await audioState("before_start");
  await startButtonText("before_start_text");

  await startButton.click({ force: true });
  await startButtonText("after_click_text");

  for (let i = 0; i < 12; i++) {
    const txt = ((await startButton.textContent()) || "").toUpperCase();
    if (!txt.includes("START")) break;
    await page.waitForTimeout(500);
  }

  const duringCountdown = await audioState("after_click_countdown");
  const countdownText = await startButtonText("after_click_countdown_text");

  await page.waitForTimeout(5000);
  const playing1 = await audioState("playing_t_plus_5s");
  const playingText1 = await startButtonText("playing_t_plus_5s_text");
  const timer1 = await sessionTimer();
  await page.waitForTimeout(2500);
  const playing2 = await audioState("playing_t_plus_7_5s");
  const playingText2 = await startButtonText("playing_t_plus_7_5s_text");
  const timer2 = await sessionTimer();

  const word1 = await page.locator("#tour-record-btn h1").first().textContent().catch(() => null);
  await page.waitForTimeout(12000);
  const word2 = await page.locator("#tour-record-btn h1").first().textContent().catch(() => null);

  const pauseButton = page.getByRole("button", { name: /pause session/i });
  if (await pauseButton.count()) {
    await pauseButton.click({ force: true });
    await page.waitForTimeout(1200);
    const pausedA = await audioState("paused");
    const pt1 = await sessionTimer();
    await page.waitForTimeout(1500);
    const pausedB = await audioState("paused_t_plus_1_5s");
    const pt2 = await sessionTimer();

    const resumeButton = page.getByRole("button", { name: /resume/i });
    if (await resumeButton.count()) {
      await resumeButton.click({ force: true });
      await page.waitForTimeout(1500);
      await audioState("resumed");
    }

    logs.push({ tag: "pause_timer_check", timer_before: pt1, timer_after: pt2, pausedA, pausedB });
  }

  await startButton.click({ force: true });
  const confirmButton = page.getByRole("button", { name: /confirm/i }).first();
  if (await confirmButton.count()) {
    await confirmButton.click({ force: true });
  }
  await page.waitForTimeout(2000);
  const postStop = await audioState("after_stop");
  const postStopText = ((await startButton.textContent()) || "").toUpperCase();
  const playCalls = await page.evaluate(() => {
    // @ts-ignore
    return window.__playCalls || [];
  });

  console.log(JSON.stringify({
    pre,
    duringCountdown,
    playing1,
    playing2,
    timers: { timer1, timer2 },
    texts: { countdownText, playingText1, playingText2, postStopText },
    words: { word1: word1 ? word1.trim() : null, word2: word2 ? word2.trim() : null },
    postStop,
    postStopHasStart: postStopText.includes("START"),
    playCalls,
    unauthorized,
    errors,
    logs,
  }, null, 2));

  await context.close();
  await browser.close();
})();
