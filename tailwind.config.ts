import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clock iOS App inspired color palette
        background: {
          DEFAULT: '#000000',
          card: '#1C1C1E',
          elevated: '#2C2C2E',
          glow: '#0A0A0C',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          tertiary: '#8E8E93',
          muted: '#636366',
        },
        accent: {
          purple: '#7D7AFF', // Primary brand/action
          cyan: '#32D3FF', // Informational/system
          pink: '#FF4FD8', // Legacy creative accent, use sparingly
          gold: '#FFD60A', // Pro/premium
          // Back-compat alias (many components still use `accent-yellow`)
          yellow: '#FFD60A',
          platinum: '#E5E5EA', // Silver/Platinum
          bronze: '#CD7F32',
          orange: '#FF9500',
          blue: '#0A84FF', // Informational/system
          green: '#30D158', // Success/ready
          red: '#FF3B30', // Destructive/recording/error
          violet: '#7D7AFF', // Same as purple
          aqua: '#32D3FF',
          teal: '#64D2FF',
          // Audit Semantic Colors
          success: '#30D158', // Green
          warning: '#FF9F0A', // Amber/Orange
          error: '#FF453A', // Red
        },
        surface: {
          base: '#0A0A0C',
          subtle: '#121212', // Off-black (Audit 4.2)
          elevated: '#2C2C2E', // Matches `background.elevated`
          'elevation-1': '#16161A',
          'elevation-2': '#202026',
          highlight: '#2A2A34',
        },
        primary: {
          50: '#F1F1FF',
          100: '#E4E3FF',
          200: '#C9C7FF',
          300: '#ABA8FF',
          400: '#918EFF',
          500: '#7D7AFF',
          600: '#6761F2',
          700: '#514BCF',
          800: '#3D39A3',
          900: '#282665',
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
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        display: [
          '4rem',
          { lineHeight: '1', fontWeight: '300', letterSpacing: '-0.02em' },
        ],
        'display-sm': [
          '3rem',
          { lineHeight: '1', fontWeight: '300', letterSpacing: '-0.015em' },
        ],
        numeral: [
          '4.5rem',
          { lineHeight: '1', fontWeight: '200', letterSpacing: '-0.03em' },
        ],
      },
      animation: {
        'timer-ring': 'spin 1s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbital-glow': 'orbital 16s linear infinite',
        'ambient-shift': 'ambientShift 8s ease-in-out infinite',
        'bounce-in':
          'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        orbital: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ambientShift: {
          '0%, 100%': { opacity: '0.35', filter: 'hue-rotate(0deg)' },
          '50%': { opacity: '0.6', filter: 'hue-rotate(45deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-pulse':
          'linear-gradient(135deg, #7D7AFF 0%, #9D7AFF 50%, #BD7AFF 100%)',
        'gradient-aurora':
          'linear-gradient(120deg, rgba(125,122,255,0.6) 0%, rgba(157,122,255,0.4) 50%, rgba(189,122,255,0.3) 100%)',
        'gradient-midnight':
          'linear-gradient(160deg, rgba(12,12,15,0.9) 0%, rgba(27,27,31,0.9) 50%, rgba(10,10,12,0.95) 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7D7AFF 0%, #9D7AFF 100%)',
      },
      boxShadow: {
        neon: '0 0 24px rgba(125, 122, 255, 0.22)',
        glow: '0 10px 34px rgba(125, 122, 255, 0.2)',
        soft: '0 20px 60px rgba(0, 0, 0, 0.45)',
        purple: '0 0 18px rgba(125, 122, 255, 0.28)',
        'purple-glow': '0 0 22px rgba(125, 122, 255, 0.28)',
        'red-glow': '0 0 22px rgba(255, 59, 48, 0.3)',
        'surface-1': '0 16px 48px rgba(0, 0, 0, 0.36)',
        'surface-2': '0 24px 70px rgba(0, 0, 0, 0.48)',
      },
      dropShadow: {
        neon: '0 0 10px rgba(125, 122, 255, 0.6)',
        purple: '0 0 10px rgba(125, 122, 255, 0.6)',
      },
      backdropBlur: {
        heavy: '24px',
        medium: '18px',
        light: '12px',
      },
    },
  },
  plugins: [],
}

export default config
