import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env (optional) before reading process.env.
dotenv.config({ path: path.resolve(__dirname, '.env') });

const browsers = (process.env.BROWSERS ?? 'chromium')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const projects: any[] = [];
if (browsers.includes('chromium')) {
  projects.push({
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    testDir: './tests',
  });
}
if (browsers.includes('firefox')) {
  projects.push({
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
    testDir: './tests',
  });
}
if (browsers.includes('webkit')) {
  projects.push({
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
    testDir: './tests',
  });
}

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  // Fully-parallel by default; set `workers: 1` for UI suites when the app
  // does not tolerate concurrent sessions.
  fullyParallel: true,
  // Per-test timeouts
  timeout: 60 * 1000,
  expect: { timeout: 10 * 1000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  use: {
    // Base URL for relative `page.goto('/login')` calls
    baseURL: process.env.BASE_URL || 'https://petstore.swagger.io',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects,

  // Optional: local Web server / API mocks (uncomment and adjust)
  // webServer: {
  //   command: 'npm run serve:mock',
  //   url: 'http://localhost:4200',
  //   reuseExistingServer: !process.env.CI,
  // },
});
