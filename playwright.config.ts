import { defineConfig, devices } from '@playwright/test';
import { config } from './utils/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1, // 拨测场景建议单线程，避免并发登录冲突
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/report.json' }],
    ['list'],
  ],
  timeout: 60000, // 单用例 60 秒超时
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: config.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    },
  ],
  outputDir: 'test-results/artifacts',
});
