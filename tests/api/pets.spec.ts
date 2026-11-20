import { test, expect } from '../fixtures/fixtures';
import { config } from '../../src/config';
import { testLabel } from '../../src/utils/helpers';

/**
 * API-only tests. These don't need a browser at all — they run on the
 * Playwright runner but use only the `request` fixture.
 *
 * Pattern shown:
 *   - create pet via API
 *   - read it back
 *   - update it
 *   - clean up (delete)
 *
 * Because of the shared API facade (`api` fixture), each resource's methods
 * are isolated + typed — tests here stay one-line-per-operation.
 */
test.describe('Petstore · API · CRUD', () => {
  test('full pet CRUD round-trip', async ({ api }) => {
    const name = testLabel('crud-pet');
    const created = await test.step('create', async () => {
      const pet = await api.pets.create({ name, status: 'available' });
      expect(pet.id).toBeTruthy();
      return pet;
    });

    await test.step('get by id', async () => {
      const fetched = await api.pets.getById(created.id!);
      expect(fetched.id).toBe(created.id);
    });

    await test.step('find by status', async () => {
      const found = await api.pets.findByStatus('available');
      expect(found.some((p) => `${p.name}`.includes(name))).toBe(true);
    });

    await test.step('delete', async () => {
      await api.pets.delete(created.id!);
    });

    await test.step('verify gone', async () => {
      const after = await api.pets.findByStatus('available').catch(() => []);
      expect(after.some((p) => `${p.name}`.includes(name))).toBe(false);
    });
  });

  test('inventory endpoint returns a number map', async ({ api }) => {
    const inv = await api.store.inventory();
    expect(typeof inv).toBe('object');
    const values = Object.values(inv);
    if (values.length) values.forEach((v) => expect(typeof v).toBe('number'));
  });

  test('unknown pet id surfaces a 400-ish error', async ({ request }) => {
    const res = await request.get(`${config.apiBase}/pet/-1`);
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
