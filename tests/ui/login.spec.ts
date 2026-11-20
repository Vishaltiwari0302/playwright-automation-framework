import { test, expect } from '../fixtures/fixtures';
import { config } from '../../src/config';
import { testLabel } from '../../src/utils/helpers';

/**
 * UI flow: Login → browse pets → create via UI → verify → cleanup.
 */
test.describe('Petstore · UI · E2E flow', () => {
  test.use({ baseURL: config.base });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('can sign in with valid credentials', async ({ loginPage, page }) => {
    await loginPage.login();
    expect(await loginPage.isAppVisible()).toBe(true);
  });

  test('surfaces an error banner on invalid credentials', async ({ loginPage }) => {
    await loginPage.login('who-does-not-exist', 'password123');
    const err = await loginPage.getError();
    expect(err).not.toBeNull();
    expect(err!.toLowerCase()).toMatch(/invalid|incorrect|fail|error|400|401|403/);
  });

  test('can create and delete a pet from the UI', async ({ page, loginPage, petsPage }) => {
    await loginPage.login();
    await petsPage.open();

    const petName = testLabel('pet-at');
    await petsPage.createViaUi(petName, 'available');
    await petsPage.expectPetVisible(petName);

    // Clean up so repeated runs do not accumulate test data
    await test.step('delete via UI', async () => {
      await petsPage.deleteViaUi(petName);
      await petsPage.expectPetAbsent(petName);
    });
  });
});
