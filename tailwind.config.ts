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
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8E8E93',
          tertiary: '#48484A',
        },
        accent: {
          orange: '#FF9500',
          blue: '#0A84FF',
          green: '#30D158',
          red: '#FF3B30',
        },
        timer: {
          ring: '#FF9500',
          background: '#2C2C2E',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1', fontWeight: '300' }],
        'display-sm': ['3rem', { lineHeight: '1', fontWeight: '300' }],
      },
      animation: {
        'timer-ring': 'spin 1s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config

