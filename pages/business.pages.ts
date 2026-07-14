import { Page, Locator } from '@playwright/test';

/**
 * 核心业务页面 Page Object
 * 涵盖：基本课程、讲座与报告、精品课程、专题课程、个人中心
 */
export class BusinessPages {
  readonly page: Page;

  readonly navWrap: Locator;
  readonly contentArea: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navWrap = page.locator('.nav-wrap');
    this.contentArea = page.locator('.main-content, main, [class*="main"], [class*="content"]').first();
  }

  /**
   * 通过导航点击跳转到目标页面
   */
  async navigateViaNav(sectionName: string): Promise<void> {
    const navItem = this.navWrap.locator(`span:has-text("${sectionName}")`).first();
    await navItem.waitFor({ state: 'visible', timeout: 10000 });
    await navItem.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /**
   * 通过点击"欢迎您"区域下拉菜单，进入"个人中心"
   * 已知: 点击"欢迎您"→ 下拉出现"个人中心"和"退出"
   */
  async navigateToPersonalCenter(): Promise<void> {
    // 方式 1: 点击"欢迎您"区域 → 下拉菜单 → 点"个人中心"
    try {
      // 使用 evaluate 点击包含"欢迎您"的叶子元素来触发 Ant Design Dropdown
      await this.page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const el = node as HTMLElement;
          if (el.children.length === 0 && el.textContent?.includes('欢迎您')) {
            (el as HTMLElement).click();
            return;
          }
        }
      });
      await this.page.waitForTimeout(1500);

      // 查找下拉菜单中的"个人中心"
      const pcItem = this.page.locator('.ant-dropdown-menu-item').filter({ hasText: '个人中心' }).first();
      if (await pcItem.isVisible({ timeout: 3000 }).catch(() => false)) {
        await pcItem.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1500);
        return;
      }
    } catch {
      // fall through to direct URL
    }

    // 方式 2: 直接通过 URL 跳转（/my 是个人中心路径）
    await this.page.goto('https://dev-ccps.metasmartedu.cn/my', {
      waitUntil: 'networkidle',
      timeout: 15000,
    });
    await this.page.waitForTimeout(2000);
  }

  /**
   * 检查页面是否正常加载（非错误页、非白屏）
   */
  async isPageHealthy(): Promise<boolean> {
    // 检查 URL 没有跳转到错误页
    const url = this.page.url();
    if (url.includes('/404') || url.includes('/error') || url.includes('/login')) {
      return false;
    }

    // 检查 body 有实际文本内容
    const bodyText = await this.page.locator('body').innerText().catch(() => '');
    if ((bodyText?.trim().length ?? 0) < 20) {
      return false;
    }

    // 排除明显的错误关键字
    if (/(404|500|not found|error|错误|找不到|服务异常)/i.test(bodyText || '')) {
      // 但不能仅因为有"错误"就失败——页面内容可能包含"错误"一词
      // 只检查前200字符（标题区域）
      const first200 = (bodyText || '').substring(0, 200);
      if (/(404|500|not found|服务异常)/i.test(first200)) {
        return false;
      }
    }

    return true;
  }
}
