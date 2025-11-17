/**
 * Design System Constants
 * Inspired by Clock iOS App aesthetics
 */

export const COLORS = {
  background: {
    DEFAULT: '#000000',
    card: '#1C1C1E',
    elevated: '#2C2C2E',
    glow: '#0A0A0C',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    tertiary: '#48484A',
    muted: '#3A3A3C',
  },
  accent: {
    purple: '#7D7AFF', // Primary accent color (replaces orange)
    orange: '#FF9500', // Now only for premium badges
    blue: '#0A84FF',
    green: '#30D158',
    red: '#FF3B30',
    violet: '#7D7AFF', // Same as purple
    aqua: '#32D3FF',
    teal: '#64D2FF',
  },
  timer: {
    ring: '#7D7AFF', // Purple instead of orange
    background: '#3A3A3C',
  },
  stroke: {
    subtle: '#2F2F30',
    strong: '#3F3F41',
    glow: '#1B1B1D',
  },
} as const

export const TYPOGRAPHY = {
  fontSize: {
    display: '4rem',
    'display-sm': '3rem',
    xl: '2rem',
    lg: '1.5rem',
    base: '1rem',
    sm: '0.875rem',
    xs: '0.75rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.08em',
  },
} as const

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const

export const BORDER_RADIUS = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
  full: '9999px',
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const ANIMATION = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  keyframes: {
    orbital: 'orbital-glow 16s linear infinite',
    pulse: 'pulse-record 1.5s ease-in-out infinite',
  },
} as const

export const GRADIENTS = {
  pulse: 'linear-gradient(135deg, #7D7AFF 0%, #9D7AFF 50%, #BD7AFF 100%)', // Purple gradient
  aurora:
    'linear-gradient(120deg, rgba(125,122,255,0.6) 0%, rgba(157,122,255,0.4) 50%, rgba(189,122,255,0.3) 100%)',
  midnight:
    'linear-gradient(160deg, rgba(12,12,15,0.9) 0%, rgba(27,27,31,0.9) 50%, rgba(10,10,12,0.95) 100%)',
  purple: 'linear-gradient(135deg, #7D7AFF 0%, #9D7AFF 100%)', // Simple purple gradient
} as const

export const SHADOWS = {
  neon: '0 0 30px rgba(125, 122, 255, 0.4)', // Purple glow
  glow: '0 10px 40px rgba(125, 122, 255, 0.3)', // Purple glow for buttons
  soft: '0 20px 60px rgba(0, 0, 0, 0.45)',
  purple: '0 0 20px rgba(125, 122, 255, 0.5)', // Strong purple glow
} as const

export const BLURS = {
  heavy: '24px',
  medium: '18px',
  light: '12px',
} as const

// Recording constants
export const RECORDING_CONFIG = {
  FREE_TIER_LIMIT_SECONDS: 120, // 2 minutes
  PRO_TIER_LIMIT_SECONDS: null, // Unlimited
  SAMPLE_RATE: 44100,
  CHANNELS: 2,
  MIME_TYPE: 'audio/wav',
} as const

// Session config constants
export const SESSION_CONFIG = {
  FREQUENCY_OPTIONS: [4, 8, 16] as const,
  DIFFICULTY_LEVELS: {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
  } as const,
  DIFFICULTY_LABELS: {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
  } as const,
  DEFAULT_DURATION_SECONDS: 120, // 2 minutes for free tier
  DEFAULT_FREQUENCY: 8, // 8 bars
  DEFAULT_DIFFICULTY: 2, // Medium
  TIMER_UPDATE_INTERVAL_MS: 100, // Update timer every 100ms
  WORD_ROTATION_CHECK_INTERVAL_MS: 100, // Check word rotation every 100ms
} as const

// Timing constants
export const TIMING = {
  SECONDS_PER_MINUTE: 60,
  BEATS_PER_BAR: 4,
} as const

// Storage keys
export const STORAGE_KEYS = {
  SESSIONS: 'flowforge_sessions',
  PREFERENCES: 'flowforge_preferences',
  LAST_BEAT: 'flowforge_last_beat',
  LAST_FREQUENCY: 'flowforge_last_frequency',
  LAST_DIFFICULTY: 'flowforge_last_difficulty',
} as const

// UI Constants
export const UI_CONFIG = {
  TIMER_RING_SIZE: 200,
  TIMER_RING_STROKE_WIDTH: 10,
  WORD_DISPLAY_DURATION_MS: 500, // How long to show word "pop" animation
  BEAT_CARD_HEIGHT: 80,
  MAX_SESSION_TITLE_LENGTH: 50,
  PLAY_BUTTON_SIZE_RATIO: 0.55, // Play button is 55% of timer ring size
  PLAY_ICON_SIZE_RATIO: 0.2, // Play icon is 20% of timer ring size
  STOP_ICON_SIZE_RATIO: 0.15, // Stop icon is 15% of timer ring size
} as const
