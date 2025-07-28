import { expect, test } from '@playwright/test';
import { indianBusinessTestData } from '../fixtures/test-data';

test.describe('Authentication Flows', () => {
  test('Business user registration with GST validation', async ({ page }) => {
    await page.goto('/register');

    const testUser = indianBusinessTestData.testUsers.buyer;

    // Fill registration form
    await page.fill('[data-testid=name-input]', testUser.name);
    await page.fill('[data-testid=email-input]', testUser.email);
    await page.fill('[data-testid=company-input]', testUser.company);
    await page.fill('[data-testid=gst-input]', testUser.gst);
    await page.fill('[data-testid=phone-input]', testUser.phone);
    await page.fill('[data-testid=password-input]', testUser.password);

    // Select user type
    await page.selectOption('[data-testid=user-type-select]', 'buyer');

    // Submit registration
    await page.click('[data-testid=register-submit]');

    // Verify GST validation success
    await expect(
      page.locator('[data-testid=gst-validation-success]')
    ).toBeVisible();

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid=welcome-message]')).toContainText(
      testUser.name
    );
  });

  test('Login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    const testUser = indianBusinessTestData.testUsers.buyer;

    await page.fill('[data-testid=email-input]', testUser.email);
    await page.fill('[data-testid=password-input]', testUser.password);
    await page.click('[data-testid=login-submit]');

    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid=user-profile]')).toContainText(
      testUser.name
    );
  });

  test('Google OAuth login flow', async ({ page }) => {
    await page.goto('/login');

    // Click Google OAuth button
    await page.click('[data-testid=google-oauth-button]');

    // Mock Google OAuth response (in real test, you would mock this)
    // For now, verify the redirect to Google
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });

  test('Login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid=email-input]', 'invalid@email.com');
    await page.fill('[data-testid=password-input]', 'wrongpassword');
    await page.click('[data-testid=login-submit]');

    // Verify error message
    await expect(page.locator('[data-testid=error-message]')).toContainText(
      'Invalid credentials'
    );
  });

  test('Protected route access without authentication', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(
      page.locator('[data-testid=login-required-message]')
    ).toBeVisible();
  });

  test('Session timeout and renewal', async ({ page }) => {
    // Login first
    await page.goto('/login');
    const testUser = indianBusinessTestData.testUsers.buyer;
    await page.fill('[data-testid=email-input]', testUser.email);
    await page.fill('[data-testid=password-input]', testUser.password);
    await page.click('[data-testid=login-submit]');

    // Simulate session timeout (mock the JWT expiration)
    await page.evaluate(() => {
      localStorage.removeItem('next-auth.session-token');
    });

    // Try to access protected route
    await page.goto('/dashboard/settings');

    // Should redirect to login due to expired session
    await expect(page).toHaveURL('/login');
  });

  test('Password reset flow', async ({ page }) => {
    await page.goto('/forgot-password');

    const testUser = indianBusinessTestData.testUsers.buyer;

    // Fill forgot password form
    await page.fill('[data-testid=email-input]', testUser.email);
    await page.click('[data-testid=reset-password-submit]');

    // Verify success message
    await expect(
      page.locator('[data-testid=reset-success-message]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid=reset-success-message]')
    ).toContainText('Password reset email sent');
  });

  test('Account lockout after multiple failed attempts', async ({ page }) => {
    await page.goto('/login');

    const testUser = indianBusinessTestData.testUsers.buyer;

    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid=email-input]', testUser.email);
      await page.fill('[data-testid=password-input]', 'wrongpassword');
      await page.click('[data-testid=login-submit]');

      // Wait for error message
      await expect(page.locator('[data-testid=error-message]')).toBeVisible();
    }

    // Try one more time - should be locked out
    await page.fill('[data-testid=email-input]', testUser.email);
    await page.fill('[data-testid=password-input]', testUser.password);
    await page.click('[data-testid=login-submit]');

    // Verify account lockout message
    await expect(
      page.locator('[data-testid=account-locked-message]')
    ).toBeVisible();
  });

  test('Role-based access control', async ({ page }) => {
    // Login as buyer
    await page.goto('/login');
    const buyer = indianBusinessTestData.testUsers.buyer;
    await page.fill('[data-testid=email-input]', buyer.email);
    await page.fill('[data-testid=password-input]', buyer.password);
    await page.click('[data-testid=login-submit]');

    // Try to access admin routes - should be denied
    await page.goto('/admin/dashboard');
    await expect(
      page.locator('[data-testid=access-denied-message]')
    ).toBeVisible();

    // Verify buyer-specific features are available
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid=create-rfq-button]')).toBeVisible();
    await expect(page.locator('[data-testid=my-rfqs-section]')).toBeVisible();
  });
});
