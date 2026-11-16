import { test, expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
async function openWidget(page: import('@playwright/test').Page, view: string) {
    await page.getByRole('button', { name: 'Open giggyDev' }).click();
    await page.getByRole('button', { name: view, exact: true }).click();
}
test('console test buttons capture, filter, select, remove and clear', async ({ page }) => {
    await page.goto('http://127.0.0.1:5187');
    await expect(page.getByRole('button', { name: 'Open giggyDev' })).toBeVisible();
    await page.getByRole('button', { name: 'Log a structured object' }).click();
    await page.getByRole('button', { name: 'Trigger a performance warning' }).click();
    await page.getByRole('button', { name: 'Throw an application error' }).click();
    await openWidget(page, 'Console');
    await expect(page.getByText('Playground: unable to save profile', { exact: false }).first()).toBeVisible();
    await page.getByLabel('Search entries').fill('Profile loaded');
    const row = page.locator('.entry').filter({ hasText: 'Profile loaded' });
    await row.locator('summary').click();
    await expect(row.locator('pre')).toContainText('[REDACTED]');
    await expect(row.locator('pre')).not.toContainText('demo-secret');
    await row.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Chat', exact: true }).click();
    await expect(page.getByLabel('Selected context')).toContainText('1 selected');
    await page.getByRole('button', { name: /Remove Profile loaded/ }).click();
    await expect(page.getByLabel('Selected context')).toContainText('0 selected');
    await page.getByRole('button', { name: 'Console', exact: true }).click();
    await page.getByLabel('Severity').selectOption('warn');
    await expect(page.locator('.entry')).toHaveCount(1);
    await page.getByRole('button', { name: 'Clear console' }).click();
    await expect(page.locator('.entry')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open giggyDev' })).toBeFocused();
});
test('network buttons capture fetch, aborted requests and XHR without leaking URL tokens', async ({ page }) => {
    await page.goto('http://127.0.0.1:5187');
    await expect(page.getByRole('button', { name: 'Open giggyDev' })).toBeVisible();
    await page.getByRole('button', { name: /^Fetch a profile/ }).click();
    await expect(page.getByRole('status')).toContainText('200');
    await page.getByRole('button', { name: 'Cancel a fetch request' }).click();
    await expect(page.getByRole('status')).toContainText('Request failed');
    await page.getByRole('button', { name: 'Send an XMLHttpRequest' }).click();
    await expect(page.getByRole('status')).toContainText('XHR completed with status 200');
    await openWidget(page, 'Network');
    await expect(page.locator('.entry')).toHaveCount(3);
    await expect(page.locator('.entries')).not.toContainText('demo-secret');
    await page.getByRole('checkbox').first().check();
    await page.getByRole('button', { name: 'Chat', exact: true }).click();
    await expect(page.getByLabel('Selected context')).toContainText('1 selected');
    await page.getByRole('button', { name: 'Network', exact: true }).click();
    await page.getByRole('button', { name: 'Clear network' }).click();
    await expect(page.getByLabel('Selected context')).toContainText('0 selected');
});
test('production playground keeps the widget with simulated replies', async ({ page }) => {
    await page.goto('http://127.0.0.1:4187');
    await openWidget(page, 'Chat');
    await expect(page.getByText('PLAYGROUND DEMO', { exact: false })).toBeVisible();
    await page.getByLabel('Message', { exact: true }).fill('Explain this error');
    await page.getByRole('button', { name: 'Send demo message' }).click();
    await expect(page.getByRole('log', { name: 'Conversation' })).toContainText('This is a simulated reply. Attach a console entry');
});
test('library output excludes playground code', async () => {
    const files = await readdir('dist');
    expect(files).toContain('client.js');
    expect(files).toContain('vite.js');
    for (const file of files.filter(f => f.endsWith('.js')))
        expect(await readFile(`dist/${file}`, 'utf8')).not.toMatch(/Less guessing|Fetch a profile|Page sections/);
});
test('Netlify demo explicitly mounts capture and runs the same test actions', async ({ page }) => {
    await page.goto('http://127.0.0.1:4188');
    await expect(page.getByRole('button', { name: 'Open giggyDev' })).toBeVisible();
    await page.getByRole('button', { name: /^Fetch a profile/ }).click();
    await expect(page.getByRole('status')).toContainText('200');
    await openWidget(page, 'Network');
    await expect(page.locator('.entry')).toHaveCount(1);
    await expect(page.getByText('PLAYGROUND DEMO', { exact: false })).toBeVisible();
});
