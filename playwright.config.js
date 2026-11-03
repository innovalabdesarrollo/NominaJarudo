import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5288';

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      }
    }
  ],
  webServer: [
    {
      command: 'pnpm --filter @nomina-jarudo/api start',
      url: 'http://127.0.0.1:3088/api/health',
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command:
        'pnpm --filter @nomina-jarudo/web build && pnpm --filter @nomina-jarudo/web exec vite preview --host 127.0.0.1 --port 5288 --strictPort',
      url: 'http://127.0.0.1:5288',
      reuseExistingServer: true,
      timeout: 180_000
    }
  ]
});
