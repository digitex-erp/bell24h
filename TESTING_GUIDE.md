# Testing Guide for Bell24H.com

## 1. Playwright End-to-End (E2E) Testing

- All E2E tests are located in the `e2e/` or `tests/` directory.
- To run Playwright tests:
  ```bash
  npx playwright test
  ```
- Example test file: `tests/ai-explainability.spec.ts`

## 2. Integration Testing (Supertest)

- Integration tests should be placed in `tests/integration/`.
- Example for `/api/escrow/release`:
  ```typescript
  import request from 'supertest';
  import app from '../src/app';

  describe('POST /api/escrow/release', () => {
    it('should release escrow with valid data', async () => {
      const res = await request(app)
        .post('/api/escrow/release')
        .send({ /* payload */ });
      expect(res.statusCode).toBe(200);
    });
  });
  ```

## 3. Accessibility Testing (jest-axe)

- Accessibility tests are written using `jest-axe`.
- Example:
  ```typescript
  import { axe, toHaveNoViolations } from 'jest-axe';
  expect.extend(toHaveNoViolations);
  // ...test code
  ```

## 4. Performance Testing (k6/Lighthouse)

- Performance tests are not yet set up. See `PENDING_TASKS.md` for instructions.

## 5. Running All Tests

- To run all tests:
  ```bash
  npm test
  ```

---

For more details, see each tool's documentation or contact the engineering team.
