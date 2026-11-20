import { BasePage } from '../core/BasePage';
import log from '../utils/logger';
import { config } from '../config';

/**
 * LoginPage — Page Object for the application's login screen.
 *
 * NOTE: Locators below follow the app-under-test's structure. If you point
 * this framework at a different app, only the CSS/role locators in this file
 * (and the sibling POMs) need to change — the tests themselves stay intact.
 */
export class LoginPage extends BasePage {
  /* ------------------------------------------------------------- locators */
  private readonly usernameInput = this.by('#username');
  private readonly passwordInput = this.by('#password');
  private readonly submitBtn = this.byRole('button', /sign ?in|log ?in/i);
  private readonly errorBanner = this.by('[data-testid="login-error"], .login-error');

  /* -------------------------------------------------------------- actions */
  async open(): Promise<void> {
    await this.goto('/auth/login');
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(username: string = config.auth.username, password: string = config.auth.password): Promise<void> {
    await Promise.all([
      this.usernameInput.fill(username),
      this.passwordInput.fill(password),
    ]);
    await this.submitBtn.click();
    // Login flow should surface either the app shell or an error badge.
    const appIsReady = await this.isVisible(
      this.by('[data-testid="app-shell"], .user-greeting, header nav'),
      10_000
    );
    if (!appIsReady) {
      const msg = await this.isVisible(this.errorBanner, 1_000)
        ? (await this.errorBanner.innerText()).trim()
        : 'no app shell & no visible error banner';
      log.warn('LoginPage.login: expected post-login shell, got', msg);
    }
  }

  async submitInvalid(username: string, password: string): Promise<string | null> {
    await Promise.all([
      this.usernameInput.fill(username),
      this.passwordInput.fill(password),
    ]);
    await this.submitBtn.click();
    if (await this.isVisible(this.errorBanner, 5_000)) {
      return (await this.errorBanner.innerText()).trim();
    }
    return null;
  }

  /* ------------------------------------------------------------- getters  */
  async getError(): Promise<string | null> {
    return (await this.isVisible(this.errorBanner, 1_000))
      ? (await this.errorBanner.innerText()).trim()
      : null;
  }

  async isAppVisible(): Promise<boolean> {
    return this.isVisible(this.by('[data-testid="app-shell"], .user-greeting, header nav'), 10_000);
  }
}
