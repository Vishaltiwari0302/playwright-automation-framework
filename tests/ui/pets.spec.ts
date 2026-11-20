import { test, expect } from '../fixtures/fixtures';
import { config } from '../../src/config';
import { testLabel } from '../../src/utils/helpers';

/**
 * UI + API hybrid: create a pet through the REST API, then assert it is
 * visible in the browser. This is the canonical "API setup / UI assert"
 * pattern — much faster and more stable than doing both through UI.
 */
test.describe('Petstore · UI+API hybrid', () => {
  test.use({ baseURL: config.base });

  test('API create → UI sees the pet', async ({ request, loginPage, petsPage }) => {
    await loginPage.open();
    await loginPage.login();
    await petsPage.open();

    const name = testLabel('hybrid-pet');

    // API call
    const res = await request.post(`${config.apiBase}/pet`, {
      data: { name, status: 'available', photoUrls: [] },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.status(), `create pet: ${await res.text()}`).toBe(200);

    // UI assertion
    await test.step('verify via UI', async () => {
      await petsPage.search(name);
      await petsPage.expectPetVisible(name);
    });
  });
});
