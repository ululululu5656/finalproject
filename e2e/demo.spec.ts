import { test, expect } from '@playwright/test';
import { ACCOUNTS } from './helpers';

/**
 * Exhaustive, human-paced walkthrough of CafeFlow — exercises every feature in
 * every module and is recorded as one continuous video under the demo test's
 * test-results folder, then converted to MP4 at docs/demo-walkthrough.mp4.
 */
test('full app demo — every feature, end to end', async ({ page }) => {
  test.setTimeout(240_000);
  const pause = (ms = 800) => page.waitForTimeout(ms);
  const stamp = Date.now();

  /* ---------------------------------------------------------------- */
  /* 1. Login — invalid attempt, then click-to-fill admin             */
  /* ---------------------------------------------------------------- */
  await page.goto('/login');
  await pause();
  await page.locator('#email').fill('admin@cafe.com');
  await page.locator('#password').fill('nope');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Invalid email or password')).toBeVisible();
  await pause(1200);

  await page.getByRole('button', { name: /admin@cafe\.com/ }).click(); // fill demo creds
  await pause(500);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await pause(1800);

  /* ---------------------------------------------------------------- */
  /* 2. Menu — search, filter, views, add, toggle, edit, delete       */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Menu' }).click();
  await expect(page.getByRole('heading', { name: 'Menu Management' })).toBeVisible();
  await pause();

  await page.getByPlaceholder('Search menu items...').fill('Latte');
  await pause(1000);
  await page.getByPlaceholder('Search menu items...').fill('');

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Coffee' }).click();
  await pause(1000);
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'All Categories' }).click();

  await page.getByRole('button', { name: 'Card view' }).click();
  await pause(1200);
  await page.getByRole('button', { name: 'Table view' }).click();
  await pause(600);

  const menuName = `Demo Latte ${stamp}`;
  await page.getByRole('button', { name: 'Add Item' }).first().click();
  let dialog = page.getByRole('dialog');
  await dialog.locator('#name').fill(menuName);
  await dialog.locator('#price').fill('5.75');
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Coffee' }).click();
  await dialog.locator('#description').fill('Smooth demo blend');
  await pause(500);
  await dialog.getByRole('button', { name: 'Add Item' }).click();
  await expect(page.getByText('Menu item added successfully')).toBeVisible();
  await pause(800);

  await page.getByPlaceholder('Search menu items...').fill(menuName);
  const menuRow = page.getByRole('row', { name: new RegExp(menuName) });
  await menuRow.getByRole('switch').click(); // toggle availability
  await expect(page.getByText(/is now (unavailable|available)/)).toBeVisible();
  await pause(800);

  await menuRow.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  dialog = page.getByRole('dialog');
  await dialog.locator('#price').fill('6.50');
  await dialog.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Menu item updated successfully')).toBeVisible();
  await pause(800);

  await page.getByPlaceholder('Search menu items...').fill(menuName);
  await page.getByRole('row', { name: new RegExp(menuName) }).getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByText('Menu item deleted')).toBeVisible();
  await pause(1000);

  /* ---------------------------------------------------------------- */
  /* 3. Orders — cart ops, submit, status pipeline                    */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('heading', { name: 'Order Management' })).toBeVisible();
  await pause();

  await page.getByRole('button', { name: 'Coffee' }).click();
  await pause(700);
  await page.getByText('Cappuccino', { exact: true }).first().click();
  await page.getByText('Latte', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Increase quantity' }).first().click();
  await pause(700);
  await page.locator('#tableNumber').fill('12');
  await page.locator('#customerName').fill('Demo Guest');
  await pause(500);
  await page.getByRole('button', { name: 'Submit Order' }).click();
  await expect(page.getByText('Order submitted successfully!')).toBeVisible();
  await pause(900);

  await page.getByRole('tab', { name: /Pending/ }).click();
  await pause(700);
  await page.getByRole('button', { name: 'View' }).first().click();
  await expect(page.getByRole('dialog').getByText('Order Items')).toBeVisible();
  await pause(1000);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Start Preparing' }).first().click();
  await expect(page.getByText('Order status updated to preparing')).toBeVisible();
  await pause(700);
  await page.getByRole('tab', { name: /Preparing/ }).click();
  await page.getByRole('button', { name: 'Mark Complete' }).first().click();
  await expect(page.getByText('Order status updated to completed')).toBeVisible();
  await pause(1000);

  /* ---------------------------------------------------------------- */
  /* 4. Billing — select an order and print                           */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Billing' }).click();
  await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible();
  await pause();
  await page.locator('.cursor-pointer').first().click();
  await expect(page.getByText('Order Items')).toBeVisible();
  await pause(1000);
  await page.getByRole('button', { name: 'Print Bill' }).click();
  await expect(page.getByText('Bill sent to printer')).toBeVisible();
  await pause(1000);

  /* ---------------------------------------------------------------- */
  /* 5. Inventory — search, filter, add                               */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Inventory' }).click();
  await expect(page.getByRole('heading', { name: 'Inventory Management' })).toBeVisible();
  await pause();
  await page.getByPlaceholder('Search inventory...').fill('Milk');
  await pause(1000);
  await page.getByPlaceholder('Search inventory...').fill('');
  await page.getByRole('button', { name: 'Add Item' }).first().click();
  dialog = page.getByRole('dialog');
  await dialog.locator('#name').fill(`Demo Syrup ${stamp}`);
  await dialog.locator('#quantity').fill('15');
  await dialog.locator('#unit').fill('bottles');
  await dialog.locator('#threshold').fill('5');
  await dialog.locator('#category').fill('Syrups');
  await pause(500);
  await dialog.getByRole('button', { name: 'Add Item' }).click();
  await expect(page.getByText('Inventory item added')).toBeVisible();
  await pause(1000);

  /* ---------------------------------------------------------------- */
  /* 6. Reports — tabs and date range                                 */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Reports' }).click();
  await expect(page.getByRole('heading', { name: 'Reports & Analytics' })).toBeVisible();
  await pause(1000);
  await page.getByRole('tab', { name: 'Sales' }).click();
  await expect(page.getByText('Daily Sales Report')).toBeVisible();
  await pause(1000);
  await page.getByRole('tab', { name: 'Top Items' }).click();
  await expect(page.getByText('Top Selling Items')).toBeVisible();
  await pause(1000);
  await page.getByRole('tab', { name: 'Overview' }).click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Last 30 Days' }).click();
  await pause(1000);

  /* ---------------------------------------------------------------- */
  /* 7. Staff — add with role, then remove with confirmation          */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Staff' }).click();
  await expect(page.getByRole('heading', { name: 'Staff Management' })).toBeVisible();
  await pause();
  const staffName = `Demo Hire ${stamp}`;
  await page.getByRole('button', { name: 'Add Staff' }).first().click();
  dialog = page.getByRole('dialog');
  await dialog.locator('#name').fill(staffName);
  await dialog.locator('#email').fill(`demo${stamp}@cafe.com`);
  await dialog.locator('#phone').fill('+1 555-2026');
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Admin' }).click();
  await pause(500);
  await dialog.getByRole('button', { name: 'Add Staff' }).click();
  await expect(page.getByText('Staff member added successfully')).toBeVisible();
  await pause(900);

  await page.getByPlaceholder('Search staff...').fill(staffName);
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Staff member removed')).toBeVisible();
  await pause(1000);

  /* ---------------------------------------------------------------- */
  /* 8. Logout, then show the limited staff experience                */
  /* ---------------------------------------------------------------- */
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.waitForURL('**/login');
  await pause(800);

  await page.locator('#email').fill(ACCOUNTS.staff.email);
  await page.locator('#password').fill(ACCOUNTS.staff.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByText('Orders Today')).toBeVisible();
  // Staff has no admin sections.
  await expect(page.getByRole('link', { name: 'Menu' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Reports' })).toHaveCount(0);
  await pause(1500);

  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.waitForURL('**/login');
  await pause();
});
