/**
 * AuthContext - Provides authentication state and actions throughout the app.
 * Wraps the application to provide login/logout, user info, permission checking,
 * and automatic token refresh.
 * 
 * In demo mode (no backend), falls back to simulated auth with portal switching.
 * In production mode, authenticates against the NestJS backend via JWT.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Types (inline to avoid import issues during transition)
type UserRole =
  | 'system_admin' | 'org_admin' | 'claims_processor' | 'claims_supervisor'
  | 'medical_director' | 'care_manager' | 'member' | 'broker'
  | 'employer_admin' | 'provider' | 'auditor' | 'analyst' | 'support';

type PortalType = 'admin' | 'member' | 'broker' | 'employer' | 'provider';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  portal: PortalType;
  permissions: string[];
  mfaEnabled: boolean;
  avatarUrl?: string;
  department?: string;
  title?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  demoLogin: (portal: PortalType) => void;
  logout: () => void;

  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// API base URL - defaults to empty for demo mode
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Demo users for each portal (used when no backend is available)
const DEMO_USERS: Record<PortalType, AuthUser> = {
  admin: {
    id: 'demo-admin-001',
    email: 'admin@apexhealth.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'org_admin',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'Apex Health Plan',
    portal: 'admin',
    permissions: ['*'], // All permissions in demo mode
    mfaEnabled: false,
    department: 'Administration',
    title: 'Platform Administrator',
  },
  member: {
    id: 'demo-member-001',
    email: 'member@apexhealth.com',
    firstName: 'James',
    lastName: 'Wilson',
    role: 'member',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'Apex Health Plan',
    portal: 'member',
    permissions: ['claims:view', 'eligibility:view', 'documents:view', 'documents:upload'],
    mfaEnabled: false,
  },
  broker: {
    id: 'demo-broker-001',
    email: 'broker@apexhealth.com',
    firstName: 'Michael',
    lastName: 'Torres',
    role: 'broker',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'Apex Health Plan',
    portal: 'broker',
    permissions: ['eligibility:view', 'eligibility:enroll', 'members:view', 'billing:view', 'analytics:view'],
    mfaEnabled: false,
    title: 'Senior Broker',
  },
  employer: {
    id: 'demo-employer-001',
    email: 'employer@apexhealth.com',
    firstName: 'Patricia',
    lastName: 'Morrison',
    role: 'employer_admin',
    organizationId: '00000000-0000-0000-0000-000000000002',
    organizationName: 'TechCorp Industries',
    portal: 'employer',
    permissions: ['eligibility:view', 'eligibility:enroll', 'eligibility:terminate', 'members:view', 'billing:view'],
    mfaEnabled: false,
    title: 'VP of Human Resources',
  },
  provider: {
    id: 'demo-provider-001',
    email: 'provider@apexhealth.com',
    firstName: 'Dr. Emily',
    lastName: 'Park',
    role: 'provider',
    organizationId: '00000000-0000-0000-0000-000000000001',
    organizationName: 'Apex Health Plan',
    portal: 'provider',
    permissions: ['claims:view', 'claims:create', 'eligibility:view', 'eligibility:verify', 'prior-auth:view', 'prior-auth:create'],
    mfaEnabled: false,
    title: 'Internal Medicine',
  },
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!API_BASE);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store tokens in memory only (HIPAA - don't use localStorage)
  const tokensRef = useRef<{ access: string; refresh: string } | null>(null);

  // Attempt to restore session on mount
  useEffect(() => {
    // In demo mode, check sessionStorage for demo user
    if (isDemoMode) {
      const savedPortal = sessionStorage.getItem('apex-demo-portal');
      if (savedPortal && DEMO_USERS[savedPortal as PortalType]) {
        setUser(DEMO_USERS[savedPortal as PortalType]);
      }
    }
  }, [isDemoMode]);

  // Real login against the NestJS API
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!API_BASE) {
        // No backend configured - inform user
        throw new Error('Backend API not configured. Use portal selection for demo mode.');
      }

      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      const { accessToken, refreshToken, user: userData } = data.data;

      tokensRef.current = { access: accessToken, refresh: refreshToken };

      // Determine portal from role
      let portal: PortalType = 'admin';
      if (userData.role === 'member') portal = 'member';
      else if (userData.role === 'broker') portal = 'broker';
      else if (userData.role === 'employer_admin') portal = 'employer';
      else if (userData.role === 'provider') portal = 'provider';

      const authUser: AuthUser = {
        ...userData,
        portal,
        organizationName: userData.organizationName || 'Apex Health',
      };

      setUser(authUser);
      setIsDemoMode(false);

      // Schedule token refresh (5 minutes before expiry)
      scheduleTokenRefresh(3300); // 55 minutes
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Demo mode login (portal switching without backend)
  const demoLogin = useCallback((portal: PortalType) => {
    const demoUser = DEMO_USERS[portal];
    setUser(demoUser);
    setIsDemoMode(true);
    setError(null);
    sessionStorage.setItem('apex-demo-portal', portal);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    tokensRef.current = null;
    setError(null);
    sessionStorage.removeItem('apex-demo-portal');
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
  }, []);

  const scheduleTokenRefresh = useCallback((delaySeconds: number) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(async () => {
      if (!tokensRef.current?.refresh) return;

      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokensRef.current.refresh }),
        });

        if (response.ok) {
          const data = await response.json();
          tokensRef.current = {
            ...tokensRef.current,
            access: data.data.accessToken,
          };
          scheduleTokenRefresh(3300); // Schedule next refresh
        } else {
          logout();
        }
      } catch {
        // Network error - don't logout, just retry later
        scheduleTokenRefresh(30);
      }
    }, delaySeconds * 1000);
  }, [logout]);

  // Permission & Role checking
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true; // Demo admin
    return user.permissions.includes(permission);
  }, [user]);

  const hasAnyPermission = useCallback((...permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);

  const hasRole = useCallback((...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('system_admin', 'org_admin');
  }, [hasRole]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isDemoMode,
    error,
    login,
    demoLogin,
    logout,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to get the access token for API calls
export function getAccessToken(): string | null {
  // Access the singleton ref - in production, use a proper token store
  return null; // Will be wired when apiClient uses AuthContext
}

export default AuthContext;
