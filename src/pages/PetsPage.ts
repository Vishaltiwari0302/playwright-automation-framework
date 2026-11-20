import { expect, Locator } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import { Pet } from '../models/pet';
import log from '../utils/logger';

/**
 * PetsPage — Page Object for the main pet-browser area of the app.
 */
export class PetsPage extends BasePage {
  /* ------------------------------------------------------------- locators */
  private readonly newPetBtn = this.byRole('button', /new pet|create|add/i);
  private readonly petRows = this.by('[data-testid="pet-row"]');
  private readonly searchBox = this.by('#pet-search');
  private readonly statusFilter = this.by('#status-filter');
  private readonly toast = this.by('[data-testid="toast"], .toast');

  /* -------------------------------------------------------------- getters */
  rowFor(name: string): Locator {
    return this.petRows.filter({ hasText: name });
  }

  /* -------------------------------------------------------------- actions */
  async open(): Promise<void> {
    await this.gotoAndWait('/pets', this.byRole('heading', /pets|catalog/i).or(this.newPetBtn));
  }

  async search(name: string): Promise<void> {
    await this.searchBox.fill(name);
  }

  async filterByStatus(status: Pet['status']): Promise<void> {
    await this.statusFilter.selectOption(status);
  }

  async createViaUi(name: string, status: Pet['status']): Promise<void> {
    await this.newPetBtn.click();
    await this.by('#pet-name').fill(name);
    await this.by('#pet-status').selectOption(status);
    await this.byRole('button', /save|create|submit/i).click();
    // Confirm via toast or the row appearing in the list.
    const rowVisible = await this.isVisible(this.rowFor(name), 10_000);
    if (!rowVisible) log.warn('PetsPage.createViaUi: row for', name, 'not found after create');
  }

  async deleteViaUi(name: string): Promise<void> {
    const row = this.rowFor(name);
    await row.scrollIntoViewIfNeeded();
    await row.getByRole('button', { name: /delete|remove|trash/i }).click();
    await this.byRoleOpts('button', { name: /confirm|yes/i }).click();
  }

  /* ------------------------------------------------------------ asserts   */
  async expectPetVisible(name: string): Promise<void> {
    expect(
      await this.rowFor(name).first().isVisible(),
      `expected to see pet "${name}"`
    ).toBe(true);
  }

  async expectPetAbsent(name: string): Promise<void> {
    expect(
      await this.isVisible(this.rowFor(name), 3_000),
      `did NOT expect to see pet "${name}"`
    ).toBe(false);
  }
}
