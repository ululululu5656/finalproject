import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to the login page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill('admin@cafe.com');
    await page.locator('#password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('admin signs in and sees every section', async ({ page }) => {
    await login(page, 'admin');
    for (const section of ['Menu', 'Orders', 'Billing', 'Inventory', 'Reports', 'Staff']) {
      await expect(page.getByRole('link', { name: section })).toBeVisible();
    }
  });

  test('staff sign-in hides admin sections and guards admin routes', async ({ page }) => {
    await login(page, 'staff');
    await expect(page.getByRole('link', { name: 'Menu' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Staff' })).toHaveCount(0);

    // Directly visiting an admin-only route bounces back to the dashboard.
    await page.goto('/staff');
    await page.waitForURL('**/dashboard');
  });

  test('user can log out', async ({ page }) => {
    await login(page, 'admin');
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await page.waitForURL('**/login');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
