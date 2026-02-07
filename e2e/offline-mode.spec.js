import { expect } from '@playwright/test';
import { test } from './fixtures/base.js';
import { mockGoogleSheets, mockGoogleSheetsError } from './helpers/mock-sheets.js';

test.describe('Offline Mode', () => {
    test.beforeEach(async ({ page }) => {
        // Log console messages from the browser
        page.on('console', msg => {
            console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
        });

        // Clear localStorage
        await page.evaluate(() => localStorage.clear());
    });

    test('should show cached program when offline', async ({ page, context }) => {
        // Mock Google Sheets with minimal program fixture BEFORE navigation
        await mockGoogleSheets(page, 'minimal-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';

        // First, load program online
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);
        await page.waitForSelector('#unitname');

        // Verify program loaded
        await expect(page.locator('#unitname')).toHaveText('Test Ward');

        // Now go offline
        await context.setOffline(true);

        // Ensure even if there was a context route, it fails now
        await page.context().route(/\/gviz\/tq/, route => route.abort('internetdisconnected'));

        // Reload page
        await page.reload();

        // Should still show cached program
        await expect(page.locator('#unitname')).toHaveText('Test Ward');

        // Should show offline banner
        const banner = page.locator('#offline-banner');
        await expect(banner).toBeVisible();
        await expect(banner).toContainText('offline mode');
    });

    test('should hide offline banner when back online', async ({ page, context }) => {
        // Mock Google Sheets with minimal program fixture BEFORE navigation
        await mockGoogleSheets(page, 'minimal-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';

        // Load program
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);
        await page.waitForSelector('#unitname');

        // Go offline and reload
        await context.setOffline(true);
        await page.context().route(/\/gviz\/tq/, route => route.abort('internetdisconnected'));
        await page.reload();

        // Banner should be visible
        await expect(page.locator('#offline-banner')).toBeVisible();

        // Go back online
        await context.setOffline(false);

        // Trigger online event
        await page.evaluate(() => {
            window.dispatchEvent(new Event('online'));
        });

        // Banner should be hidden
        await expect(page.locator('#offline-banner')).toBeHidden();
    });

    test('should show error when offline with no cache', async ({ page, context }) => {
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';

        // Clear everything
        await page.goto('');
        await page.evaluate(() => {
            localStorage.clear();
        });

        // Go offline
        await context.setOffline(true);

        // Try to load
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        // Should show error message
        const mainProgram = page.locator('#main-program');
        await expect(mainProgram).toContainText('Unable to load program');
    });

    test('should handle network errors gracefully', async ({ page }) => {
        // Mock 404 error BEFORE navigation
        await mockGoogleSheetsError(page, 404, 'Not Found');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';

        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        // Should show error or fallback to cache
        const mainProgram = page.locator('#main-program');
        await expect(mainProgram).toBeVisible();
    });
});
