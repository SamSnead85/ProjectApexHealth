// ═══════════════════════════════════════════════════════
// Apex Health Platform - API Client
// HIPAA-compliant HTTP client with JWT management
// Tokens stored in memory only (not localStorage)
// ═══════════════════════════════════════════════════════

import type {
  ApiResponse,
  ApiErrorResponse,
} from '../../packages/shared/src/types/api';

// ─── Error Class ────────────────────────────────────────

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromResponse(errorBody: ApiErrorResponse, status: number): ApiError {
    return new ApiError(
      errorBody.error.message,
      errorBody.error.code,
      status,
      errorBody.error.details,
    );
  }

  static networkError(originalError: unknown): ApiError {
    const message =
      originalError instanceof Error ? originalError.message : 'Network request failed';
    return new ApiError(message, 'NETWORK_ERROR', 0);
  }

  static timeoutError(): ApiError {
    return new ApiError('Request timed out', 'TIMEOUT', 408);
  }
}

// ─── Types ──────────────────────────────────────────────

type RequestInterceptor = (config: RequestInit, url: string) => RequestInit;
type ResponseInterceptor = (response: Response) => Promise<Response>;

interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
}

// ─── API Client ─────────────────────────────────────────

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private organizationId: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.timeout = config.timeout ?? 30_000;
    this.requestInterceptors = config.requestInterceptors ?? [];
    this.responseInterceptors = config.responseInterceptors ?? [];
  }

  // ─── Token Management (in-memory only for HIPAA) ────

  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.organizationId = null;
    this.refreshPromise = null;
  }

  setOrganizationId(orgId: string): void {
    this.organizationId = orgId;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // ─── HTTP Methods ───────────────────────────────────

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, { method: 'DELETE' });
  }

  /** Upload a file with multipart/form-data */
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const url = this.buildUrl(path);
    // Do not set Content-Type — the browser will set it with the boundary
    return this.request<T>(url, {
      method: 'POST',
      body: formData,
    }, /* skipContentType */ true);
  }

  // ─── Core Request Engine ────────────────────────────

  private async request<T>(
    url: string,
    init: RequestInit,
    skipContentType = false,
  ): Promise<T> {
    // Build headers
    const headers = new Headers(init.headers);
    if (!skipContentType && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    // Authorization
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    // Organization context
    if (this.organizationId) {
      headers.set('X-Organization-ID', this.organizationId);
    }

    // Request tracing
    headers.set('X-Request-ID', generateRequestId());

    let config: RequestInit = { ...init, headers };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config, url);
    }

    // Execute with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      let response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      // Handle 401 — attempt token refresh once
      if (response.status === 401 && this.refreshToken) {
        const newToken = await this.performTokenRefresh();
        if (newToken) {
          // Retry original request with refreshed token
          const retryHeaders = new Headers(config.headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          const retryConfig = { ...config, headers: retryHeaders, signal: undefined as unknown as AbortSignal };
          const retryController = new AbortController();
          const retryTimeout = setTimeout(() => retryController.abort(), this.timeout);
          retryConfig.signal = retryController.signal;
          response = await fetch(url, retryConfig);
          clearTimeout(retryTimeout);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw ApiError.timeoutError();
      }
      throw ApiError.networkError(error);
    }
  }

  // ─── Response Handling ──────────────────────────────

  private async handleResponse<T>(response: Response): Promise<T> {
    // No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const contentType = response.headers.get('Content-Type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const errorBody = (await response.json()) as ApiErrorResponse;
        throw ApiError.fromResponse(errorBody, response.status);
      }
      const text = await response.text();
      throw new ApiError(
        text || `HTTP ${response.status}: ${response.statusText}`,
        `HTTP_${response.status}`,
        response.status,
      );
    }

    if (!isJson) {
      // Return raw text for non-JSON responses
      const text = await response.text();
      return text as unknown as T;
    }

    const body = await response.json();

    // Standard API envelope — unwrap `data` if present
    if (body && typeof body === 'object' && 'success' in body) {
      const envelope = body as ApiResponse<T>;
      if (!envelope.success) {
        throw new ApiError(
          envelope.message ?? 'Request failed',
          'API_ERROR',
          response.status,
        );
      }
      return envelope.data;
    }

    return body as T;
  }

  // ─── Token Refresh ──────────────────────────────────

  private async performTokenRefresh(): Promise<string | null> {
    // De-duplicate concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) {
          this.clearTokens();
          return null;
        }

        const data = await response.json();
        const newAccess = data.data?.accessToken ?? data.accessToken;
        const newRefresh = data.data?.refreshToken ?? data.refreshToken ?? this.refreshToken;
        if (newAccess) {
          this.accessToken = newAccess;
          this.refreshToken = newRefresh;
          return newAccess;
        }

        this.clearTokens();
        return null;
      } catch {
        this.clearTokens();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ─── URL Builder ────────────────────────────────────

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      }
    }

    return url.toString();
  }
}

// ─── Helpers ──────────────────────────────────────────

function generateRequestId(): string {
  // Compact random request ID: timestamp + random suffix
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `req_${ts}_${rand}`;
}

// ─── Singleton Instance ─────────────────────────────

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:3000';

export const apiClient = new ApiClient({
  baseUrl: BASE_URL,
  timeout: 30_000,
});

export default apiClient;
