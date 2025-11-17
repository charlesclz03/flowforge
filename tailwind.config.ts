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
          secondary: '#8E8E93',
          tertiary: '#48484A',
          muted: '#3A3A3C',
        },
        accent: {
          purple: '#7D7AFF', // Primary accent color
          orange: '#FF9500', // Premium badges only
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
      },
      fontFamily: {
        sans: ['"SF Pro Display"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        display: ['4rem', { lineHeight: '1', fontWeight: '300', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1', fontWeight: '300', letterSpacing: '-0.015em' }],
        numeral: ['4.5rem', { lineHeight: '1', fontWeight: '200', letterSpacing: '-0.03em' }],
      },
      animation: {
        'timer-ring': 'spin 1s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbital-glow': 'orbital 16s linear infinite',
        'ambient-shift': 'ambientShift 8s ease-in-out infinite',
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
      },
      backgroundImage: {
        'gradient-pulse': 'linear-gradient(135deg, #7D7AFF 0%, #9D7AFF 50%, #BD7AFF 100%)',
        'gradient-aurora': 'linear-gradient(120deg, rgba(125,122,255,0.6) 0%, rgba(157,122,255,0.4) 50%, rgba(189,122,255,0.3) 100%)',
        'gradient-midnight': 'linear-gradient(160deg, rgba(12,12,15,0.9) 0%, rgba(27,27,31,0.9) 50%, rgba(10,10,12,0.95) 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7D7AFF 0%, #9D7AFF 100%)',
      },
      boxShadow: {
        neon: '0 0 30px rgba(125, 122, 255, 0.4)',
        glow: '0 10px 40px rgba(125, 122, 255, 0.3)',
        soft: '0 20px 60px rgba(0, 0, 0, 0.45)',
        purple: '0 0 20px rgba(125, 122, 255, 0.5)',
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

