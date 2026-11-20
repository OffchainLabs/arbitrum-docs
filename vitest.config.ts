import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Vitest runs only the analytics consent suites in `lib/`, which need jsdom, fake timers and the
 * real PostHog SDK. Every other suite runs on `node --test` (see `pnpm test`).
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
    // Overrides any real values exported in the shell (CI, a local .env), so code reading them
    // never targets the production PostHog project.
    env: {
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_vitest',
      NEXT_PUBLIC_VERCEL_ENV: 'production',
    },
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        // Load the real PostHog SDK through Vite so vi.resetModules() gives each test a fresh
        // singleton (see lib/posthog-consent.sdk.test.ts).
        inline: ['posthog-js'],
      },
    },
  },
});
