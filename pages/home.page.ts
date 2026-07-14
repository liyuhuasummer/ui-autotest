import { Page, Locator } from '@playwright/test';

/**
 * 首页 Page Object
 * 平台：中共中央党校（国家行政学院）网上党校
 */
export class HomePage {
  readonly page: Page;

  // 顶部欢迎信息
  readonly welcomeText: Locator;
  readonly headerTop: Locator;

  // 主导航（.nav-wrap 下的链接）
  readonly navWrap: Locator;

  constructor(page: Page) {
    this.page = page;

    // "欢迎您，XXX" 文本
    this.welcomeText = page.locator('text="欢迎您"').first();

    // 顶部区域
    this.headerTop = page.locator('.g-width').first();

    // 导航栏
    this.navWrap = page.locator('.nav-wrap');
  }

  /**
   * 点击导航菜单项（通过文本匹配）
   */
  async clickNavItem(text: string): Promise<void> {
    const navItem = this.navWrap.locator(`span:has-text("${text}")`).first();
    await navItem.waitFor({ state: 'visible', timeout: 10000 });
    await navItem.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /**
   * 检查是否已登录
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const text = await this.headerTop.innerText({ timeout: 5000 });
      return text.includes('欢迎您');
    } catch {
      return false;
    }
  }
}
