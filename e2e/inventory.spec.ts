import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin');
    await page.getByRole('link', { name: 'Inventory' }).click();
    await expect(page.getByRole('heading', { name: 'Inventory Management' })).toBeVisible();
  });

  test('search and category filter', async ({ page }) => {
    await page.getByPlaceholder('Search inventory...').fill('Whole Milk');
    await expect(page.getByRole('cell', { name: 'Whole Milk' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Sugar', exact: true })).toHaveCount(0);

    await page.getByPlaceholder('Search inventory...').fill('');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Dairy' }).click();
    await expect(page.getByRole('cell', { name: 'Oat Milk' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Sugar', exact: true })).toHaveCount(0);
  });

  test('add → edit → delete an inventory item', async ({ page }) => {
    const name = `QA Stock ${Date.now()}`;

    // Add
    await page.getByRole('button', { name: 'Add Item' }).first().click();
    let dialog = page.getByRole('dialog');
    await dialog.locator('#name').fill(name);
    await dialog.locator('#quantity').fill('20');
    await dialog.locator('#unit').fill('kg');
    await dialog.locator('#threshold').fill('5');
    await dialog.locator('#category').fill('Testing');
    await dialog.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Inventory item added')).toBeVisible();

    await page.getByPlaceholder('Search inventory...').fill(name);
    const row = page.getByRole('row', { name: new RegExp(name) });
    await expect(row).toBeVisible();

    // Edit (change quantity)
    await row.getByRole('button', { name: 'Edit' }).click();
    dialog = page.getByRole('dialog');
    await dialog.locator('#quantity').fill('99');
    await dialog.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Inventory item updated')).toBeVisible();
    await expect(page.getByText('99 kg')).toBeVisible();

    // Delete
    await page.getByPlaceholder('Search inventory...').fill(name);
    const rowAfter = page.getByRole('row', { name: new RegExp(name) });
    await rowAfter.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Inventory item deleted')).toBeVisible();
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
