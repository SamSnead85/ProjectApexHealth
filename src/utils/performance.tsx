/**
 * Performance Utilities
 * Helpers for lazy loading, memoization, and optimization
 */

import { lazy, Suspense, ComponentType, useEffect, useState, useRef, useCallback } from 'react'
import { SkeletonDashboard } from '../components/ui/SkeletonLoader'

/**
 * Lazy load a component with a fallback skeleton
 */
export function lazyWithSkeleton<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    FallbackComponent: ComponentType = SkeletonDashboard
) {
    const LazyComponent = lazy(importFn)

    return function LazyWithFallback(props: any) {
        return (
            <Suspense fallback={<FallbackComponent />}>
                <LazyComponent {...props} />
            </Suspense>
        )
    }
}

/**
 * Debounce hook for search inputs, resize handlers, etc.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

/**
 * Throttle hook for scroll handlers, etc.
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState(value)
    const lastRan = useRef(Date.now())

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value)
                lastRan.current = Date.now()
            }
        }, limit - (Date.now() - lastRan.current))

        return () => {
            clearTimeout(handler)
        }
    }, [value, limit])

    return throttledValue
}

/**
 * Intersection Observer hook for lazy loading content
 */
export function useInView(options?: IntersectionObserverInit) {
    const [isInView, setIsInView] = useState(false)
    const [hasBeenInView, setHasBeenInView] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting)
            if (entry.isIntersecting) {
                setHasBeenInView(true)
            }
        }, options)

        observer.observe(element)

        return () => {
            observer.disconnect()
        }
    }, [options])

    return { ref, isInView, hasBeenInView }
}

/**
 * Prefetch data on hover/focus
 */
export function usePrefetch<T>(fetchFn: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const hasFetched = useRef(false)

    const prefetch = useCallback(async () => {
        if (hasFetched.current || isLoading) return

        setIsLoading(true)
        hasFetched.current = true

        try {
            const result = await fetchFn()
            setData(result)
        } catch (error) {
            console.error('Prefetch failed:', error)
        } finally {
            setIsLoading(false)
        }
    }, [fetchFn, isLoading])

    return { data, isLoading, prefetch }
}

/**
 * Local storage with SSR safety
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue

        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error('Error reading from localStorage:', error)
            return initialValue
        }
    })

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error)
        }
    }, [key, storedValue])

    return [storedValue, setValue] as const
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallbackPolyfill(
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
): number {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        return (window as Window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(callback, options)
    }

    // Fallback for Safari
    return setTimeout(() => {
        callback({
            didTimeout: false,
            timeRemaining: () => 50
        })
    }, options?.timeout ?? 1) as unknown as number
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallbackPolyfill(handle: number): void {
    if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback: (handle: number) => void }).cancelIdleCallback(handle)
    } else {
        clearTimeout(handle)
    }
}

/**
 * Measure component render time (development only)
 */
export function useRenderTime(componentName: string) {
    const startTime = useRef(performance.now())

    useEffect(() => {
        if (import.meta.env.DEV) {
            const endTime = performance.now()
            console.log(`[Render] ${componentName}: ${(endTime - startTime.current).toFixed(2)}ms`)
        }
    })
}

export default {
    lazyWithSkeleton,
    useDebounce,
    useThrottle,
    useInView,
    usePrefetch,
    useLocalStorage,
    requestIdleCallbackPolyfill,
    cancelIdleCallbackPolyfill,
    useRenderTime
}
