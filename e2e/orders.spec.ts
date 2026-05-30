import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'staff');
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page.getByRole('heading', { name: 'Order Management' })).toBeVisible();
  });

  test('menu category filter in the order builder', async ({ page }) => {
    await page.getByRole('button', { name: 'Coffee' }).click();
    await expect(page.getByText('Espresso', { exact: true })).toBeVisible();
    await expect(page.getByText('Green Tea', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'All Items' }).click();
    await expect(page.getByText('Green Tea', { exact: true })).toBeVisible();
  });

  test('cart: add, increase, decrease, remove and clear', async ({ page }) => {
    await page.getByText('Espresso', { exact: true }).first().click();
    await expect(page.getByText('Added Espresso to order')).toBeVisible();
    await expect(page.getByText('$3.50 each')).toBeVisible();

    const qty = page.getByRole('button', { name: 'Increase quantity' }).locator('xpath=preceding-sibling::span');

    await page.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(qty).toHaveText('2');
    await page.getByRole('button', { name: 'Decrease quantity' }).click();
    await expect(qty).toHaveText('1');

    await page.getByRole('button', { name: 'Remove item' }).click();
    await expect(page.getByText('No items in order')).toBeVisible();

    // Add two items then clear the whole cart.
    await page.getByText('Latte', { exact: true }).first().click();
    await page.getByText('Croissant', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText('No items in order')).toBeVisible();
  });

  test('submit a new order', async ({ page }) => {
    await page.getByText('Cappuccino', { exact: true }).first().click();
    await page.locator('#tableNumber').fill('7');
    await page.locator('#customerName').fill('QA Guest');
    await page.getByRole('button', { name: 'Submit Order' }).click();
    await expect(page.getByText('Order submitted successfully!')).toBeVisible();
    await expect(page.getByText('No items in order')).toBeVisible();

    await page.getByRole('tab', { name: /Pending/ }).click();
    await expect(page.getByText('Table 7').first()).toBeVisible();
  });

  test('view order details and advance status through the pipeline', async ({ page }) => {
    await page.getByRole('tab', { name: /Pending/ }).click();

    // Detail dialog.
    await page.getByRole('button', { name: 'View' }).first().click();
    await expect(page.getByRole('dialog').getByText('Order Items')).toBeVisible();
    await page.keyboard.press('Escape');

    // Pending → Preparing.
    await page.getByRole('button', { name: 'Start Preparing' }).first().click();
    await expect(page.getByText('Order status updated to preparing')).toBeVisible();

    // Preparing → Completed.
    await page.getByRole('tab', { name: /Preparing/ }).click();
    await page.getByRole('button', { name: 'Mark Complete' }).first().click();
    await expect(page.getByText('Order status updated to completed')).toBeVisible();
  });
});
