describe('Smoke', () => {
  it('visits static test page and finds heading', () => {
  // Visit the static file by relative path from project root (Cypress supports this)
  cy.visit('public/test.html')
    cy.get('#ok').should('contain.text', 'Cypress smoke test page')
  })
})
