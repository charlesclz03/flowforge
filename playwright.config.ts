import { defineConfig, devices } from '@playwright/test'

const isWindows = process.platform === 'win32'
const npmRunner = isWindows ? '"C:/Program Files/nodejs/npm.cmd"' : 'npm'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
  webServer: {
    command: `${npmRunner} run dev`,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
