import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const frontendPort = process.env['E2E_FRONTEND_PORT'] ?? '5100';
const baseURL = process.env['E2E_BASE_URL'] ?? `http://localhost:${frontendPort}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer:
    process.env['E2E_START_APP'] !== 'false'
      ? {
          command: `npm start -- --port ${frontendPort}`,
          cwd: resolve(process.cwd(), '../municipalize-app'),
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        }
      : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
