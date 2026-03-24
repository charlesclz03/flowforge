'use client'

import { useCallback, useState } from 'react'

interface ValidationState<T> {
  loading: boolean
  result: T | null
  error: string | null
}

export function useAsyncValidation<T, P>(
  validationFn: (payload: P) => Promise<T>
) {
  const [state, setState] = useState<ValidationState<T>>({
    loading: false,
    result: null,
    error: null,
  })

  const validate = useCallback(
    async (payload: P) => {
      setState({ loading: true, result: null, error: null })

      try {
        const data = await validationFn(payload)
        setState({ loading: false, result: data, error: null })
        return { success: true, data }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Validation failed'
        setState({ loading: false, result: null, error: message })
        return { success: false, error: message }
      }
    },
    [validationFn]
  )

  const reset = useCallback(() => {
    setState({ loading: false, result: null, error: null })
  }, [])

  return {
    validate,
    reset,
    loading: state.loading,
    result: state.result,
    error: state.error,
  }
}
