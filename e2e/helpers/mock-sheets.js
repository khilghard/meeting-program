import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load a CSV fixture file
 */
export function loadFixture(fixtureName) {
    const fixturePath = path.join(__dirname, '..', 'fixtures', `${fixtureName}.csv`);
    return fs.readFileSync(fixturePath, 'utf-8');
}

/**
 * Mock Google Sheets endpoint with a CSV fixture
 */
export async function mockGoogleSheets(page, fixtureName = 'full-program') {
    const csvData = loadFixture(fixtureName);

    // Use context-level routing which is more robust across reloads
    await page.context().route(/\/gviz\/tq.*tqx=out:csv/, async route => {
        // console.log(`Mocking Google Sheets request to: ${route.request().url()}`);
        await route.fulfill({
            status: 200,
            contentType: 'text/csv',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            },
            body: csvData
        });
    });
}

/**
 * Mock Google Sheets with custom CSV data
 */
export async function mockGoogleSheetsWithData(page, csvData) {
    await page.route('**/gviz/tq?tqx=out:csv', route => {
        route.fulfill({
            status: 200,
            contentType: 'text/csv',
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: csvData
        });
    });
}

/**
 * Mock Google Sheets to return an error
 */
export async function mockGoogleSheetsError(page, statusCode = 404, statusText = 'Not Found') {
    await page.route('**/gviz/tq?tqx=out:csv', route => {
        route.fulfill({
            status: statusCode,
            statusText: statusText,
            body: ''
        });
    });
}

/**
 * Mock Google Sheets to timeout (never respond)
 */
export async function mockGoogleSheetsTimeout(page) {
    await page.route('**/gviz/tq?tqx=out:csv', route => {
        // Never fulfill - simulates timeout
    });
}
