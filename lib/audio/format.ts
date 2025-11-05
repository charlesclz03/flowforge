/**
 * Audio format conversion utilities
 * For MVP, we work with native browser formats (WebM/Ogg)
 * V2 will add WAV conversion and more formats
 */

/**
 * Check if a mime type is supported
 */
export function isMimeTypeSupported(mimeType: string): boolean {
  if (typeof MediaRecorder === 'undefined') return false
  return MediaRecorder.isTypeSupported(mimeType)
}

/**
 * Get the best supported audio format
 */
export function getBestAudioFormat(): string {
  const formats = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]

  for (const format of formats) {
    if (isMimeTypeSupported(format)) {
      return format
    }
  }

  return 'audio/webm' // Fallback
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
  }

  for (const [type, ext] of Object.entries(map)) {
    if (mimeType.startsWith(type)) {
      return ext
    }
  }

  return 'webm' // Fallback
}

/**
 * Convert blob to WAV format (stub for MVP)
 * V2 will implement actual conversion
 */
export async function convertToWAV(blob: Blob): Promise<Blob> {
  console.warn('WAV conversion not implemented in MVP - returning original blob')
  return blob
}

