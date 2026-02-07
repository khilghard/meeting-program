// fixtures.js
import { test as base } from '@playwright/test';

// Extend the base test with a custom fixture
export const test = base.extend({
    // Example fixture: something that needs setup/teardown
    page: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Perform login or setup
        await page.goto('http://localhost:8000/meeting-program/');
        await page.waitForLoadState('load');
        await page.locator('#qr-action-btn').waitFor({ state: 'visible' });

        await use(page);

        // Teardown
        await context.close();
    }
});
