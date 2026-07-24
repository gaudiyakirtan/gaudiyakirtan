import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against a PRODUCTION build (`next build && next start`), not `next dev`:
// dev compiles routes on demand, which makes the 404 URL-rescue redirect race the assertion. The
// production server has every page prebuilt and the search JSON served statically, so the flows are
// deterministic. `reuseExistingServer` lets you point at an already-running `pnpm start` locally.
export default defineConfig({
  testDir: './e2e',
  // Serial: a small suite against a cold production server, where parallel workers just contend on
  // the same first-load and hydration. Determinism beats the few seconds parallelism would save.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
})
