## Purpose
This file gives concise, actionable guidance for AI coding agents (Copilot-like assistants) working in the Bell24h monorepo. Focus on immediate productivity: where code lives, how to run it, common patterns, and examples to follow.

## Big picture
- Backend: `backend/` — FastAPI application providing the API surface. Primary entrypoints:
  - `backend/main.py` (simple dev entry) and `backend/app/main.py` (real app using `app.api.api_v1.api`).
  - API routers live in `backend/app/api/` (see `endpoints/` and `docs/` for examples).
- Frontend: `frontend/` — Next.js (v14) app. Dev commands are in `frontend/package.json` (scripts: `dev`, `build`, `start`, `lint`).
- AI/ML pieces: `ai/` (if present) and `backend` import lines reference transformers, sentence-transformers, SHAP/LIME. Keep heavy model changes isolated to `backend` or a dedicated `ai/` module.
- Data/infra: Supabase (used from `frontend/lib/supabase.ts`), Postgres + SQLAlchemy on the backend (`requirements.txt`).

## Quick dev commands
- Backend install (from repo root):
  - pip: `pip install -r backend/requirements.txt`
  - Run FastAPI dev server (preferred entry): `uvicorn app.main:app --reload` from `backend/` (this uses `backend/app/main.py`).
- Frontend:
  - `cd frontend && npm install` then `npm run dev` (Next.js dev server).

## Auth, API, and conventions
- Authentication: JWT everywhere; include `Authorization: Bearer <token>` header for protected endpoints. See OpenAPI customization in `backend/app/main.py` for docs and examples.
- API versioning: routers are included with `prefix='/api/v1'`. New endpoints should be registered under `backend/app/api/` and follow existing router patterns (see `endpoints/` files such as `wallet.py`, `dispute.py`).
- CORS: configured in `backend/app/main.py` via `settings.CORS_ORIGINS`.

## Patterns and idioms to follow
- Pydantic models and FastAPI routers: Use `pydantic.BaseModel` in `backend/app/api/schemas` and return consistent response shapes (see `backend/app/api/docs/*.py` and `docs/api/README.md`).
- Middleware: Subscription-related logic is implemented as `SubscriptionMiddleware` under `backend/app/middleware/subscription.py` — prefer middleware for cross-cutting concerns (rate-limits, subscription checks).
- Payments & external services: Razorpay integration is encapsulated in `backend/app/services/razorpay_service.py` and similar service modules; prefer adding integrations as service modules rather than spreading logic across routers.
- AI explainability: SHAP/LIME references appear in backend code and docs; when adding model explainability, keep explanation generation alongside model inference so the returned match objects include an `explanation` field (see example `SupplierMatch` in `backend/main.py`).

## File examples to reference when editing/adding code
- Add new API endpoints: mirror style in `backend/app/api/endpoints/*.py` (function names, pydantic schemas in `backend/app/schemas/`).
- Wallet flows: `backend/app/api/endpoints/wallet.py` and `docs/api/README.md` show consistent request/response shapes.
- RFQ and matching: inspect `backend/app/api/endpoints/matching.py` and `backend/app/services/matching.py` for existing match patterns. Use `SupplierMatch`-like shapes: supplier_id, match_score, explanation, gst_compliant.

## Tests and linting
- There are no project-level tests detected in the workspace. If you add tests, place them under `backend/tests/` or `frontend/__tests__/` and use pytest for backend. Keep tests focused (unit + small integration) and mock external services (Razorpay, Supabase).
- Frontend linting uses `next lint`. Preserve existing ESLint/TypeScript conventions.

## External integrations and side effects
- Supabase: frontend calls `frontend/src/lib/supabase.ts`. Avoid schema changes that break the client without updating this file.
- Razorpay, AWS S3 (via `boto3`), and M1 Exchange integration exist in `backend/app/services/`. Mock these when running local tests.

## When editing ML/AI code
- Keep heavy model assets out of repo — use model loaders that fetch from HF or local model store. Prefer lazy-loading (on first request) to reduce startup time.
- Return human-friendly explanations in match responses and include numeric `match_score` and `explanation` fields (see `backend/main.py` example).

## Safety and deployment notes
- Do not hardcode secrets. Environment variables are used (see `python-dotenv` in `backend/requirements.txt`). If you add vars, document them in `backend/.env.example`.

## Small actionable examples
- Add a GET health endpoint in v1 style:
  - file: `backend/app/api/endpoints/health.py`
  - router prefix: include it in `backend/app/api/api_v1/api.py`
  - follow `@router.get('/health')` and return `{ 'status': 'healthy', 'version': '1.0.0' }`.

## What not to do
- Don't move auth or payment logic into UI code. Keep payments and security-sensitive flows only in `backend/` services.
- Avoid adding large binary model files to the repo.

## If unsure — quick references
- API surface and examples: `docs/api/README.md`
- Main backend app wiring: `backend/app/main.py`
- Frontend app entry: `frontend/src/app/page.tsx` and `frontend/package.json` scripts.

---
If you'd like, I can iterate on wording or add a short checklist for PR reviewers (what to run & what to check). What should I clarify or expand next?
