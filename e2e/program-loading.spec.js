import { expect } from '@playwright/test';
import { test } from './fixtures/base.js';
import { mockGoogleSheets } from './helpers/mock-sheets.js';

test.describe('Program Loading', () => {

    test('should load program from URL parameter', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        // Wait for program to load
        await page.waitForSelector('#unitname', { timeout: 5000 });

        // Verify header information
        await expect(page.locator('#unitname')).toHaveText('Unit Name');
        await expect(page.locator('#unitaddress')).toHaveText('123 Actual Ave, City US 123245');
        await expect(page.locator('#date')).toHaveText('January 1, 2026');
    });

    test('should load program from localStorage', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';

        // Set localStorage
        await page.goto('');
        await page.evaluate((url) => {
            localStorage.setItem('sheetUrl', url);
        }, sheetUrl);

        // Reload page
        await page.reload();

        // Verify program loaded
        await expect(page.locator('#unitname')).toHaveText('Unit Name');
    });

    test('should render all program elements', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        // Wait for load
        await page.waitForSelector('#unitname');

        // Verify presiding/conducting
        await expect(page.locator('#presiding .value-on-right')).toHaveText('Leader1');
        await expect(page.locator('#conducting .value-on-right')).toHaveText('Leader2');

        // Verify hymns
        await expect(page.locator('#openingHymn .value-on-right')).toHaveText('#62');
        await expect(page.locator('#openingHymn .hymn-title')).toHaveText('All Creatures of Our God and King');

        // Verify speakers
        const speakers = await page.locator('[id^="speaker"]').all();
        expect(speakers.length).toBeGreaterThan(0);
    });

    test('should replace tildes with commas', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        await page.waitForSelector('#unitaddress');

        // Tildes should be replaced with commas
        await expect(page.locator('#unitaddress')).toHaveText('123 Actual Ave, City US 123245');
        await expect(page.locator('#date')).toHaveText('January 1, 2026');
    });

    test('should render leaders with phone numbers', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        await page.waitForSelector('#unitname');

        // Check for leader elements - target divs without IDs to avoid hymns
        const leaderRows = await page.locator('#main-program > div:not([id]) .leader-of-dots.hymn-row').all();
        expect(leaderRows.length).toBeGreaterThan(0);

        // Verify first leader has all parts
        const firstLeader = leaderRows[0];
        await expect(firstLeader.locator('.label')).toHaveText('John Doe');
        await expect(firstLeader.locator('.value-on-right')).toHaveText('(000) 000-0000');
    });

    test('should render links with images', async ({ page }) => {
        // Mock Google Sheets with full program fixture BEFORE navigation
        await mockGoogleSheets(page, 'full-program');

        const sheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await page.goto(`?url=${encodeURIComponent(sheetUrl)}`);

        await page.waitForSelector('#unitname');

        // Check for link with image
        const linkWithImage = page.locator('.link-with-space').first();
        await expect(linkWithImage).toBeVisible();

        // Should have an image
        const img = linkWithImage.locator('img.link-icon');
        await expect(img).toBeVisible();

        // Should have a link
        const link = linkWithImage.locator('a');
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('target', '_blank');
    });
});
