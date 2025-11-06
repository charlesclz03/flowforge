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
    orange: '#FF9500',
    blue: '#0A84FF',
    green: '#30D158',
    red: '#FF3B30',
    violet: '#7D7AFF',
    aqua: '#32D3FF',
    teal: '#64D2FF',
  },
  timer: {
    ring: '#FF9500',
    background: '#2C2C2E',
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
  pulse: 'linear-gradient(135deg, #0A84FF 0%, #7D7AFF 45%, #FF9500 100%)',
  aurora: 'linear-gradient(120deg, rgba(10,132,255,0.6) 0%, rgba(125,122,255,0.4) 50%, rgba(48,209,88,0.3) 100%)',
  midnight: 'linear-gradient(160deg, rgba(12,12,15,0.9) 0%, rgba(27,27,31,0.9) 50%, rgba(10,10,12,0.95) 100%)',
} as const

export const SHADOWS = {
  neon: '0 0 30px rgba(10, 132, 255, 0.25)',
  glow: '0 10px 40px rgba(255, 149, 0, 0.2)',
  soft: '0 20px 60px rgba(0, 0, 0, 0.45)',
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
  TIMER_RING_STROKE_WIDTH: 8,
  WORD_DISPLAY_DURATION_MS: 500, // How long to show word "pop" animation
  BEAT_CARD_HEIGHT: 80,
  MAX_SESSION_TITLE_LENGTH: 50,
} as const
