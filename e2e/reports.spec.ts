import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Reports & analytics', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin');
    await page.getByRole('link', { name: 'Reports' }).click();
    await expect(page.getByRole('heading', { name: 'Reports & Analytics' })).toBeVisible();
  });

  test('summary cards reflect order data', async ({ page }) => {
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Total Orders')).toBeVisible();
    await expect(page.getByText('Avg Order Value')).toBeVisible();
    await expect(page.getByText('Orders Today')).toBeVisible();
  });

  test('switches between analytics tabs', async ({ page }) => {
    await page.getByRole('tab', { name: 'Overview' }).click();
    await expect(page.getByText('Revenue Trend')).toBeVisible();
    await expect(page.getByText('Revenue by Category')).toBeVisible();

    await page.getByRole('tab', { name: 'Sales' }).click();
    await expect(page.getByText('Daily Sales Report')).toBeVisible();

    await page.getByRole('tab', { name: 'Top Items' }).click();
    await expect(page.getByText('Top Selling Items')).toBeVisible();
  });

  test('change the date range and trigger export', async ({ page }) => {
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Last 30 Days' }).click();
    const exportBtn = page.getByRole('button', { name: 'Export' });
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();
  });
});
