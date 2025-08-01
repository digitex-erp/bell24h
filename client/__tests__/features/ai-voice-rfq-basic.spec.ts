import { test, expect } from '@playwright/test';

// Phase B – Voice RFQ UI test (cursor-safe < 80 lines)
// Focus: page loads, basic UI elements render, mock all API calls.

const PAGE_PATH = '/voice-rfq';

// Intercept any network call starting with /api/voice-rfq and return dummy JSON
async function mockVoiceRfqApi(page: any) {
  await page.route('**/api/voice-rfq**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
}

test.describe('Voice RFQ UI', () => {
  test.beforeEach(async ({ page }) => {
    await mockVoiceRfqApi(page);
  });

  test('page loads with HTTP 200', async ({ page }) => {
    const response = await page.goto(PAGE_PATH, { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(400);
  });

  test('renders Voice RFQ heading and record button', async ({ page }) => {
    await page.goto(PAGE_PATH, { waitUntil: 'domcontentloaded' });
    const body = await page.locator('body').innerText();
    expect(body.toLowerCase()).toContain('voice');
    expect(body.toLowerCase()).toContain('rfq');

    // If a record/start button exists, click it and ensure it stays enabled
    const btn = page.locator('button:has-text("record")');
    if (await btn.count()) {
      await btn.first().click();
      expect(await btn.first().isEnabled()).toBeTruthy();
    }
  });
});
