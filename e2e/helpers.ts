import { expect, type Page } from '@playwright/test';

export const ACCOUNTS = {
  admin: { email: 'admin@cafe.com', password: 'admin123' },
  staff: { email: 'staff@cafe.com', password: 'staff123' },
};

/** Sign in through the login form and wait for the dashboard to render. */
export async function login(page: Page, role: 'admin' | 'staff' = 'admin') {
  const account = ACCOUNTS[role];
  await page.goto('/login');
  await page.locator('#email').fill(account.email);
  await page.locator('#password').fill(account.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

/** Navigate via the sidebar to a section and confirm its heading shows. */
export async function gotoSection(page: Page, href: string, heading: string) {
  await page.goto(href);
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
}
