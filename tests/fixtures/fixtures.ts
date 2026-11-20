import { test as base } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { PetsPage } from '../../src/pages/PetsPage';
import { Api } from '../../src/api/Api';
import { buildClient } from '../../src/core/ApiClient';

/**
 * Custom Playwright fixtures.
 *
 * Injecting Page Objects & the API facade as fixtures keeps individual tests
 * short and consistent. This is also where you'd add per-test setup /
 * teardown (e.g. seeding data, logging, capturing traces).
 */
type Fixtures = {
  loginPage: LoginPage;
  petsPage: PetsPage;
  api: Api;
  // Optional: a pre-authenticated page (login performed once per test file)
};

export const test = base.extend<Fixtures>({
  /* --- Page Objects --- */
  loginPage: async ({ page }, use) => {
    const p = new LoginPage(page);
    await use(p);
  },
  petsPage: async ({ page }, use) => {
    const p = new PetsPage(page);
    await use(p);
  },

  /* --- API facade (uses the same cookie jar as the browser session) --- */
  api: async ({ request }, use) => {
    const api = new Api(buildClient(request));
    await use(api);
  },
});

export { expect } from '@playwright/test';
