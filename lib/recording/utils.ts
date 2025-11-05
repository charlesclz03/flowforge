/**
 * Convert blob to base64
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Convert base64 to blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'audio/webm'): Blob {
  const byteString = atob(base64.split(',')[1])
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8Array = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i)
  }

  return new Blob([arrayBuffer], { type: mimeType })
}

/**
 * Get audio duration from blob
 */
export async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(blob)

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    }

    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio'))
    }

    audio.src = url
  })
}

/**
 * Create audio element from blob
 */
export function createAudioFromBlob(blob: Blob): HTMLAudioElement {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  return audio
}

/**
 * Format recording filename
 */
export function formatRecordingFilename(title?: string, timestamp?: Date): string {
  const date = timestamp || new Date()
  const dateStr = date.toISOString().split('T')[0]
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-')
  const prefix = title ? `${title.replace(/[^a-z0-9]/gi, '-')}_` : 'recording_'
  
  return `${prefix}${dateStr}_${timeStr}.webm`
}

/**
 * Estimate file size based on duration and bitrate
 */
export function estimateFileSize(
  durationSeconds: number,
  bitrate: number = 128000
): number {
  // bitrate is in bits per second, convert to bytes
  return (durationSeconds * bitrate) / 8
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

