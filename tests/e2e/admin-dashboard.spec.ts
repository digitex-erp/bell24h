import { expect, test } from '@playwright/test';
import { indianBusinessTestData } from '../fixtures/test-data';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    const admin = indianBusinessTestData.testUsers.admin;
    await page.fill('[data-testid=email-input]', admin.email);
    await page.fill('[data-testid=password-input]', admin.password);
    await page.click('[data-testid=login-submit]');
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('Admin dashboard overview and metrics', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Verify admin dashboard elements
    await expect(page.locator('[data-testid=admin-dashboard]')).toBeVisible();
    await expect(page.locator('[data-testid=total-users]')).toBeVisible();
    await expect(page.locator('[data-testid=total-rfqs]')).toBeVisible();
    await expect(
      page.locator('[data-testid=total-transactions]')
    ).toBeVisible();
    await expect(page.locator('[data-testid=revenue-metrics]')).toBeVisible();

    // Check real-time metrics
    await expect(page.locator('[data-testid=active-users]')).toBeVisible();
    await expect(page.locator('[data-testid=pending-approvals]')).toBeVisible();
    await expect(page.locator('[data-testid=system-health]')).toBeVisible();
  });

  test('User management and approval workflow', async ({ page }) => {
    await page.goto('/admin/users');

    // View pending user approvals
    await page.click('[data-testid=pending-approvals-tab]');
    await expect(
      page.locator('[data-testid=pending-users-list]')
    ).toBeVisible();

    // Approve a user
    await page.click('[data-testid=user-item] [data-testid=approve-button]', {
      first: true,
    });
    await expect(page.locator('[data-testid=approval-success]')).toBeVisible();

    // Suspend a user
    await page.click('[data-testid=user-item] [data-testid=suspend-button]', {
      first: true,
    });
    await page.fill('[data-testid=suspension-reason]', 'Violation of terms');
    await page.click('[data-testid=confirm-suspension]');
    await expect(
      page.locator('[data-testid=suspension-success]')
    ).toBeVisible();
  });

  test('RFQ moderation and management', async ({ page }) => {
    await page.goto('/admin/rfqs');

    // View all RFQs
    await expect(
      page.locator('[data-testid=rfq-management-section]')
    ).toBeVisible();

    // Filter RFQs by status
    await page.selectOption(
      '[data-testid=rfq-status-filter]',
      'Pending Approval'
    );
    await expect(page.locator('[data-testid=rfq-item]')).toBeVisible();

    // Approve an RFQ
    await page.click('[data-testid=rfq-item] [data-testid=approve-rfq]', {
      first: true,
    });
    await expect(
      page.locator('[data-testid=rfq-approval-success]')
    ).toBeVisible();

    // Reject an RFQ
    await page.click('[data-testid=rfq-item] [data-testid=reject-rfq]', {
      first: true,
    });
    await page.fill('[data-testid=rejection-reason]', 'Inappropriate content');
    await page.click('[data-testid=confirm-rejection]');
    await expect(
      page.locator('[data-testid=rfq-rejection-success]')
    ).toBeVisible();
  });

  test('Payment monitoring and fraud detection', async ({ page }) => {
    await page.goto('/admin/payments');

    // View payment monitoring dashboard
    await expect(
      page.locator('[data-testid=payment-monitoring]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid=suspicious-transactions]')
    ).toBeVisible();

    // Review suspicious transaction
    await page.click(
      '[data-testid=suspicious-transaction] [data-testid=review-button]',
      { first: true }
    );
    await expect(
      page.locator('[data-testid=transaction-details]')
    ).toBeVisible();

    // Mark transaction as legitimate
    await page.click('[data-testid=mark-legitimate]');
    await expect(
      page.locator('[data-testid=transaction-approved]')
    ).toBeVisible();

    // Block fraudulent transaction
    await page.click(
      '[data-testid=suspicious-transaction] [data-testid=block-button]',
      { first: true }
    );
    await page.fill('[data-testid=block-reason]', 'Suspected fraud');
    await page.click('[data-testid=confirm-block]');
    await expect(
      page.locator('[data-testid=transaction-blocked]')
    ).toBeVisible();
  });

  test('System analytics and reporting', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check comprehensive analytics
    await expect(page.locator('[data-testid=system-analytics]')).toBeVisible();
    await expect(page.locator('[data-testid=user-growth-chart]')).toBeVisible();
    await expect(
      page.locator('[data-testid=transaction-volume-chart]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid=rfq-activity-chart]')
    ).toBeVisible();

    // Generate system report
    await page.click('[data-testid=generate-system-report]');
    await expect(page.locator('[data-testid=report-download]')).toBeVisible();

    // Export data
    await page.click('[data-testid=export-data-button]');
    await expect(page.locator('[data-testid=export-success]')).toBeVisible();
  });

  test('System configuration and settings', async ({ page }) => {
    await page.goto('/admin/settings');

    // Update system settings
    await page.fill('[data-testid=site-name]', 'Bell24H - Updated');
    await page.fill('[data-testid=support-email]', 'support@bell24h.com');
    await page.selectOption('[data-testid=maintenance-mode]', 'false');

    // Save settings
    await page.click('[data-testid=save-settings]');
    await expect(page.locator('[data-testid=settings-saved]')).toBeVisible();

    // Configure payment settings
    await page.click('[data-testid=payment-settings-tab]');
    await page.fill('[data-testid=razorpay-key]', 'rzp_test_updated_key');
    await page.fill('[data-testid=razorpay-secret]', 'updated_secret');
    await page.click('[data-testid=save-payment-settings]');
    await expect(
      page.locator('[data-testid=payment-settings-saved]')
    ).toBeVisible();
  });

  test('Security monitoring and audit logs', async ({ page }) => {
    await page.goto('/admin/security');

    // View security dashboard
    await expect(
      page.locator('[data-testid=security-dashboard]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid=failed-login-attempts]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid=suspicious-activities]')
    ).toBeVisible();

    // Review security events
    await page.click(
      '[data-testid=security-event] [data-testid=review-button]',
      { first: true }
    );
    await expect(page.locator('[data-testid=event-details]')).toBeVisible();

    // Export audit logs
    await page.click('[data-testid=export-audit-logs]');
    await expect(
      page.locator('[data-testid=audit-logs-download]')
    ).toBeVisible();
  });

  test('Content moderation and compliance', async ({ page }) => {
    await page.goto('/admin/moderation');

    // View content moderation queue
    await expect(page.locator('[data-testid=moderation-queue]')).toBeVisible();
    await expect(page.locator('[data-testid=flagged-content]')).toBeVisible();

    // Review flagged content
    await page.click('[data-testid=flagged-item] [data-testid=review-button]', {
      first: true,
    });
    await expect(page.locator('[data-testid=content-details]')).toBeVisible();

    // Take action on flagged content
    await page.click('[data-testid=remove-content]');
    await page.fill(
      '[data-testid=removal-reason]',
      'Violates community guidelines'
    );
    await page.click('[data-testid=confirm-removal]');
    await expect(page.locator('[data-testid=content-removed]')).toBeVisible();
  });

  test('Performance monitoring and system health', async ({ page }) => {
    await page.goto('/admin/performance');

    // Check system health metrics
    await expect(page.locator('[data-testid=system-health]')).toBeVisible();
    await expect(page.locator('[data-testid=server-status]')).toBeVisible();
    await expect(page.locator('[data-testid=database-status]')).toBeVisible();
    await expect(
      page.locator('[data-testid=api-response-times]')
    ).toBeVisible();

    // View performance alerts
    await expect(
      page.locator('[data-testid=performance-alerts]')
    ).toBeVisible();

    // Check resource usage
    await expect(page.locator('[data-testid=cpu-usage]')).toBeVisible();
    await expect(page.locator('[data-testid=memory-usage]')).toBeVisible();
    await expect(page.locator('[data-testid=disk-usage]')).toBeVisible();
  });
});
