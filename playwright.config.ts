import { defineConfig, devices } from '@playwright/test';

// Set PW_CHROMIUM to use a specific Chromium binary (e.g. a preinstalled one).
const executablePath = process.env.PW_CHROMIUM;

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
