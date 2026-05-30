import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Menu management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin');
    await page.getByRole('link', { name: 'Menu' }).click();
    await expect(page.getByRole('heading', { name: 'Menu Management' })).toBeVisible();
  });

  test('search filters the menu', async ({ page }) => {
    await page.getByPlaceholder('Search menu items...').fill('Cappuccino');
    await expect(page.getByRole('cell', { name: 'Cappuccino', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Green Tea', exact: true })).toHaveCount(0);
  });

  test('category filter narrows the menu', async ({ page }) => {
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Tea' }).click();
    await expect(page.getByRole('cell', { name: 'Green Tea', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Espresso', exact: true })).toHaveCount(0);
  });

  test('toggles between table and card views', async ({ page }) => {
    // Table view does not render Available/Unavailable badges.
    await expect(page.getByText('Unavailable')).toHaveCount(0);
    await page.getByRole('button', { name: 'Card view' }).click();
    await expect(page.getByText('Unavailable').first()).toBeVisible();
    await page.getByRole('button', { name: 'Table view' }).click();
    await expect(page.getByText('Unavailable')).toHaveCount(0);
  });

  test('add → toggle availability → edit → delete a menu item', async ({ page }) => {
    const name = `QA Brew ${Date.now()}`;

    // --- Add (with category select, description, availability) ---
    await page.getByRole('button', { name: 'Add Item' }).first().click();
    let dialog = page.getByRole('dialog');
    await dialog.locator('#name').fill(name);
    await dialog.locator('#price').fill('4.20');
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Desserts' }).click();
    await dialog.locator('#description').fill('QA tasting notes');
    await dialog.getByRole('button', { name: 'Add Item' }).click();
    await expect(page.getByText('Menu item added successfully')).toBeVisible();

    // Locate it via search.
    await page.getByPlaceholder('Search menu items...').fill(name);
    const row = page.getByRole('row', { name: new RegExp(name) });
    await expect(row).toBeVisible();

    // --- Toggle availability ---
    await row.getByRole('switch').click();
    await expect(page.getByText(/is now (unavailable|available)/)).toBeVisible();

    // --- Edit (change price) ---
    await row.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    dialog = page.getByRole('dialog');
    await dialog.locator('#price').fill('9.99');
    await dialog.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Menu item updated successfully')).toBeVisible();
    await expect(page.getByRole('cell', { name: '$9.99' })).toBeVisible();

    // --- Delete ---
    await page.getByPlaceholder('Search menu items...').fill(name);
    const rowAfter = page.getByRole('row', { name: new RegExp(name) });
    await rowAfter.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.getByText('Menu item deleted')).toBeVisible();
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
