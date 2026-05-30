import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard', () => {
  test('admin sees full dashboard with stats and charts', async ({ page }) => {
    await login(page, 'admin');
    await expect(page.getByText('Orders Today')).toBeVisible();
    await expect(page.getByText('Revenue Today')).toBeVisible();
    await expect(page.getByText('Avg Order Value')).toBeVisible();
    await expect(page.getByText('Low Stock Items')).toBeVisible();
    await expect(page.getByText('Daily Sales')).toBeVisible();
    await expect(page.getByText('Weekly Revenue')).toBeVisible();
    await expect(page.getByText('Recent Orders')).toBeVisible();
    await expect(page.getByText('Popular Items')).toBeVisible();
    await expect(page.getByText('Low Stock Alerts')).toBeVisible();
  });

  test('staff sees a limited dashboard (no admin-only widgets)', async ({ page }) => {
    await login(page, 'staff');
    await expect(page.getByText('Orders Today')).toBeVisible();
    await expect(page.getByText('Revenue Today')).toBeVisible();
    await expect(page.getByText('Recent Orders')).toBeVisible();
    await expect(page.getByText('Low Stock Items')).toHaveCount(0);
    await expect(page.getByText('Daily Sales')).toHaveCount(0);
    await expect(page.getByText('Low Stock Alerts')).toHaveCount(0);
  });
});
