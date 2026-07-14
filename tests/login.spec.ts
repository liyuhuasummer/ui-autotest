import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { config } from '../utils/config';

test.describe('🔐 登录流程拨测', () => {
  test('TC-LOGIN-001: 登录页面可达性', async ({ page }) => {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 首页标题
    const title = await page.title();
    expect(title).toBeTruthy();

    // 点击登录入口
    const loginPage = new LoginPage(page);
    await loginPage.loginEntry.click();
    await page.waitForTimeout(2000);

    // 验证弹窗出现（检查是否有验证码登录/密码登录选项卡）
    const pwdTab = page.locator('text="密码登录"').first();
    await expect(pwdTab).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: 'test-results/screenshots/login-modal.png', fullPage: true });
  });

  test('TC-LOGIN-002: 正常登录流程（密码登录）', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fullLogin(
      config.credentials.username,
      config.credentials.password,
      config.credentials.captcha
    );

    // 验证弹窗关闭（登录成功的关键标志）
    const modalClosed = await loginPage.isLoginModalClosed();
    await page.screenshot({ path: 'test-results/screenshots/after-login.png', fullPage: true });

    expect(modalClosed).toBeTruthy();
  });

  test('TC-LOGIN-003: 登录后页面正常显示', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fullLogin(
      config.credentials.username,
      config.credentials.password,
      config.credentials.captcha
    );

    // 检查页面标题
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // 检查导航栏存在
    const navWrap = page.locator('.nav-wrap');
    await expect(navWrap).toBeVisible({ timeout: 5000 });

    // 检查欢迎信息
    const headerText = await page.locator('.g-width').first().innerText();
    expect(headerText).toContain('欢迎您');
  });
});
