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
const PALETTES = [
  // Purple/Blue/Pink (Cyberpunk)
  { bg: ['#2D00F7', '#6A00F4', '#F20089'], accent: '#F20089' },
  // Teal/Blue/Green (Deep Sea)
  { bg: ['#007F5F', '#2B9348', '#80B918'], accent: '#CCFF33' },
  // Orange/Red/Yellow (Fire)
  { bg: ['#D00000', '#E85D04', '#FFBA08'], accent: '#FFBA08' },
  // Deep Purple/Black (Midnight)
  { bg: ['#10002B', '#240046', '#3C096C'], accent: '#E0AAFF' },
  // Monochrome/Accent
  { bg: ['#000000', '#212529', '#343A40'], accent: '#CED4DA' },
]

function generateMeshGradient(rng: ReseedableRandom, colors: string[]): string {
  const points = []
  const numPoints = rng.range(3, 6)

  for (let i = 0; i < numPoints; i++) {
    const x = rng.range(0, 100)
    const y = rng.range(0, 100)
    const color = rng.pick(colors)
    points.push(
      `radial-gradient(circle at ${x}% ${y}%, ${color}, transparent 50%)`
    )
  }

  // Add a base color
  const baseBase = rng.pick(colors)
  return `${points.join(', ')}, ${baseBase}`
}

function generateGeometricPattern(
  rng: ReseedableRandom,
  color: string
): string {
  const type = rng.pick(['circles', 'lines', 'dots'])
  if (type === 'circles') {
    return `radial-gradient(circle, ${color} 2px, transparent 2.5px)`
  } else if (type === 'lines') {
    const deg = rng.pick([0, 45, 90, 135])
    return `repeating-linear-gradient(${deg}deg, ${color}, ${color} 1px, transparent 1px, transparent 10px)`
  } else {
    return `radial-gradient(${color} 1px, transparent 1px)`
  }
}

export function getBeatVisualStyle(beat: Beat): BeatVisualStyle {
  const rng = new ReseedableRandom(beat.id + beat.title)

  // 1. Pick a Palette
  const palette = rng.pick(PALETTES)

  // 2. Decide Style Type
  // 0: Mesh Gradient
  // 1: Sharp/Abstract
  // 2: Dark Minimal
  const styleType = rng.range(0, 2)

  let background = ''
  let pattern = ''

  switch (styleType) {
    case 0: // Mesh
      background = generateMeshGradient(rng, palette.bg)
      break
    case 1: // Abstract Linear
      const c1 = rng.pick(palette.bg)
      const c2 = rng.pick(palette.bg)
      const deg = rng.range(0, 360)
      background = `linear-gradient(${deg}deg, ${c1}, ${c2})`
      break
    case 2: // Dark Minimal
      background = `linear-gradient(to bottom right, #000000, ${rng.pick(palette.bg)})`
      break
  }

  // 3. Add Pattern Overlay (CSS)
  // We will apply this as a separate style or background image
  if (rng.next() > 0.5) {
    pattern = generateGeometricPattern(rng, 'rgba(255,255,255,0.1)')
  }

  return {
    background,
    accentColor: palette.accent,
    textColor: '#ffffff',
    pattern,
  }
}
