import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  retries: 0,
  use: {
    baseURL: process.env.APP_URL ?? 'http://127.0.0.1:4173',
    trace: 'off',
    screenshot: 'off',
    ...devices['Desktop Chrome'],
  },
})
