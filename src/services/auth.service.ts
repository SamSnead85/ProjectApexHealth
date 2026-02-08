// ═══════════════════════════════════════════════════════
// Apex Health Platform - Auth Service
// Authentication, authorization, and session management
// ═══════════════════════════════════════════════════════

import { apiClient, ApiError } from './api-client';
import { useAuthStore } from '../stores/authStore';
import type { AuthUser, LoginResponse } from '../../packages/shared/src/types/auth';

// ─── Auth Service ───────────────────────────────────────

export const authService = {
  /**
   * Authenticate a user with email and password.
   * Stores tokens in-memory via apiClient and updates the Zustand auth store.
   */
  async login(email: string, password: string, mfaCode?: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
      email,
      password,
      mfaCode,
    });

    apiClient.setTokens(response.accessToken, response.refreshToken);
    apiClient.setOrganizationId(response.user.organizationId);

    useAuthStore.getState().setUser(response.user);

    return response;
  },

  /**
   * Log the user out — clear tokens and Zustand state.
   */
  logout(): void {
    useAuthStore.getState().logout();
  },

  /**
   * Manually trigger a token refresh.
   * Returns the new access token, or throws on failure.
   */
  async refreshToken(): Promise<string> {
    const currentRefresh = apiClient.getAccessToken(); // we rely on the internal refresh mechanism
    if (!currentRefresh) {
      throw new ApiError('No refresh token available', 'AUTH_NO_TOKEN', 401);
    }

    // Perform refresh by hitting a protected endpoint that triggers the 401 → refresh flow
    // Or call the refresh endpoint directly:
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/api/v1/auth/refresh',
    );

    apiClient.setTokens(response.accessToken, response.refreshToken);
    return response.accessToken;
  },

  /**
   * Get the currently authenticated user from the Zustand store.
   */
  getCurrentUser(): AuthUser | null {
    return useAuthStore.getState().user;
  },

  /**
   * Fetch the current user profile from the server and update the store.
   */
  async fetchCurrentUser(): Promise<AuthUser> {
    const user = await apiClient.get<AuthUser>('/api/v1/auth/me');
    useAuthStore.getState().setUser(user);
    return user;
  },

  /**
   * Check if the user is authenticated (has a valid token in memory).
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },

  /**
   * Check if the current user has a specific permission.
   */
  hasPermission(permission: string): boolean {
    return useAuthStore.getState().hasPermission(permission);
  },

  /**
   * Check if the current user has a specific role.
   */
  hasRole(role: string): boolean {
    return useAuthStore.getState().hasRole(role);
  },

  /**
   * Check if the current user has any of the specified permissions.
   */
  hasAnyPermission(permissions: string[]): boolean {
    return useAuthStore.getState().hasAnyPermission(permissions);
  },

  /**
   * Check if the current user has all of the specified permissions.
   */
  hasAllPermissions(permissions: string[]): boolean {
    return useAuthStore.getState().hasAllPermissions(permissions);
  },

  /**
   * Request a password reset email.
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/api/v1/auth/forgot-password', { email });
  },

  /**
   * Reset password with a token received via email.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/v1/auth/reset-password', { token, newPassword });
  },

  /**
   * Change the current user's password.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/v1/auth/change-password', { currentPassword, newPassword });
  },
};

export default authService;
