/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Standardized error codes for the application
 */
export const ErrorCodes = {
  // Audio errors
  BEAT_LOAD_FAILED: 'BEAT_LOAD_FAILED',
  AUDIO_PLAYBACK_FAILED: 'AUDIO_PLAYBACK_FAILED',

  // Recording errors
  MIC_PERMISSION_DENIED: 'MIC_PERMISSION_DENIED',
  RECORDING_FAILED: 'RECORDING_FAILED',
  RECORDING_INIT_FAILED: 'RECORDING_INIT_FAILED',

  // API errors
  FETCH_BEATS_FAILED: 'FETCH_BEATS_FAILED',
  FETCH_WORDS_FAILED: 'FETCH_WORDS_FAILED',
  FETCH_SESSIONS_FAILED: 'FETCH_SESSIONS_FAILED',
  FETCH_RECORDINGS_FAILED: 'FETCH_RECORDINGS_FAILED',

  // Session errors
  SESSION_CREATE_FAILED: 'SESSION_CREATE_FAILED',
  SESSION_SAVE_FAILED: 'SESSION_SAVE_FAILED',
  SESSION_DELETE_FAILED: 'SESSION_DELETE_FAILED',
  RECORDING_UPLOAD_FAILED: 'RECORDING_UPLOAD_FAILED',
  RECORDING_DOWNLOAD_FAILED: 'RECORDING_DOWNLOAD_FAILED',

  // Auth errors
  AUTH_FAILED: 'AUTH_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

/**
 * User-friendly error messages
 */
export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.BEAT_LOAD_FAILED]: 'Failed to load the selected beat. Please try another one.',
  [ErrorCodes.AUDIO_PLAYBACK_FAILED]:
    'Failed to start audio playback. Please check your device settings.',
  [ErrorCodes.MIC_PERMISSION_DENIED]:
    'Microphone access denied. Please enable microphone permissions in your browser settings.',
  [ErrorCodes.RECORDING_FAILED]: 'Recording failed. Please check your microphone connection.',
  [ErrorCodes.RECORDING_INIT_FAILED]:
    'Failed to initialize recording. Please refresh the page and try again.',
  [ErrorCodes.FETCH_BEATS_FAILED]: 'Failed to load beats. Please refresh the page.',
  [ErrorCodes.FETCH_WORDS_FAILED]: 'Failed to load word prompts. Please refresh the page.',
  [ErrorCodes.FETCH_SESSIONS_FAILED]: 'Failed to load your sessions. Please try again.',
  [ErrorCodes.FETCH_RECORDINGS_FAILED]: 'Failed to load your recordings. Please try again.',
  [ErrorCodes.SESSION_CREATE_FAILED]: 'Failed to create session. Please try again.',
  [ErrorCodes.SESSION_SAVE_FAILED]: 'Failed to save your session. Please try again.',
  [ErrorCodes.SESSION_DELETE_FAILED]: 'Failed to delete recording. Please try again.',
  [ErrorCodes.RECORDING_UPLOAD_FAILED]: 'Failed to upload recording. Please try again.',
  [ErrorCodes.RECORDING_DOWNLOAD_FAILED]: 'Failed to download recording. Please try again.',
  [ErrorCodes.AUTH_FAILED]: 'Authentication failed. Please try signing in again.',
  [ErrorCodes.UNAUTHORIZED]: 'You must be signed in to access this feature.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your internet connection.',
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return ErrorMessages[error.code] || error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return ErrorMessages[ErrorCodes.UNKNOWN_ERROR]
}

/**
 * Create an AppError from unknown error
 */
export function createAppError(
  error: unknown,
  defaultCode: string = ErrorCodes.UNKNOWN_ERROR
): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, defaultCode)
  }

  if (typeof error === 'string') {
    return new AppError(error, defaultCode)
  }

  return new AppError(ErrorMessages[defaultCode], defaultCode)
}
