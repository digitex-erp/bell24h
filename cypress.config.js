const path = require('path')

module.exports = {
  e2e: {
    // No baseUrl; tests can use absolute file:// URLs if needed.
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}'
  },
  video: false,
}
