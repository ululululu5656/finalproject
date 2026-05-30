// Capture CafeFlow screenshots for the project report.
// Usage: node scripts/capture-screenshots.mjs [baseURL]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || 'http://localhost:3300';
const OUT = path.join(process.cwd(), 'docs/submission/assets/screenshots');
fs.mkdirSync(OUT, { recursive: true });

const shot = async (page, name, full = true) => {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
  console.log('saved', name);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// 1. Login
await page.goto(`${BASE}/login`);
await page.waitForSelector('#email');
await shot(page, '01-login', false);

// Sign in as admin
await page.locator('#email').fill('admin@cafe.com');
await page.locator('#password').fill('admin123');
await page.getByRole('button', { name: 'Sign In' }).click();
await page.waitForURL('**/dashboard');
await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
await page.waitForTimeout(1200); // let charts render
await shot(page, '02-dashboard');

// 3. Menu
await page.getByRole('link', { name: 'Menu' }).click();
await page.getByRole('heading', { name: 'Menu Management' }).waitFor();
await page.waitForTimeout(500);
await shot(page, '03-menu');

// 4. Orders (new order builder)
await page.getByRole('link', { name: 'Orders' }).click();
await page.getByRole('heading', { name: 'Order Management' }).waitFor();
await page.getByText('Cappuccino', { exact: true }).first().click();
await page.getByText('Croissant', { exact: true }).first().click();
await page.locator('#tableNumber').fill('9');
await page.waitForTimeout(400);
await shot(page, '04-orders-new');

// 5. Orders list (pending)
await page.getByRole('tab', { name: /Pending/ }).click();
await page.waitForTimeout(500);
await shot(page, '05-orders-list');

// 6. Billing
await page.getByRole('link', { name: 'Billing' }).click();
await page.getByRole('heading', { name: 'Billing' }).waitFor();
await page.locator('.cursor-pointer').first().click();
await page.waitForTimeout(500);
await shot(page, '06-billing');

// 7. Inventory
await page.getByRole('link', { name: 'Inventory' }).click();
await page.getByRole('heading', { name: 'Inventory Management' }).waitFor();
await page.waitForTimeout(500);
await shot(page, '07-inventory');

// 8. Reports
await page.getByRole('link', { name: 'Reports' }).click();
await page.getByRole('heading', { name: 'Reports & Analytics' }).waitFor();
await page.waitForTimeout(1200);
await shot(page, '08-reports');

// 9. Staff
await page.getByRole('link', { name: 'Staff' }).click();
await page.getByRole('heading', { name: 'Staff Management' }).waitFor();
await page.waitForTimeout(500);
await shot(page, '09-staff');

await browser.close();
console.log('done -> ' + OUT);
