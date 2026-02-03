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

interface HTMLAudioElement {
  /**
   * Internal tracker to prevent double-attaching a MediaElementAudioSourceNode.
   * This is intentionally non-standard and used only within the app.
   */
  _sourceNode?: MediaElementAudioSourceNode
}
