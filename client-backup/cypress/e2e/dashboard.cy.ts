describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/dashboard');
  });

  it('should load all dashboard components', () => {
    cy.testDashboard();
  });

  it('should display analytics data', () => {
    cy.get('[data-testid="analytics-dashboard"]').within(() => {
      cy.get('[data-testid="total-transactions"]').should('be.visible');
      cy.get('[data-testid="active-suppliers"]').should('be.visible');
      cy.get('[data-testid="pending-rfqs"]').should('be.visible');
      cy.get('[data-testid="revenue"]').should('be.visible');
    });
  });

  it('should display supplier risk data', () => {
    cy.get('[data-testid="supplier-risk"]').within(() => {
      cy.get('[data-testid="risk-score"]').should('be.visible');
      cy.get('[data-testid="supplier-list"]').should('be.visible');
    });
  });

  it('should display transaction monitoring', () => {
    cy.get('[data-testid="transaction-monitoring"]').within(() => {
      cy.get('[data-testid="transaction-list"]').should('be.visible');
      cy.get('[data-testid="transaction-filters"]').should('be.visible');
    });
  });

  it('should display performance metrics', () => {
    cy.get('[data-testid="performance-metrics"]').within(() => {
      cy.get('[data-testid="response-time"]').should('be.visible');
      cy.get('[data-testid="uptime"]').should('be.visible');
      cy.get('[data-testid="error-rate"]').should('be.visible');
      cy.get('[data-testid="user-satisfaction"]').should('be.visible');
    });
  });

  it('should handle data filtering', () => {
    cy.get('[data-testid="date-range-picker"]').click();
    cy.get('[data-testid="last-30-days"]').click();
    cy.waitForApi('GET', '/api/analytics/dashboard');
  });

  it('should handle data export', () => {
    cy.get('[data-testid="export-button"]').click();
    cy.get('[data-testid="export-options"]').should('be.visible');
    cy.get('[data-testid="export-csv"]').click();
  });

  it('should handle real-time updates', () => {
    cy.get('[data-testid="transaction-list"]')
      .find('[data-testid="transaction-item"]')
      .should('have.length.at.least', 1);
    
    // Wait for real-time update
    cy.wait(1000);
    cy.get('[data-testid="transaction-list"]')
      .find('[data-testid="transaction-item"]')
      .should('have.length.at.least', 1);
  });

  it('should be accessible', () => {
    cy.checkA11y();
  });

  it('should be responsive', () => {
    // Test mobile view
    cy.testResponsive(375, 667);
    
    // Test tablet view
    cy.testResponsive(768, 1024);
    
    // Test desktop view
    cy.testResponsive(1280, 720);
  });

  it('should handle error states', () => {
    // Simulate API error
    cy.intercept('GET', '/api/analytics/dashboard', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('apiError');

    cy.reload();
    cy.wait('@apiError');
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should maintain state after page refresh', () => {
    cy.get('[data-testid="date-range-picker"]').click();
    cy.get('[data-testid="last-30-days"]').click();
    cy.reload();
    cy.get('[data-testid="date-range-picker"]')
      .should('contain', 'Last 30 Days');
  });

  it('should handle concurrent operations', () => {
    // Test multiple simultaneous actions
    cy.get('[data-testid="date-range-picker"]').click();
    cy.get('[data-testid="export-button"]').click();
    cy.get('[data-testid="refresh-button"]').click();
    
    // Verify all actions completed
    cy.get('[data-testid="date-range-picker"]').should('be.visible');
    cy.get('[data-testid="export-options"]').should('be.visible');
  });
}); 