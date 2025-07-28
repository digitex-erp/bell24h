describe('Admin Features', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'admin123');
    cy.visit('/admin');
  });

  it('should display admin dashboard', () => {
    cy.get('[data-testid="admin-dashboard"]').within(() => {
      cy.get('[data-testid="total-users"]').should('be.visible');
      cy.get('[data-testid="total-suppliers"]').should('be.visible');
      cy.get('[data-testid="total-buyers"]').should('be.visible');
      cy.get('[data-testid="total-transactions"]').should('be.visible');
    });
  });

  it('should handle user management', () => {
    cy.get('[data-testid="user-management"]').click();
    cy.get('[data-testid="user-list"]').within(() => {
      cy.get('[data-testid="user-item"]').should('have.length.at.least', 1);
    });

    // Test user search
    cy.get('[data-testid="user-search"]').type('test@example.com');
    cy.get('[data-testid="user-item"]').should('have.length', 1);

    // Test user role update
    cy.get('[data-testid="user-item"]').first().within(() => {
      cy.get('[data-testid="role-select"]').select('supplier');
      cy.get('[data-testid="save-role"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle supplier verification', () => {
    cy.get('[data-testid="supplier-verification"]').click();
    cy.get('[data-testid="verification-list"]').within(() => {
      cy.get('[data-testid="verification-item"]').should('have.length.at.least', 1);
    });

    // Test verification approval
    cy.get('[data-testid="verification-item"]').first().within(() => {
      cy.get('[data-testid="approve-button"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle content moderation', () => {
    cy.get('[data-testid="content-moderation"]').click();
    cy.get('[data-testid="content-list"]').within(() => {
      cy.get('[data-testid="content-item"]').should('have.length.at.least', 1);
    });

    // Test content approval
    cy.get('[data-testid="content-item"]').first().within(() => {
      cy.get('[data-testid="approve-content"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle system settings', () => {
    cy.get('[data-testid="system-settings"]').click();
    cy.get('[data-testid="settings-form"]').within(() => {
      cy.get('input[name="maintenanceMode"]').check();
      cy.get('input[name="registrationEnabled"]').uncheck();
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle analytics reporting', () => {
    cy.get('[data-testid="analytics-reporting"]').click();
    cy.get('[data-testid="report-filters"]').within(() => {
      cy.get('input[name="startDate"]').type('2024-01-01');
      cy.get('input[name="endDate"]').type('2024-03-20');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="report-content"]').should('be.visible');
  });

  it('should handle audit logs', () => {
    cy.get('[data-testid="audit-logs"]').click();
    cy.get('[data-testid="log-list"]').within(() => {
      cy.get('[data-testid="log-item"]').should('have.length.at.least', 1);
    });

    // Test log filtering
    cy.get('[data-testid="log-filter"]').select('user_management');
    cy.get('[data-testid="log-item"]').should('have.length.at.least', 1);
  });

  it('should handle backup management', () => {
    cy.get('[data-testid="backup-management"]').click();
    cy.get('[data-testid="backup-list"]').within(() => {
      cy.get('[data-testid="backup-item"]').should('have.length.at.least', 1);
    });

    // Test backup creation
    cy.get('[data-testid="create-backup"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle API management', () => {
    cy.get('[data-testid="api-management"]').click();
    cy.get('[data-testid="api-list"]').within(() => {
      cy.get('[data-testid="api-item"]').should('have.length.at.least', 1);
    });

    // Test API key generation
    cy.get('[data-testid="generate-key"]').click();
    cy.get('[data-testid="api-key"]').should('be.visible');
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
    // Test invalid user search
    cy.get('[data-testid="user-management"]').click();
    cy.get('[data-testid="user-search"]').type('nonexistent@example.com');
    cy.get('[data-testid="no-results"]').should('be.visible');
  });

  it('should maintain state after page refresh', () => {
    cy.get('[data-testid="user-management"]').click();
    cy.get('[data-testid="user-search"]').type('test@example.com');
    cy.reload();
    cy.get('[data-testid="user-search"]').should('have.value', 'test@example.com');
  });
}); 