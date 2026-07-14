import { Page, Locator } from '@playwright/test';

/**
 * 登录页 Page Object（Ant Design Modal 弹窗形式）
 * 平台：中共中央党校（国家行政学院）网上党校
 */
export class LoginPage {
  readonly page: Page;

  // 首页的"登录"入口
  readonly loginEntry: Locator;

  // 登录弹窗内的元素
  readonly pwdLoginTab: Locator;        // "密码登录"选项卡
  readonly phoneInput: Locator;         // 手机号/学号输入框
  readonly passwordInput: Locator;      // 密码输入框
  readonly captchaInput: Locator;       // 图片验证码输入框
  readonly submitButton: Locator;       // 登录按钮

  constructor(page: Page) {
    this.page = page;

    // 首页顶部"登录"文字入口
    this.loginEntry = page.locator('.g-width:has-text("登录")').locator('text="登录"').first();

    // 弹窗内"密码登录"选项卡
    this.pwdLoginTab = page.locator('.ant-modal:has-text("密码登录")').locator('text="密码登录"').first();

    // 表单字段（Ant Design Form.Item 的 id）
    this.phoneInput = page.locator('#normal_login_phone');
    this.passwordInput = page.locator('#normal_login_pwd');
    this.captchaInput = page.locator('#normal_login_vcode');

    // 提交按钮
    this.submitButton = page.locator('button[type="submit"]').filter({ hasText: '登 录' }).first();
  }

  /**
   * 完整登录流程
   * 1. 打开首页
   * 2. 点击"登录"入口 → 弹出登录弹窗
   * 3. 切换到"密码登录"
   * 4. 填写表单并提交
   */
  async fullLogin(username: string, password: string, captcha: string): Promise<void> {
    // 步骤 1: 打开首页
    await this.page.goto('https://dev-ccps.metasmartedu.cn/', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await this.page.waitForTimeout(2000);

    // 步骤 2: 点击"登录"入口
    await this.loginEntry.waitFor({ state: 'visible', timeout: 10000 });
    await this.loginEntry.click();
    await this.page.waitForTimeout(2000);

    // 步骤 3: 切换到"密码登录"
    await this.pwdLoginTab.waitFor({ state: 'visible', timeout: 10000 });
    await this.pwdLoginTab.click();
    await this.page.waitForTimeout(1000);

    // 步骤 4: 填写表单
    await this.phoneInput.fill(username);
    await this.passwordInput.fill(password);
    await this.captchaInput.fill(captcha);

    // 步骤 5: 提交
    await this.submitButton.click();
    await this.page.waitForTimeout(4000);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 验证登录弹窗是否已关闭（登录成功）
   */
  async isLoginModalClosed(): Promise<boolean> {
    const modal = this.page.locator('.ant-modal:has-text("密码登录")');
    const count = await modal.count();
    return count === 0;
  }
}
