import { test, expect } from '@playwright/test';
// import { test } from './fixtures/base.js'; // Switched to standard test to control navigation timing
import AxeBuilder from '@axe-core/playwright';
import { mockGoogleSheets } from './helpers/mock-sheets.js';

test.describe('Accessibility', () => {

    /** @todo: fix accessibility issues */
    test.skip('should not have automatically detectable accessibility issues', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        await page.waitForSelector('#unitname');
        // Wait for loading to finish - wait for it to be actually hidden
        await page.waitForSelector('.loading-container', { state: 'hidden' });
        // Wait for actual program data to be rendered to ensure scan is on final state
        await page.waitForSelector('#main-program');
        await page.waitForSelector('.leader-of-dots');

        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('external links should have target="_blank"', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        await page.waitForSelector('#unitname');

        // Wait for links to render
        await page.waitForSelector('a[href^="http"]', { timeout: 5000 });

        const links = await page.locator('a[href^="http"]').all();

        for (const link of links) {
            const target = await link.getAttribute('target');
            expect(target).toBe('_blank');
        }
    });

    test('images should have role or alt attributes', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        await page.waitForSelector('#unitname');

        // Check for images
        const images = await page.locator('img').all();

        if (images.length > 0) {
            for (const img of images) {
                const role = await img.getAttribute('role');
                const alt = await img.getAttribute('alt');

                // Should have either role or alt
                expect(role || alt).toBeTruthy();
            }
        }
    });
});
