export const AVATAR_MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export const AVATAR_ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export type AvatarMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number]

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const JPG_SIGNATURE_PREFIX = [0xff, 0xd8, 0xff]
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46] // "RIFF"
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50] // "WEBP"

export function detectAvatarMimeType(bytes: Uint8Array): AvatarMimeType | null {
  if (bytes.length < 12) {
    return null
  }

  const isPng = PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)
  if (isPng) {
    return 'image/png'
  }

  const isJpg = JPG_SIGNATURE_PREFIX.every(
    (byte, index) => bytes[index] === byte
  )
  if (isJpg) {
    return 'image/jpeg'
  }

  const isRiff = RIFF_SIGNATURE.every((byte, index) => bytes[index] === byte)
  const isWebp = WEBP_SIGNATURE.every(
    (byte, index) => bytes[index + 8] === byte
  )
  if (isRiff && isWebp) {
    return 'image/webp'
  }

  return null
}

export function avatarExtensionForMimeType(mimeType: AvatarMimeType): string {
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return 'jpg'
}

export function isAllowedAvatarMimeType(
  mimeType: string
): mimeType is AvatarMimeType {
  return AVATAR_ALLOWED_MIME_TYPES.includes(mimeType as AvatarMimeType)
}

export function isValidAvatarFileName(fileName: string): boolean {
  return /^[a-z0-9-]{20,120}\.(png|jpe?g|webp)$/i.test(fileName)
}
