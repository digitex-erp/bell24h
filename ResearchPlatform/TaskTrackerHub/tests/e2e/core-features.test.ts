
import { describe, it, expect } from 'vitest';
import { test } from '@playwright/test';

describe('Core Features E2E Tests', () => {
  test('RFQ Creation Flow', async ({ page }) => {
    await page.goto('/rfq/create');
    await page.fill('[data-testid="rfq-title"]', 'Test RFQ');
    await page.click('[data-testid="submit-rfq"]');
    const success = await page.isVisible('[data-testid="success-message"]');
    expect(success).toBe(true);
  });

  test('Voice Assistant Integration', async ({ page }) => {
    await page.goto('/voice-assistant');
    await page.click('[data-testid="voice-button"]');
    const recognition = await page.isVisible('[data-testid="voice-active"]');
    expect(recognition).toBe(true);
  });
});
