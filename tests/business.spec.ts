import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { BusinessPages } from '../pages/business.pages';
import { config } from '../utils/config';

test.describe('📋 核心业务流程巡检（需登录）', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    const loginPage = new LoginPage(page);
    await loginPage.fullLogin(
      config.credentials.username,
      config.credentials.password,
      config.credentials.captcha
    );
  });

  // ---------- 基本课程 ----------
  test('TC-BIZ-001: 基本课程 - 页面可达', async ({ page }) => {
    const bp = new BusinessPages(page);
    await bp.navigateViaNav('基本课程');

    const healthy = await bp.isPageHealthy();
    await page.screenshot({ path: 'test-results/screenshots/basic-courses.png', fullPage: true });
    expect(healthy).toBeTruthy();
  });

  // ---------- 讲座与报告 ----------
  test('TC-BIZ-002: 讲座与报告 - 页面可达', async ({ page }) => {
    const bp = new BusinessPages(page);
    await bp.navigateViaNav('讲座与报告');

    const healthy = await bp.isPageHealthy();
    await page.screenshot({ path: 'test-results/screenshots/lectures.png', fullPage: true });
    expect(healthy).toBeTruthy();
  });

  // ---------- 精品课程 ----------
  test('TC-BIZ-003: 精品课程 - 页面可达', async ({ page }) => {
    const bp = new BusinessPages(page);
    await bp.navigateViaNav('精品课程');

    const healthy = await bp.isPageHealthy();
    await page.screenshot({ path: 'test-results/screenshots/premium-courses.png', fullPage: true });
    expect(healthy).toBeTruthy();
  });

  // ---------- 专题课程 ----------
  test('TC-BIZ-004: 专题课程 - 页面可达', async ({ page }) => {
    const bp = new BusinessPages(page);
    await bp.navigateViaNav('专题课程');

    const healthy = await bp.isPageHealthy();
    await page.screenshot({ path: 'test-results/screenshots/special-courses.png', fullPage: true });
    expect(healthy).toBeTruthy();
  });

  // ---------- 个人中心 ----------
  test('TC-BIZ-005: 个人中心 - 页面可达', async ({ page }) => {
    const bp = new BusinessPages(page);
    await bp.navigateToPersonalCenter();

    const healthy = await bp.isPageHealthy();
    await page.screenshot({ path: 'test-results/screenshots/personal-center.png', fullPage: true });

    // 个人中心可能通过下拉菜单访问，如无法访问记入日志不直接失败
    const url = page.url();
    console.log(`个人中心当前 URL: ${url}`);
    expect(healthy).toBeTruthy();
  });
});
