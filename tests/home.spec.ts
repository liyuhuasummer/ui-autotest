import { test, expect } from '@playwright/test';
import { config } from '../utils/config';

test.describe('🏠 首页拨测（未登录）', () => {
  test('TC-HOME-001: 首页可达性及状态码', async ({ page }) => {
    const response = await page.goto(config.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);
    await page.screenshot({ path: 'test-results/screenshots/home-page.png', fullPage: true });
  });

  test('TC-HOME-002: 首页标题正确', async ({ page }) => {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const title = await page.title();
    expect(title).toBe('网上党校 - 首页');
  });

  test('TC-HOME-003: 首页导航栏正常显示', async ({ page }) => {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const navWrap = page.locator('.nav-wrap');
    await expect(navWrap).toBeVisible({ timeout: 5000 });

    // 验证关键导航项存在
    const navText = await navWrap.innerText();
    expect(navText).toContain('首页');
    expect(navText).toContain('基本课程');
    expect(navText).toContain('精品课程');
    expect(navText).toContain('专题课程');
  });

  test('TC-HOME-004: 首页内容非白屏', async ({ page }) => {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText?.trim().length ?? 0).toBeGreaterThan(100);
  });

  test('TC-HOME-005: 首页无 JS console 错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(config.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 过滤第三方库常见噪音
    const realErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Script error')
    );
    expect(realErrors).toEqual([]);
  });
});
