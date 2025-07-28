describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should handle user registration', () => {
    cy.visit('/register');
    cy.get('[data-testid="register-form"]').within(() => {
      cy.get('input[name="email"]').type('newuser@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('input[name="companyName"]').type('Test Company');
      cy.get('input[name="phone"]').type('1234567890');
      cy.get('select[name="role"]').select('supplier');
      cy.get('button[type="submit"]').click();
    });
    cy.url().should('include', '/dashboard');
  });

  it('should handle user login', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-form"]').within(() => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });
    cy.url().should('include', '/dashboard');
  });

  it('should handle password reset', () => {
    cy.visit('/forgot-password');
    cy.get('[data-testid="reset-form"]').within(() => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle session management', () => {
    cy.login('test@example.com', 'password123');
    cy.visit('/dashboard');
    cy.reload();
    cy.url().should('include', '/dashboard');
  });

  it('should handle logout', () => {
    cy.login('test@example.com', 'password123');
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
  });

  it('should handle invalid credentials', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-form"]').within(() => {
      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpass');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should handle password validation', () => {
    cy.visit('/register');
    cy.get('[data-testid="register-form"]').within(() => {
      cy.get('input[name="password"]').type('weak');
      cy.get('input[name="confirmPassword"]').type('weak');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="password-error"]').should('be.visible');
  });

  it('should handle email verification', () => {
    cy.visit('/verify-email');
    cy.get('[data-testid="verification-form"]').within(() => {
      cy.get('input[name="code"]').type('123456');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle social login', () => {
    cy.visit('/login');
    cy.get('[data-testid="google-login"]').click();
    cy.origin('https://accounts.google.com', () => {
      cy.get('input[type="email"]').type('test@gmail.com');
      cy.get('button').contains('Next').click();
    });
  });

  it('should handle role-based access', () => {
    // Test supplier access
    cy.login('supplier@example.com', 'password123');
    cy.visit('/supplier-dashboard');
    cy.url().should('include', '/supplier-dashboard');

    // Test buyer access
    cy.login('buyer@example.com', 'password123');
    cy.visit('/buyer-dashboard');
    cy.url().should('include', '/buyer-dashboard');

    // Test admin access
    cy.login('admin@example.com', 'password123');
    cy.visit('/admin-dashboard');
    cy.url().should('include', '/admin-dashboard');
  });
}); 