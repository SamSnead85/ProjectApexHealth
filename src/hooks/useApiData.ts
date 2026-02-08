/**
 * useApiData - Universal hook for fetching data with automatic fallback to mock data.
 * 
 * Pattern:
 *   const { data, isLoading, error, refresh, dataSource } = useApiData(
 *     '/api/v1/claims',
 *     mockClaimsData,
 *     { params: { status: 'pending' } }
 *   );
 * 
 * In demo mode (no API configured), returns mock data immediately.
 * In production mode, fetches from the API and falls back to mock data on error.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

interface UseApiDataOptions {
  params?: Record<string, string>;
  enabled?: boolean;
  refreshInterval?: number; // ms - auto-refresh interval
  transform?: (data: any) => any; // Transform API response
}

interface UseApiDataResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  dataSource: 'api' | 'mock';
  refresh: () => Promise<void>;
  lastFetchedAt: Date | null;
}

export function useApiData<T>(
  endpoint: string,
  mockData: T,
  options: UseApiDataOptions = {}
): UseApiDataResult<T> {
  const { params, enabled = true, refreshInterval, transform } = options;

  const [data, setData] = useState<T>(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    if (!API_BASE || !enabled) {
      setData(mockData);
      setDataSource('mock');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.set(key, value);
        });
      }

      const url = `${API_BASE}${endpoint}${searchParams.toString() ? `?${searchParams}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          // Token will be injected by api-client interceptor in production
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const responseData = await response.json();
      const apiData = responseData.data ?? responseData;
      const transformed = transform ? transform(apiData) : apiData;

      setData(transformed);
      setDataSource('api');
      setLastFetchedAt(new Date());
    } catch (err: any) {
      console.warn(`[useApiData] ${endpoint} failed, using mock data:`, err.message);
      setData(mockData);
      setDataSource('mock');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, JSON.stringify(params), enabled, API_BASE]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval && API_BASE && enabled) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [fetchData, refreshInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    dataSource,
    refresh: fetchData,
    lastFetchedAt,
  };
}

/**
 * useApiMutation - Hook for POST/PUT/DELETE operations with optimistic updates.
 */
interface UseApiMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiMutationResult<TPayload, TResult> {
  mutate: (payload: TPayload) => Promise<TResult | null>;
  isLoading: boolean;
  error: string | null;
}

export function useApiMutation<TPayload, TResult = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options: UseApiMutationOptions<TResult> = {}
): UseApiMutationResult<TPayload, TResult> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (payload: TPayload): Promise<TResult | null> => {
    if (!API_BASE) {
      console.warn('[useApiMutation] No API configured, mutation skipped');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const result = data.data ?? data;
      options.onSuccess?.(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      options.onError?.(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, method]);

  return { mutate, isLoading, error };
}

/**
 * useRealtimeData - Hook for WebSocket-powered real-time data.
 * Falls back to polling when WebSocket is not available.
 */
export function useRealtimeData<T>(
  channel: string,
  initialData: T,
  pollInterval: number = 30000
): { data: T; isConnected: boolean } {
  const [data, setData] = useState<T>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL;

    if (WS_URL) {
      try {
        const ws = new WebSocket(`${WS_URL}/${channel}`);
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setData(message.data ?? message);
          } catch { /* ignore non-JSON messages */ }
        };
        ws.onclose = () => setIsConnected(false);
        ws.onerror = () => setIsConnected(false);

        return () => {
          ws.close();
          wsRef.current = null;
        };
      } catch {
        // WebSocket not available, fall through to polling
      }
    }

    // Polling fallback
    if (API_BASE) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE}/api/v1/${channel}`);
          if (response.ok) {
            const responseData = await response.json();
            setData(responseData.data ?? responseData);
          }
        } catch { /* silent fail on polling */ }
      }, pollInterval);

      return () => clearInterval(interval);
    }
  }, [channel, pollInterval]);

  return { data, isConnected };
}
