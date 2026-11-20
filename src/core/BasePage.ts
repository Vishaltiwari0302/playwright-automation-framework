import { Page, Locator } from '@playwright/test';
import { config } from '../config';

/**
 * BasePage — shared primitives for every page object.
 *
 * Subclasses should:
 *  1. Pass `page` to `super(page)`.
 *  2. Declare `private` Locators (locators are lazy & re-queried).
 *  3. Implement typed action methods (login(), submit(), ...).
 *
 * This class also owns the page object's "shared" helpers (visible,
 * waitReady, safe click, etc.) so individual POMs stay thin.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly base: string;

  constructor(page: Page) {
    this.page = page;
    this.base = config.base;
  }

  /* ----------------------------------------------------------- navigation */
  protected async goto(path = '/'): Promise<void> {
    const url = path.startsWith('http')
      ? path
      : new URL(path, this.base).toString();
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /* -------------------------------------------------------------- elements */
  protected by(css: string): Locator {
    return this.page.locator(css);
  }

  protected byRole(role: string, name: string | RegExp): Locator {
    return this.page.getByRole(role as any, { name });
  }

  protected byRoleOpts(role: string, opts: Record<string, unknown>): Locator {
    return this.page.getByRole(role as any, opts);
  }

  /* ------------------------------------------------------------ assertions */
  async isVisible(locator: Locator, timeoutMs = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  async isTextVisible(locator: Locator, text: string): Promise<boolean> {
    const expected = locator.filter({ hasText: text });
    return this.isVisible(expected);
  }

  /* -------------------------------------------------------------- actions */
  protected async safeClick(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
  }

  protected async typeText(locator: Locator, value: string): Promise<void> {
    await locator.click();
    await locator.fill(value);
  }

  /** Navigate to a path and wait for a sentinel to be visible. */
  async gotoAndWait(path: string, sentinel: Locator): Promise<void> {
    await this.goto(path);
    await sentinel.waitFor({ state: 'visible' });
  }
}
