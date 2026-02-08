import { defineConfig, devices } from '@playwright/test'

const isWindows = process.platform === 'win32'
const npmRunner = isWindows ? '"C:/Program Files/nodejs/npm.cmd"' : 'npm'

export default defineConfig({
  testDir: './e2e',
  // Next dev server route compilation is flaky under parallel cold starts.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: `${npmRunner} run dev`,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'playwright-local-secret',
      NEXTAUTH_DEBUG: 'false',
      NEXT_PUBLIC_SESSION_DURATION_SECONDS: '15',
    },
  },
})
