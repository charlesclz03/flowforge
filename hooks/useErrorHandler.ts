'use client'

import { useState, useCallback } from 'react'
import { AppError, createAppError } from '@/lib/errors'

import * as Sentry from '@sentry/nextjs'

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null)

  const handleError = useCallback((err: unknown, defaultCode?: string) => {
    const appError = createAppError(err, defaultCode)
    setError(appError)
    console.error('Error:', appError)

    // Log to Sentry
    Sentry.captureException(err, {
      extra: { code: appError.code, message: appError.message },
    })
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}
