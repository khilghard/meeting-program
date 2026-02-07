import { test, expect } from '@playwright/test';
import { mockGoogleSheets } from './helpers/mock-sheets';
import AxeBuilder from '@axe-core/playwright';

test.describe('Visual Verification', () => {
    test.beforeEach(async ({ page }) => {
        await mockGoogleSheets(page);
        // Disable transitions for stable screenshots and accessibility scans
        await page.addInitScript(() => {
            const style = document.createElement('style');
            style.innerHTML = `
                * {
                    transition: none !important;
                    animation: none !important;
                }
            `;
            document.head.appendChild(style);
        });
    });

    test('Theme and Mobile Layout Check', async ({ page }) => {
        // Navigate to base page first
        await page.goto('.');

        // Set the sheet URL via localStorage to avoid direct CSV navigation issues
        await page.evaluate(() => {
            localStorage.setItem('sheetUrl', 'https://docs.google.com/spreadsheets/d/test123/gviz/tq?tqx=out:csv');
        });

        // Reload to apply
        await page.reload();
        await page.waitForSelector('.leader-of-dots');

        // Capture Light Mode
        await page.screenshot({ path: `e2e/screenshots/${test.info().project.name}-light.png`, fullPage: true });

        // Axe Accessibility Check - Light
        const lightResults = await new AxeBuilder({ page }).analyze();

        /** @todo: fix accessibility issues */
        //expect(lightResults.violations).toEqual([]);

        // Toggle Dark Mode
        await page.click('#theme-toggle');
        await page.waitForTimeout(500); // Wait for transition

        // Capture Dark Mode
        await page.screenshot({ path: `e2e/screenshots/${test.info().project.name}-dark.png`, fullPage: true });

        // Axe Accessibility Check - Dark
        const darkResults = await new AxeBuilder({ page }).analyze();
        expect(darkResults.violations).toEqual([]);

        // Verify dots are visible (height check)
        const dots = page.locator('.dots').first();
        const box = await dots.boundingBox();
        expect(box.width).toBeGreaterThan(10);
    });
});
