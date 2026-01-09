// global.d.ts
interface Window {
  webkitAudioContext: typeof AudioContext
}

interface Navigator {
  wakeLock: WakeLock
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>
}

interface WakeLockSentinel extends EventTarget {
  released: boolean
  type: 'screen'
  release(): Promise<void>
  onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null
}
