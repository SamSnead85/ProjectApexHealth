import { useState, useCallback } from 'react'

/**
 * useRetry – data-fetching hook with automatic exponential-backoff retry.
 *
 * @param fetchFn    Async function that returns data of type T
 * @param maxRetries Maximum number of retry attempts (default 3)
 * @param retryDelay Base delay in ms before first retry (doubles each attempt)
 *
 * @example
 * const { data, error, loading, execute, retry } = useRetry(
 *   () => fetch('/api/claims').then(r => r.json()),
 *   3,
 *   1000,
 * )
 */
export function useRetry<T>(
    fetchFn: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000,
) {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState(false)
    const [retryCount, setRetryCount] = useState(0)

    const execute = useCallback(async () => {
        setLoading(true)
        setError(null)
        let lastError: Error | null = null

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await fetchFn()
                setData(result)
                setLoading(false)
                setRetryCount(0)
                return result
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err))
                setRetryCount(attempt + 1)
                if (attempt < maxRetries) {
                    await new Promise((r) => setTimeout(r, retryDelay * Math.pow(2, attempt)))
                }
            }
        }

        setError(lastError)
        setLoading(false)
        return null
    }, [fetchFn, maxRetries, retryDelay])

    const retry = useCallback(() => {
        setRetryCount(0)
        return execute()
    }, [execute])

    return { data, error, loading, retryCount, execute, retry }
}
