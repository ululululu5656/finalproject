import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Staff', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin');
    await page.getByRole('link', { name: 'Staff' }).click();
    await expect(page.getByRole('heading', { name: 'Staff Management' })).toBeVisible();
  });

  test('shows team stat cards', async ({ page }) => {
    await expect(page.getByText('Total Staff')).toBeVisible();
    await expect(page.getByText('Admins')).toBeVisible();
    await expect(page.getByText('Staff Members')).toBeVisible();
  });

  test('add (with role) → search → delete with confirmation', async ({ page }) => {
    const stamp = Date.now();
    const name = `QA Person ${stamp}`;
    const email = `qa${stamp}@cafe.com`;

    // Add with role select.
    await page.getByRole('button', { name: 'Add Staff' }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('#name').fill(name);
    await dialog.locator('#email').fill(email);
    await dialog.locator('#phone').fill('+1 555-9999');
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Admin' }).click();
    await dialog.getByRole('button', { name: 'Add Staff' }).click();
    await expect(page.getByText('Staff member added successfully')).toBeVisible();

    // Search.
    await page.getByPlaceholder('Search staff...').fill(name);
    await expect(page.getByText(name)).toBeVisible();

    // Delete with the confirmation dialog.
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByText('Staff member removed')).toBeVisible();
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
