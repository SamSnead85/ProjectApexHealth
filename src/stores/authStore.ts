// ═══════════════════════════════════════════════════════
// Apex Health Platform - Auth Store (Zustand)
// Central authentication state management
// ═══════════════════════════════════════════════════════

import { create } from 'zustand';
import type { AuthUser, LoginResponse } from '../../packages/shared/src/types/auth';
import { apiClient } from '../services/api-client';

interface AuthState {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string, mfaCode?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hydrateFromToken: (loginResponse: LoginResponse) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // ─── Initial State ────────────────────────────────

  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ─── Actions ──────────────────────────────────────

  login: async (email: string, password: string, mfaCode?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
        email,
        password,
        mfaCode,
      });

      // Store tokens in the API client (in-memory only — HIPAA compliant)
      apiClient.setTokens(response.accessToken, response.refreshToken);
      apiClient.setOrganizationId(response.user.organizationId);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    // Fire-and-forget server logout (best effort)
    if (apiClient.isAuthenticated()) {
      apiClient.post('/api/v1/auth/logout').catch(() => {
        // Ignore errors on logout
      });
    }
    apiClient.clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  setUser: (user: AuthUser) => {
    set({ user, isAuthenticated: true });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  hydrateFromToken: (loginResponse: LoginResponse) => {
    apiClient.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
    apiClient.setOrganizationId(loginResponse.user.organizationId);
    set({
      user: loginResponse.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  hasPermission: (permission: string): boolean => {
    const { user } = get();
    if (!user) return false;
    return user.permissions.includes(permission);
  },

  hasRole: (role: string): boolean => {
    const { user } = get();
    if (!user) return false;
    return user.role === role;
  },

  hasAnyPermission: (permissions: string[]): boolean => {
    const { user } = get();
    if (!user) return false;
    return permissions.some((p) => user.permissions.includes(p));
  },

  hasAllPermissions: (permissions: string[]): boolean => {
    const { user } = get();
    if (!user) return false;
    return permissions.every((p) => user.permissions.includes(p));
  },
}));

export default useAuthStore;
