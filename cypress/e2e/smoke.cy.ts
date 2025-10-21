describe('Smoke', () => {
  it('visits static test page and finds heading', () => {
    const fileUrl = `file:///C:/Project/Bell24h/public/test.html`
    cy.visit(fileUrl)
    cy.get('#ok').should('contain.text', 'Cypress smoke test page')
  })
})
