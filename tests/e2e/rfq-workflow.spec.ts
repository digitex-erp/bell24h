import { expect, test } from '@playwright/test';
import { indianBusinessTestData } from '../fixtures/test-data';

test.describe('RFQ Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as buyer before each test
    await page.goto('/login');
    const testUser = indianBusinessTestData.testUsers.buyer;
    await page.fill('[data-testid=email-input]', testUser.email);
    await page.fill('[data-testid=password-input]', testUser.password);
    await page.click('[data-testid=login-submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Complete RFQ creation and submission', async ({ page }) => {
    const rfq = indianBusinessTestData.rfqTestData[0];

    // Navigate to RFQ creation
    await page.goto('/rfq/create');

    // Fill RFQ details
    await page.fill('[data-testid=rfq-title]', rfq.title);
    await page.selectOption('[data-testid=rfq-category]', rfq.category);
    await page.selectOption('[data-testid=rfq-subcategory]', rfq.subcategory);
    await page.fill('[data-testid=rfq-quantity]', rfq.quantity);
    await page.fill('[data-testid=rfq-specifications]', rfq.specifications);
    await page.fill('[data-testid=rfq-budget]', rfq.budget);
    await page.fill('[data-testid=rfq-deadline]', rfq.deadline);

    // Upload attachment (optional)
    await page.setInputFiles(
      '[data-testid=rfq-attachment]',
      'tests/fixtures/sample-document.pdf'
    );

    // Submit RFQ
    await page.click('[data-testid=rfq-submit]');

    // Verify success message
    await expect(
      page.locator('[data-testid=rfq-success-message]')
    ).toBeVisible();
    await expect(page.locator('[data-testid=rfq-id]')).toBeVisible();

    // Verify RFQ appears in dashboard
    await page.goto('/dashboard/rfq');
    await expect(
      page.locator(`[data-testid=rfq-item]:has-text("${rfq.title}")`)
    ).toBeVisible();
  });

  test('Supplier search and matching', async ({ page }) => {
    await page.goto('/suppliers');

    // Search for suppliers
    await page.fill('[data-testid=supplier-search]', 'Steel');
    await page.click('[data-testid=search-submit]');

    // Verify search results
    await expect(page.locator('[data-testid=supplier-results]')).toBeVisible();
    await expect(
      page.locator('[data-testid=supplier-card]').first()
    ).toBeVisible();

    // Filter by location
    await page.selectOption('[data-testid=location-filter]', 'Maharashtra');
    await expect(
      page.locator('[data-testid=supplier-card]:has-text("Maharashtra")')
    ).toBeVisible();

    // View supplier profile
    await page.click('[data-testid=supplier-card] [data-testid=view-profile]', {
      first: true,
    });
    await expect(page.locator('[data-testid=supplier-profile]')).toBeVisible();
    await expect(page.locator('[data-testid=supplier-gst]')).toBeVisible();
  });

  test('RFQ response and quote submission', async ({ page }) => {
    // Switch to supplier account for this test
    await page.goto('/login');
    const supplier = indianBusinessTestData.testUsers.supplier;
    await page.fill('[data-testid=email-input]', supplier.email);
    await page.fill('[data-testid=password-input]', supplier.password);
    await page.click('[data-testid=login-submit]');

    // Navigate to available RFQs
    await page.goto('/dashboard/rfq/available');

    // Select an RFQ to respond to
    await page.click('[data-testid=rfq-item] [data-testid=respond-button]', {
      first: true,
    });

    // Fill quote details
    await page.fill('[data-testid=quote-price]', '2400000');
    await page.fill('[data-testid=quote-delivery-time]', '30 days');
    await page.fill(
      '[data-testid=quote-terms]',
      'Payment: 30% advance, 70% on delivery'
    );

    // Submit quote
    await page.click('[data-testid=submit-quote]');

    // Verify success
    await expect(page.locator('[data-testid=quote-success]')).toBeVisible();
  });

  test('RFQ status tracking and updates', async ({ page }) => {
    // Create an RFQ first
    const rfq = indianBusinessTestData.rfqTestData[1];
    await page.goto('/rfq/create');

    await page.fill('[data-testid=rfq-title]', rfq.title);
    await page.selectOption('[data-testid=rfq-category]', rfq.category);
    await page.selectOption('[data-testid=rfq-subcategory]', rfq.subcategory);
    await page.fill('[data-testid=rfq-quantity]', rfq.quantity);
    await page.fill('[data-testid=rfq-specifications]', rfq.specifications);
    await page.fill('[data-testid=rfq-budget]', rfq.budget);
    await page.fill('[data-testid=rfq-deadline]', rfq.deadline);
    await page.click('[data-testid=rfq-submit]');

    // Check RFQ status
    await page.goto('/dashboard/rfq');
    await page.click(`[data-testid=rfq-item]:has-text("${rfq.title}")`);

    // Verify status is "Open"
    await expect(page.locator('[data-testid=rfq-status]')).toContainText(
      'Open'
    );

    // Check for responses
    await page.click('[data-testid=view-responses-tab]');
    await expect(page.locator('[data-testid=responses-section]')).toBeVisible();
  });

  test('RFQ deadline and auto-closure', async ({ page }) => {
    // Create RFQ with past deadline
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastDateString = pastDate.toISOString().split('T')[0];

    await page.goto('/rfq/create');
    await page.fill('[data-testid=rfq-title]', 'Past Deadline RFQ');
    await page.selectOption(
      '[data-testid=rfq-category]',
      'Electronics & Electrical'
    );
    await page.fill('[data-testid=rfq-deadline]', pastDateString);
    await page.click('[data-testid=rfq-submit]');

    // Check that RFQ is automatically closed
    await page.goto('/dashboard/rfq');
    await page.click('[data-testid=rfq-item]:has-text("Past Deadline RFQ")');
    await expect(page.locator('[data-testid=rfq-status]')).toContainText(
      'Closed'
    );
  });

  test('RFQ analytics and reporting', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    // Check RFQ analytics
    await expect(
      page.locator('[data-testid=rfq-analytics-section]')
    ).toBeVisible();
    await expect(page.locator('[data-testid=total-rfqs]')).toBeVisible();
    await expect(page.locator('[data-testid=response-rate]')).toBeVisible();
    await expect(page.locator('[data-testid=avg-response-time]')).toBeVisible();

    // Generate report
    await page.click('[data-testid=generate-report-button]');
    await expect(page.locator('[data-testid=report-download]')).toBeVisible();
  });

  test('RFQ notifications and alerts', async ({ page }) => {
    // Check notification settings
    await page.goto('/dashboard/settings/notifications');

    // Enable email notifications
    await page.check('[data-testid=email-notifications-checkbox]');
    await page.check('[data-testid=rfq-response-notifications-checkbox]');
    await page.click('[data-testid=save-notification-settings]');

    // Verify settings saved
    await expect(
      page.locator('[data-testid=settings-saved-message]')
    ).toBeVisible();
  });
});
