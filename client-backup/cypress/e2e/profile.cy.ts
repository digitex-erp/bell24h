describe('User Profile', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/profile');
  });

  it('should display user information', () => {
    cy.get('[data-testid="user-info"]').within(() => {
      cy.get('[data-testid="user-name"]').should('be.visible');
      cy.get('[data-testid="user-email"]').should('be.visible');
      cy.get('[data-testid="user-company"]').should('be.visible');
      cy.get('[data-testid="user-role"]').should('be.visible');
    });
  });

  it('should handle profile updates', () => {
    cy.get('[data-testid="edit-profile-button"]').click();
    cy.get('[data-testid="profile-form"]').within(() => {
      cy.get('input[name="name"]').clear().type('Updated Name');
      cy.get('input[name="phone"]').clear().type('9876543210');
      cy.get('input[name="company"]').clear().type('Updated Company');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle password change', () => {
    cy.get('[data-testid="change-password-button"]').click();
    cy.get('[data-testid="password-form"]').within(() => {
      cy.get('input[name="currentPassword"]').type('password123');
      cy.get('input[name="newPassword"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('NewPassword123!');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle profile picture upload', () => {
    cy.get('[data-testid="upload-photo"]').attachFile('profile-picture.jpg');
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle notification preferences', () => {
    cy.get('[data-testid="notification-settings"]').click();
    cy.get('[data-testid="notification-form"]').within(() => {
      cy.get('input[name="emailNotifications"]').check();
      cy.get('input[name="smsNotifications"]').uncheck();
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle company information', () => {
    cy.get('[data-testid="company-info"]').within(() => {
      cy.get('[data-testid="company-name"]').should('be.visible');
      cy.get('[data-testid="company-address"]').should('be.visible');
      cy.get('[data-testid="company-phone"]').should('be.visible');
    });
  });

  it('should handle document uploads', () => {
    cy.get('[data-testid="upload-documents"]').within(() => {
      cy.get('input[type="file"]').attachFile('document.pdf');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle activity history', () => {
    cy.get('[data-testid="activity-history"]').within(() => {
      cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
    });
  });

  it('should handle security settings', () => {
    cy.get('[data-testid="security-settings"]').click();
    cy.get('[data-testid="security-form"]').within(() => {
      cy.get('input[name="twoFactorAuth"]').check();
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle account deletion', () => {
    cy.get('[data-testid="delete-account"]').click();
    cy.get('[data-testid="delete-confirmation"]').within(() => {
      cy.get('input[name="confirmDelete"]').type('DELETE');
      cy.get('button[type="submit"]').click();
    });
    cy.url().should('include', '/login');
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
    // Test invalid profile update
    cy.get('[data-testid="edit-profile-button"]').click();
    cy.get('[data-testid="profile-form"]').within(() => {
      cy.get('input[name="email"]').clear().type('invalid-email');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should maintain state after page refresh', () => {
    cy.get('[data-testid="edit-profile-button"]').click();
    cy.get('[data-testid="profile-form"]').within(() => {
      cy.get('input[name="name"]').clear().type('Test Name');
    });
    cy.reload();
    cy.get('[data-testid="profile-form"]')
      .find('input[name="name"]')
      .should('have.value', 'Test Name');
  });
}); 