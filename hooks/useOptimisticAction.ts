import { useState, useCallback } from 'react'

interface OptimisticActionOptions<T, R> {
  onOptimistic?: (variables: T) => void
  onSuccess?: (result: R, variables: T) => void
  onError?: (error: Error, variables: T) => void
  onSettled?: (variables: T) => void
}

export function useOptimisticAction<T, R = unknown>(
  action: (variables: T) => Promise<R>,
  options: OptimisticActionOptions<T, R> = {}
) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (variables: T) => {
      setIsPending(true)
      setError(null)

      // 1. Optimistic Update
      if (options.onOptimistic) {
        try {
          options.onOptimistic(variables)
        } catch (e) {
          console.error('Optimistic update failed', e)
        }
      }

      try {
        // 2. Perform Action
        const result = await action(variables)

        // 3. Success Handler
        if (options.onSuccess) {
          options.onSuccess(result, variables)
        }
        return result
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        setError(err)

        // 4. Error Handler (Rollback logic should happen here by consumer)
        if (options.onError) {
          options.onError(err, variables)
        }
        throw err
      } finally {
        setIsPending(false)
        if (options.onSettled) {
          options.onSettled(variables)
        }
      }
    },
    [action, options]
  )

  return { mutate, isPending, error }
}
