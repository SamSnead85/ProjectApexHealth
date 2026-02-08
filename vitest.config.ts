/// <reference types="vitest" />
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Apex Health Platform - Vitest Configuration
 * ═══════════════════════════════════════════════════════════════════════════════
 * Configuration for frontend React component and utility testing.
 *
 * Features:
 *   - jsdom environment for React component testing
 *   - React Testing Library auto-cleanup
 *   - Path aliases matching vite.config.ts
 *   - Coverage reporting with v8 provider
 *   - Excludes backend (apps/) and infrastructure (k8s/, infra/) from tests
 *
 * Run:
 *   npx vitest          # watch mode
 *   npx vitest run      # single run (CI)
 *   npx vitest --ui     # browser UI
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    // ─── Environment ──────────────────────────────────────────────────────
    // jsdom simulates a browser DOM for React component testing
    environment: 'jsdom',

    // ─── Global Setup ─────────────────────────────────────────────────────
    // Auto-import common test utilities (describe, it, expect, vi)
    globals: true,

    // ─── Setup Files ──────────────────────────────────────────────────────
    // Run before each test file - ideal for React Testing Library cleanup
    // Uncomment when you create the setup file:
    // setupFiles: ['./src/test/setup.ts'],

    // ─── File Patterns ────────────────────────────────────────────────────
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
    ],

    // Exclude backend, infrastructure, and build output
    exclude: [
      'node_modules',
      'dist',
      'apps/**',
      'packages/**',
      'k8s/**',
      'infrastructure/**',
    ],

    // ─── Coverage ─────────────────────────────────────────────────────────
    coverage: {
      // v8 is faster than istanbul and built into Node.js
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',

      // Only measure coverage for frontend source files
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/index.ts',         // barrel exports
        'src/main.tsx',            // entry point
        'src/vite-env.d.ts',
      ],

      // Thresholds - increase these as test coverage improves
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },

    // ─── Performance ──────────────────────────────────────────────────────
    // Run tests in the same thread for faster execution on CI
    pool: 'forks',

    // ─── Reporters ────────────────────────────────────────────────────────
    reporters: ['default'],

    // ─── CSS Handling ─────────────────────────────────────────────────────
    css: {
      // Don't process CSS modules during testing (faster)
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
