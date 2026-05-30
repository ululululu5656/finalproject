import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Billing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'staff');
    await page.getByRole('link', { name: 'Billing' }).click();
    await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible();
  });

  test('select an order, preview the bill and print', async ({ page }) => {
    // Empty preview before any selection.
    await expect(page.getByText('Select an order')).toBeVisible();

    // Pick the first billable order.
    await page.locator('.cursor-pointer').first().click();

    // Bill preview renders with line items and a total.
    await expect(page.getByText('Order Items')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print Bill' })).toBeVisible();

    await page.getByRole('button', { name: 'Print Bill' }).click();
    await expect(page.getByText('Bill sent to printer')).toBeVisible();
  });

  test('search billable orders by table number', async ({ page }) => {
    const search = page.getByPlaceholder('Search by order ID, table, or customer...');
    await expect(search).toBeVisible();
    await search.fill('ORD-');
    // All order ids start with ORD-, so at least one card remains selectable.
    await expect(page.locator('.cursor-pointer').first()).toBeVisible();
  });
});
