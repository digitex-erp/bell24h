import { expect, test } from '@playwright/test';
import { indianBusinessTestData } from '../fixtures/test-data';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as buyer before each test
    await page.goto('/login');
    const testUser = indianBusinessTestData.testUsers.buyer;
    await page.fill('[data-testid=email-input]', testUser.email);
    await page.fill('[data-testid=password-input]', testUser.password);
    await page.click('[data-testid=login-submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Complete payment flow with Razorpay', async ({ page }) => {
    const transaction = indianBusinessTestData.highValueTransactions[0];

    // Navigate to payment page
    await page.goto('/payment/create');

    // Fill payment details
    await page.fill(
      '[data-testid=payment-amount]',
      transaction.amount.toString()
    );
    await page.fill(
      '[data-testid=payment-description]',
      transaction.description
    );
    await page.selectOption('[data-testid=payment-method]', 'razorpay');

    // Submit payment request
    await page.click('[data-testid=create-payment-button]');

    // Verify Razorpay modal opens
    await expect(page.locator('[data-testid=razorpay-modal]')).toBeVisible();

    // Fill test payment details (using Razorpay test data)
    await page.fill('[data-testid=card-number]', '4111111111111111');
    await page.fill('[data-testid=card-expiry]', '12/25');
    await page.fill('[data-testid=card-cvv]', '123');
    await page.fill('[data-testid=card-name]', 'Test User');

    // Submit payment
    await page.click('[data-testid=pay-button]');

    // Verify payment success
    await expect(page.locator('[data-testid=payment-success]')).toBeVisible();
    await expect(page.locator('[data-testid=payment-id]')).toBeVisible();
  });

  test('GST invoice generation after payment', async ({ page }) => {
    // Complete a payment first
    const transaction = indianBusinessTestData.highValueTransactions[1];
    await page.goto('/payment/create');
    await page.fill(
      '[data-testid=payment-amount]',
      transaction.amount.toString()
    );
    await page.fill(
      '[data-testid=payment-description]',
      transaction.description
    );
    await page.click('[data-testid=create-payment-button]');

    // Mock successful payment
    await page.evaluate(() => {
      // Simulate successful payment response
      window.postMessage(
        { type: 'PAYMENT_SUCCESS', paymentId: 'pay_test_123456' },
        '*'
      );
    });

    // Navigate to invoice generation
    await page.goto('/invoice/generate');

    // Fill invoice details
    const gstData = indianBusinessTestData.gstInvoiceData;
    await page.fill('[data-testid=invoice-number]', gstData.invoiceNumber);
    await page.fill('[data-testid=buyer-gst]', gstData.buyerGST);
    await page.fill('[data-testid=supplier-gst]', gstData.supplierGST);
    await page.fill(
      '[data-testid=taxable-amount]',
      gstData.taxableAmount.toString()
    );

    // Generate invoice
    await page.click('[data-testid=generate-invoice-button]');

    // Verify invoice generation
    await expect(page.locator('[data-testid=invoice-success]')).toBeVisible();
    await expect(page.locator('[data-testid=invoice-pdf]')).toBeVisible();

    // Verify GST calculations
    await expect(page.locator('[data-testid=cgst-amount]')).toContainText(
      gstData.cgst.toString()
    );
    await expect(page.locator('[data-testid=sgst-amount]')).toContainText(
      gstData.sgst.toString()
    );
    await expect(page.locator('[data-testid=total-amount]')).toContainText(
      gstData.totalAmount.toString()
    );
  });

  test('Payment verification and webhook handling', async ({ page }) => {
    // Test payment verification
    await page.goto('/payment/verify');

    const testPaymentId = indianBusinessTestData.paymentTestData.testPaymentId;
    await page.fill('[data-testid=payment-id-input]', testPaymentId);
    await page.click('[data-testid=verify-payment-button]');

    // Verify payment status
    await expect(page.locator('[data-testid=payment-status]')).toContainText(
      'Success'
    );
    await expect(page.locator('[data-testid=payment-amount]')).toBeVisible();
    await expect(page.locator('[data-testid=payment-timestamp]')).toBeVisible();
  });

  test('High-value transaction compliance', async ({ page }) => {
    const highValueTransaction =
      indianBusinessTestData.highValueTransactions[3]; // ₹25,00,000

    await page.goto('/payment/create');
    await page.fill(
      '[data-testid=payment-amount]',
      highValueTransaction.amount.toString()
    );
    await page.fill(
      '[data-testid=payment-description]',
      highValueTransaction.description
    );
    await page.click('[data-testid=create-payment-button]');

    // Verify compliance checks are triggered
    await expect(page.locator('[data-testid=compliance-check]')).toBeVisible();
    await expect(page.locator('[data-testid=gst-verification]')).toBeVisible();
    await expect(page.locator('[data-testid=kyc-verification]')).toBeVisible();

    // Fill compliance details
    await page.fill('[data-testid=pan-number]', 'ABCDE1234F');
    await page.fill('[data-testid=aadhar-number]', '123456789012');
    await page.click('[data-testid=submit-compliance]');

    // Verify compliance approval
    await expect(
      page.locator('[data-testid=compliance-approved]')
    ).toBeVisible();
  });

  test('Payment failure handling', async ({ page }) => {
    await page.goto('/payment/create');
    await page.fill('[data-testid=payment-amount]', '100000');
    await page.fill('[data-testid=payment-description]', 'Test Payment');
    await page.click('[data-testid=create-payment-button]');

    // Simulate payment failure
    await page.evaluate(() => {
      window.postMessage(
        { type: 'PAYMENT_FAILED', error: 'Insufficient funds' },
        '*'
      );
    });

    // Verify error handling
    await expect(page.locator('[data-testid=payment-error]')).toBeVisible();
    await expect(
      page.locator('[data-testid=retry-payment-button]')
    ).toBeVisible();

    // Test retry functionality
    await page.click('[data-testid=retry-payment-button]');
    await expect(page.locator('[data-testid=razorpay-modal]')).toBeVisible();
  });

  test('Payment analytics and reporting', async ({ page }) => {
    await page.goto('/dashboard/payments/analytics');

    // Check payment analytics
    await expect(
      page.locator('[data-testid=payment-analytics-section]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid=total-transactions]')
    ).toBeVisible();
    await expect(page.locator('[data-testid=success-rate]')).toBeVisible();
    await expect(
      page.locator('[data-testid=avg-transaction-value]')
    ).toBeVisible();

    // Generate payment report
    await page.click('[data-testid=generate-payment-report]');
    await expect(page.locator('[data-testid=report-download]')).toBeVisible();
  });

  test('Refund processing', async ({ page }) => {
    // Navigate to payment history
    await page.goto('/dashboard/payments/history');

    // Select a payment for refund
    await page.click('[data-testid=payment-item] [data-testid=refund-button]', {
      first: true,
    });

    // Fill refund details
    await page.fill('[data-testid=refund-amount]', '50000');
    await page.fill('[data-testid=refund-reason]', 'Customer request');
    await page.click('[data-testid=submit-refund]');

    // Verify refund processing
    await expect(page.locator('[data-testid=refund-success]')).toBeVisible();
    await expect(page.locator('[data-testid=refund-id]')).toBeVisible();
  });

  test('Payment security and fraud detection', async ({ page }) => {
    // Test suspicious payment detection
    await page.goto('/payment/create');
    await page.fill('[data-testid=payment-amount]', '9999999'); // Very high amount
    await page.fill(
      '[data-testid=payment-description]',
      'Suspicious transaction'
    );
    await page.click('[data-testid=create-payment-button]');

    // Verify fraud detection is triggered
    await expect(page.locator('[data-testid=fraud-alert]')).toBeVisible();
    await expect(
      page.locator('[data-testid=manual-review-required]')
    ).toBeVisible();

    // Test security measures
    await page.goto('/dashboard/settings/security');
    await expect(page.locator('[data-testid=two-factor-auth]')).toBeVisible();
    await expect(page.locator('[data-testid=payment-limits]')).toBeVisible();
  });
});
