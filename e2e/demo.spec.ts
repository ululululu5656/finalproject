import { test, expect, type Locator } from '@playwright/test';
import { ACCOUNTS } from './helpers';

/**
 * Exhaustive, human-paced walkthrough of CafeFlow — exercises every feature in
 * every module and is recorded as one continuous video under the demo test's
 * test-results folder, then converted to MP4 at docs/demo-walkthrough.mp4.
 *
 * slowMo delays each interaction and the pauses below give time to read each
 * screen, so the recording plays at a watchable, demo-friendly speed.
 */
test.use({ launchOptions: { slowMo: 650 } });

test('full app demo — every feature, end to end', async ({ page }) => {
  test.setTimeout(420_000);
  const pause = (ms = 1500) => page.waitForTimeout(ms);
  const type = (loc: Locator, text: string) => loc.pressSequentially(text, { delay: 55 });
  const stamp = Date.now();

  /* ---------------------------------------------------------------- */
  /* 1. Login — invalid attempt, then click-to-fill admin             */
  /* ---------------------------------------------------------------- */
  await page.goto('/login');
  await pause(2000);
  await type(page.locator('#email'), 'admin@cafe.com');
  await type(page.locator('#password'), 'nope');
  await pause(800);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Invalid email or password')).toBeVisible();
  await pause(2200);

  await page.getByRole('button', { name: /admin@cafe\.com/ }).click(); // fill demo creds
  await pause(1200);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await pause(3000); // let the dashboard + charts sink in

  /* ---------------------------------------------------------------- */
  /* 2. Menu — search, filter, views, add, toggle, edit, delete       */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Menu' }).click();
  await expect(page.getByRole('heading', { name: 'Menu Management' })).toBeVisible();
  await pause(1800);

  await type(page.getByPlaceholder('Search menu items...'), 'Latte');
  await pause(2000);
  await page.getByPlaceholder('Search menu items...').clear();
  await pause(600);

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Coffee' }).click();
  await pause(2000);
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'All Categories' }).click();
  await pause(800);

  await page.getByRole('button', { name: 'Card view' }).click();
  await pause(2200);
  await page.getByRole('button', { name: 'Table view' }).click();
  await pause(1200);

  const menuName = `Demo Latte ${stamp}`;
  await page.getByRole('button', { name: 'Add Item' }).first().click();
  await pause(800);
  let dialog = page.getByRole('dialog');
  await type(dialog.locator('#name'), menuName);
  await type(dialog.locator('#price'), '5.75');
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Coffee' }).click();
  await type(dialog.locator('#description'), 'Smooth demo blend');
  await pause(1200);
  await dialog.getByRole('button', { name: 'Add Item' }).click();
  await expect(page.getByText('Menu item added successfully')).toBeVisible();
  await pause(1600);

  await type(page.getByPlaceholder('Search menu items...'), menuName);
  await pause(1000);
  const menuRow = page.getByRole('row', { name: new RegExp(menuName) });
  await menuRow.getByRole('switch').click(); // toggle availability
  await expect(page.getByText(/is now (unavailable|available)/)).toBeVisible();
  await pause(1600);

  await menuRow.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await pause(800);
  dialog = page.getByRole('dialog');
  await dialog.locator('#price').clear();
  await type(dialog.locator('#price'), '6.50');
  await pause(800);
  await dialog.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Menu item updated successfully')).toBeVisible();
  await pause(1600);

  await page.getByPlaceholder('Search menu items...').clear();
  await type(page.getByPlaceholder('Search menu items...'), menuName);
  await pause(800);
  await page.getByRole('row', { name: new RegExp(menuName) }).getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByText('Menu item deleted')).toBeVisible();
  await pause(2000);

  /* ---------------------------------------------------------------- */
  /* 3. Orders — cart ops, submit, status pipeline                    */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('heading', { name: 'Order Management' })).toBeVisible();
  await pause(1800);

  await page.getByRole('button', { name: 'Coffee' }).click();
  await pause(1200);
  await page.getByText('Cappuccino', { exact: true }).first().click();
  await pause(900);
  await page.getByText('Latte', { exact: true }).first().click();
  await pause(900);
  await page.getByRole('button', { name: 'Increase quantity' }).first().click();
  await pause(1200);
  await type(page.locator('#tableNumber'), '12');
  await type(page.locator('#customerName'), 'Demo Guest');
  await pause(1000);
  await page.getByRole('button', { name: 'Submit Order' }).click();
  await expect(page.getByText('Order submitted successfully!')).toBeVisible();
  await pause(1800);

  await page.getByRole('tab', { name: /Pending/ }).click();
  await pause(1400);
  await page.getByRole('button', { name: 'View' }).first().click();
  await expect(page.getByRole('dialog').getByText('Order Items')).toBeVisible();
  await pause(2200);
  await page.keyboard.press('Escape');
  await pause(600);
  await page.getByRole('button', { name: 'Start Preparing' }).first().click();
  await expect(page.getByText('Order status updated to preparing')).toBeVisible();
  await pause(1400);
  await page.getByRole('tab', { name: /Preparing/ }).click();
  await pause(1000);
  await page.getByRole('button', { name: 'Mark Complete' }).first().click();
  await expect(page.getByText('Order status updated to completed')).toBeVisible();
  await pause(2000);

  /* ---------------------------------------------------------------- */
  /* 4. Billing — select an order and print                           */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Billing' }).click();
  await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible();
  await pause(1800);
  await page.locator('.cursor-pointer').first().click();
  await expect(page.getByText('Order Items')).toBeVisible();
  await pause(2400); // read the bill
  await page.getByRole('button', { name: 'Print Bill' }).click();
  await expect(page.getByText('Bill sent to printer')).toBeVisible();
  await pause(1800);

  /* ---------------------------------------------------------------- */
  /* 5. Inventory — search, filter, add                               */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Inventory' }).click();
  await expect(page.getByRole('heading', { name: 'Inventory Management' })).toBeVisible();
  await pause(1800);
  await type(page.getByPlaceholder('Search inventory...'), 'Milk');
  await pause(2000);
  await page.getByPlaceholder('Search inventory...').clear();
  await pause(600);
  await page.getByRole('button', { name: 'Add Item' }).first().click();
  await pause(800);
  dialog = page.getByRole('dialog');
  await type(dialog.locator('#name'), `Demo Syrup ${stamp}`);
  await type(dialog.locator('#quantity'), '15');
  await type(dialog.locator('#unit'), 'bottles');
  await type(dialog.locator('#threshold'), '5');
  await type(dialog.locator('#category'), 'Syrups');
  await pause(1000);
  await dialog.getByRole('button', { name: 'Add Item' }).click();
  await expect(page.getByText('Inventory item added')).toBeVisible();
  await pause(1800);

  /* ---------------------------------------------------------------- */
  /* 6. Reports — tabs and date range                                 */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Reports' }).click();
  await expect(page.getByRole('heading', { name: 'Reports & Analytics' })).toBeVisible();
  await pause(2400);
  await page.getByRole('tab', { name: 'Sales' }).click();
  await expect(page.getByText('Daily Sales Report')).toBeVisible();
  await pause(2200);
  await page.getByRole('tab', { name: 'Top Items' }).click();
  await expect(page.getByText('Top Selling Items')).toBeVisible();
  await pause(2200);
  await page.getByRole('tab', { name: 'Overview' }).click();
  await pause(1000);
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Last 30 Days' }).click();
  await pause(1800);

  /* ---------------------------------------------------------------- */
  /* 7. Staff — add with role, then remove with confirmation          */
  /* ---------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Staff' }).click();
  await expect(page.getByRole('heading', { name: 'Staff Management' })).toBeVisible();
  await pause(1800);
  const staffName = `Demo Hire ${stamp}`;
  await page.getByRole('button', { name: 'Add Staff' }).first().click();
  await pause(800);
  dialog = page.getByRole('dialog');
  await type(dialog.locator('#name'), staffName);
  await type(dialog.locator('#email'), `demo${stamp}@cafe.com`);
  await type(dialog.locator('#phone'), '+1 555-2026');
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Admin' }).click();
  await pause(1000);
  await dialog.getByRole('button', { name: 'Add Staff' }).click();
  await expect(page.getByText('Staff member added successfully')).toBeVisible();
  await pause(1600);

  await type(page.getByPlaceholder('Search staff...'), staffName);
  await pause(1000);
  await page.getByRole('button', { name: 'Remove' }).click();
  await pause(1000);
  await page.getByRole('alertdialog').getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Staff member removed')).toBeVisible();
  await pause(1800);

  /* ---------------------------------------------------------------- */
  /* 8. Logout, then show the limited staff experience                */
  /* ---------------------------------------------------------------- */
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await pause(700);
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.waitForURL('**/login');
  await pause(1500);

  await type(page.locator('#email'), ACCOUNTS.staff.email);
  await type(page.locator('#password'), ACCOUNTS.staff.password);
  await pause(700);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByText('Orders Today')).toBeVisible();
  // Staff has no admin sections.
  await expect(page.getByRole('link', { name: 'Menu' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Reports' })).toHaveCount(0);
  await pause(2600);

  await page.getByRole('button', { name: 'Open user menu' }).click();
  await pause(700);
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.waitForURL('**/login');
  await pause(1500);
});
