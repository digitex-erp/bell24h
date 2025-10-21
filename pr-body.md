Stabilize live E2E with same-origin dev server

Changes:
- backend/dev_server.py
  - Return consistent JSON envelope { "explanations": [...] } for demo/Cypress compatibility.
  - Use runtime SQLAlchemy DB read when DATABASE_URL exists; fall back to local JSON.
- public/ai-insights.html
  - Parse envelope, add data-testids for Cypress.
  - Improved error handling for fetch failures.
- cypress/e2e/shap-lime-integration.cy.js
  - Intercept/alias the explain API and stub responses in non-live mode.
  - Visit dev demo via baseUrl / fallback to 127.0.0.1:8002 for stable local runs.
  - Assert elements by data-testid and increase wait timeout.

Why:
- Fixes cross-origin and timing issues during Cypress live runs by serving the demo and API same-origin.
- Makes E2E runs stable for local and CI usage (mocked or live via LIVE_API).

Validation performed locally:
- Dev server health and explain endpoint tested on port 8002.
- Cypress headless live run passed against the dev server.
