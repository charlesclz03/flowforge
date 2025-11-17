'use client'

import { useState, useCallback } from 'react'
import { AppError, createAppError } from '@/lib/errors'

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null)
  
  const handleError = useCallback((err: unknown, defaultCode?: string) => {
    const appError = createAppError(err, defaultCode)
    setError(appError)
    console.error('Error:', appError)
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  return { error, handleError, clearError }
}

