import { expect } from '@playwright/test';
import { test } from './fixtures/base.js';
import { mockQRCodeScan, enableQRMock, startQRScanner } from './helpers/mock-qr.js';
import { mockGoogleSheets } from './helpers/mock-sheets.js';

test.describe('QR Code Scanning Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Log console messages from the browser
        page.on('console', msg => {
            console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
        });

        // Clear localStorage
        await page.evaluate(() => localStorage.clear());
    });

    test('should show scan button on first visit', async ({ page }) => {
        const scanBtn = page.locator('#qr-action-btn');
        await expect(scanBtn).toBeVisible();
        await expect(scanBtn).toHaveText('Scan Program QR Code');
    });

    test('should open camera when scan button clicked', async ({ page }) => {
        await page.click('#qr-action-btn');

        // Scanner should be visible
        const scanner = page.locator('#qr-scanner');
        await expect(scanner).toBeVisible();

        // Video element should be present
        const video = page.locator('#qr-video');
        await expect(video).toBeVisible();
    });

    test('should scan valid QR code and load program', async ({ page }) => {
        // Mock Google Sheets with minimal program fixture
        await mockGoogleSheets(page, 'minimal-program');

        // Mock QR code with valid Google Sheets URL
        const testSheetUrl = 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv';
        await mockQRCodeScan(page, testSheetUrl);
        await enableQRMock(page);

        // Start scanner
        await startQRScanner(page);

        // Wait for page reload and program to load
        await page.waitForSelector('#unitname', { timeout: 10000 });

        // Verify program loaded
        await expect(page.locator('#unitname')).toHaveText('Test Ward');
        await expect(page.locator('#unitaddress')).toHaveText('123 Test St');
        await expect(page.locator('#date')).toHaveText('January 1, 2026');

        // Verify speaker rendered
        const speaker = page.locator('#speaker .value-on-right');
        await expect(speaker).toHaveText('John Doe');
    });

    test('should reject invalid QR code', async ({ page }) => {
        // Mock QR code with invalid URL
        await mockQRCodeScan(page, 'https://example.com/not-a-sheet');

        await startQRScanner(page);
        await enableQRMock(page);

        // Should show error message
        const output = page.locator('#qr-output');
        await expect(output).toContainText('Invalid QR code');

        // Scanner should still be visible (not closed)
        const scanner = page.locator('#qr-scanner');
        await expect(scanner).toBeVisible();
    });

    test('should cancel scanning', async ({ page }) => {
        await page.click('#qr-action-btn');

        // Scanner should be visible
        await expect(page.locator('#qr-scanner')).toBeVisible();

        // Button text should change to "Cancel"
        await expect(page.locator('#qr-action-btn')).toHaveText('Cancel');

        // Click cancel
        await page.click('#qr-action-btn');

        // Scanner should be hidden
        await expect(page.locator('#qr-scanner')).toBeHidden();

        // Button text should revert
        await expect(page.locator('#qr-action-btn')).toHaveText('Scan Program QR Code');
    });
});
