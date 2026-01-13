import { Beat } from '@/types/database'

export type BeatVisualStyle = {
  background: string
  overlay?: string
  accentColor: string
  textColor: string
  pattern?: string
}

// Simple deterministic random generator based on seed
class ReseedableRandom {
  private seed: number

  constructor(seed: string) {
    // Simple hash of the string to get a number
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    this.seed = Math.abs(hash)
  }

  // Returns number between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000
    return x - Math.floor(x)
  }

  // Returns integer between min and max (inclusive)
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(array: T[]): T {
    return array[this.range(0, array.length - 1)]
  }
}

// Color Palettes (Dark/Neon/Vibrant)
// Dark Premium Color Palettes
const PALETTES = [
  // Obsidian (Black/Dark Gray)
  { bg: ['#000000', '#1A1A1A', '#2C2C2C'], accent: '#FFFFFF' },
  // Midnight (Deep Blue)
  { bg: ['#020024', '#090979', '#000000'], accent: '#00d4ff' },
  // Deep Space (Purple/Black)
  { bg: ['#1A0B2E', '#11052C', '#000000'], accent: '#E0AAFF' },
  // Forest Night (Very Dark Green)
  { bg: ['#051F20', '#0B2B26', '#000000'], accent: '#A7D7C5' },
  // Vampire (Dark Red/Black)
  { bg: ['#2B0505', '#1A0000', '#000000'], accent: '#FF5E5E' },
]

function generateDarkGradient(rng: ReseedableRandom, colors: string[]): string {
  // Always use a linear gradient for a sleek look
  // Occasionally do a subtle radial, but mostly linear
  const angle = rng.range(135, 225) // Diagonal flow
  const c1 = colors[0]
  const c2 = colors[colors.length - 1]

  return `linear-gradient(${angle}deg, ${c1}, ${c2})`
}

function generateSubtlePattern(rng: ReseedableRandom, _color: string): string {
  const type = rng.range(0, 3)
  const opacity = 0.05 // Very subtle

  switch (type) {
    case 0: // Dots
      return `radial-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px)`
    case 1: // Grid
      return `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`
    case 2: // Diagonal Lines
      return `repeating-linear-gradient(45deg, rgba(255,255,255,${opacity}), rgba(255,255,255,${opacity}) 1px, transparent 1px, transparent 10px)`
    default:
      return ''
  }
}

export function getBeatVisualStyle(beat: Beat): BeatVisualStyle {
  const rng = new ReseedableRandom(beat.id + beat.title)

  // 1. Pick a Palette
  const palette = rng.pick(PALETTES)

  // 2. Generate Background (Dark Gradient)
  const background = generateDarkGradient(rng, palette.bg)

  // 3. Add Pattern Overlay
  let pattern = ''
  if (rng.next() > 0.3) {
    pattern = generateSubtlePattern(rng, palette.accent)
  }

  return {
    background,
    accentColor: palette.accent,
    textColor: '#ffffff',
    pattern,
  }
}
