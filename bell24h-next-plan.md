# Next Implementation Plan for BELL24h.com: Finalize SHAP/LIME Integration and Start User Login/Dashboard

You are an expert full-stack developer working on BELL24h.com, an AI-powered RFQ marketplace for Indian SMEs in beta (50 users, basic features, no payments). The goal is to finalize SHAP/LIME integration in the user dashboard, build public login/dashboard access, and prepare for revenue via a bootstrap strategy (3-month free beta, lifetime free plan with 1-2 RFQs/month, paid real RFQs by Month 4).

This document focuses on Step 1 (complete SHAP/LIME) and Step 2 (login/dashboard). Use it as a Copilot prompt in VS Code to generate code and PRs.

---

## Step 1 — Complete SHAP/LIME Integration (Priority)

Description
- Load a trained scikit-learn model in `backend/app/models/rfq_model.pkl` using `joblib`.
- Cache a SHAP explainer for the model to avoid recomputing on every request.
- Implement and standardize the explain API at `POST /api/v1/ai/explain-match/{supplier_id}` so it returns JSON:
  - `[{ feature: string, importance: number, contribution: 'positive'|'negative' }, ...]`
- Update frontend `frontend/src/app/dashboard/ai-insights/page.tsx` to call the live endpoint and render `ShapChart` + `LimeExplanation` with real data.
- Extend Cypress tests to optionally run against a live backend.

Estimated Effort: 1-3 days (1 developer)

Why it matters
- Delivering real explanations unlocks the product's core value: interpretable supplier matches for buyers.
- Enables data-driven testing and iteration for pricing and UX.

Potential issues / risks
- Model loading time and memory (use lazy load + caching; consider Redis if multiple processes).
- SHAP explainers can be large in-memory; use a cached singleton or Redis-backed object.
- CORS between Next.js dev server and FastAPI (use CORSMiddleware in `backend/app/main.py`).
- Missing model file in repo — provide a small synthetic model for dev.

Success metrics
- API: `POST /api/v1/ai/explain-match/1` returns 200 with JSON array of features.
- Frontend: AI Insights page renders bars and a LIME list using live data.
- Tests: Cypress integration test passes against live backend.

Files to edit/add
- `backend/app/services/ai_services.py` — model loader, SHAP explainer cache
- `backend/app/api/endpoints/ai.py` — ensure correct path and response shape
- `backend/app/models/train_sample_model.py` — (new) small trainer to create `rfq_model.pkl`
- `backend/requirements.txt` — add `joblib`, `shap`, `lime`, `numpy`, `pandas`
- `frontend/src/app/dashboard/ai-insights/page.tsx` — update fetch
- `cypress/e2e/shap-lime-integration.cy.js` — add option to run against live API

Code snippets (FastAPI) — add to `backend/app/services/ai_services.py`

```python
# Add imports
import os
import joblib
import numpy as np
import shap
from typing import List, Dict, Any
from threading import Lock

_MODEL_LOCK = Lock()
_explainer = None
_model = None

def _model_path() -> str:
    return os.path.join(os.path.dirname(__file__), '..', 'models', 'rfq_model.pkl')

def _load_model():
    global _model, _explainer
    if _model is None:
        with _MODEL_LOCK:
            if _model is None:
                path = _model_path()
                if not os.path.exists(path):
                    raise FileNotFoundError(f"Model file not found: {path}")
                _model = joblib.load(path)
                try:
                    _explainer = shap.TreeExplainer(_model)
                except Exception:
                    _explainer = shap.Explainer(_model)
    return _model, _explainer

def explain_supplier_match(supplier_features: np.ndarray, feature_names: List[str]) -> Dict[str, Any]:
    """Return SHAP-based explanations for the supplier_features array (1 x n_features)."""
    try:
        model, explainer = _load_model()
    except FileNotFoundError:
        # Fallback deterministic response so UI still works in dev
        return {
            "success": True,
            "explanations": [
                {"feature": name, "importance": float(0.1 + 0.05*i), "contribution": "positive"}
                for i, name in enumerate(feature_names)
            ]
        }

    # Compute SHAP values
    shap_vals = explainer.shap_values(supplier_features)
    if isinstance(shap_vals, list):
        vals = np.abs(np.array(shap_vals)).mean(axis=0)
    else:
        vals = np.abs(shap_vals).mean(axis=0)

    explanations = []
    for name, val in zip(feature_names, vals):
        explanations.append({
            "feature": name,
            "importance": float(val),
            "contribution": "positive" if val >= 0 else "negative"
        })

    # Sort by importance desc
    explanations = sorted(explanations, key=lambda x: x['importance'], reverse=True)
    return {"success": True, "explanations": explanations}
```

Code snippet (FastAPI endpoint) — `backend/app/api/endpoints/ai.py` — ensure it returns explanations directly

```python
@router.post('/explain-match/{supplier_id}')
async def explain_supplier_match(supplier_id: int, db: Session = Depends(deps.get_db)):
    supplier_features = np.array([[0.8, 0.9, 0.7, 0.85]])
    feature_names = ["category_match", "price_competitiveness", "delivery_speed", "quality_score"]

    result = AIServices.explain_supplier_match(supplier_features, feature_names)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get('error', 'explain failed'))
    return result['explanations']
```

Code snippet (trainer) — `backend/app/models/train_sample_model.py`

```python
# Simple trainer to create a model for dev
import joblib
from sklearn.ensemble import RandomForestRegressor
import numpy as np

X = np.random.rand(1000, 4)
# target roughly correlates with features
y = X.dot(np.array([0.4, 0.3, 0.2, 0.1])) + 0.05*np.random.randn(1000)
model = RandomForestRegressor(n_estimators=50)
model.fit(X, y)
joblib.dump(model, 'backend/app/models/rfq_model.pkl')
print('Saved model to backend/app/models/rfq_model.pkl')
```

Frontend code — `frontend/src/app/dashboard/ai-insights/page.tsx` (React / Next.js)

```tsx
'use client'
import React, { useEffect, useState } from 'react'
import ShapChart from '@/components/ShapChart'
import LimeExplanation from '@/components/LimeExplanation'

export default function AIInsightsPage(){
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  useEffect(()=>{
    fetch('/api/v1/ai/explain-match/1', { method: 'POST' })
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  if(error) return <div className="p-4">Error: {error}</div>
  if(!data) return <div className="p-4">Loading...</div>

  return (
    <div className="grid grid-cols-2 gap-4">
      <ShapChart explanations={data} />
      <LimeExplanation explanations={data} />
    </div>
  )
}
```

Cypress test changes — `cypress/e2e/shap-lime-integration.cy.js`

```js
// Add an environment flag to switch between mocked and live mode
const LIVE = Cypress.env('LIVE_API') === 'true'

it('renders SHAP/LIME (live or mock)', ()=>{
  if(!LIVE){
    cy.intercept('POST', '/api/v1/ai/explain-match/*', {
      statusCode: 200,
      body: [
        { feature: 'price_competitiveness', importance: 0.4, contribution: 'positive' },
        { feature: 'delivery_speed', importance: 0.3, contribution: 'positive' }
      ]
    })
  }
  cy.visit('/dashboard/ai-insights')
  cy.get('[data-cy=shap-chart]').should('exist')
  cy.get('[data-cy=lime-list]').should('exist')
})
```

Run instructions (dev)

```powershell
# Backend (from c:\Project\Bell24h\backend)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install joblib shap lime numpy pandas scikit-learn
uvicorn app.main:app --reload --port 8000

# Frontend (from c:\Project\Bell24h\frontend)
npm install
npm run dev

# Cypress (from repo root)
# Mocked test (default)
npx cypress run --spec "cypress/e2e/shap-lime-integration.cy.js"
# Live API test
npx cypress run --env LIVE_API=true --spec "cypress/e2e/shap-lime-integration.cy.js"
```

---

## Step 2 — Login and Dashboard Access (start after Step 1)

Description
- Add public `/login` page using Supabase (email/password). Use `supabase-js` client in `frontend/src/lib/supabase.ts` (already present in repo).
- Protect `/dashboard` routes with Supabase session checks (server-side or client-side).
- Add a small `/api/auth/callback` route if using OAuth providers.

Estimated Effort: 2-3 days (1 developer)

Why it matters
- Enables real users to sign up and use the product during beta. Unlocks RFQ creation and history.

Potential issues
- Supabase CORS/redirect URL configuration.
- Session persistence across SSR/CSR routes; prefer client-side protection using `useEffect` and redirect when session missing.

Code snippet (frontend login) — `frontend/src/app/login/page.tsx`

```tsx
'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage(){
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const onSubmit = async (e) =>{
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if(error) return setError(error.message)
    window.location.href = '/dashboard'
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={onSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="input" placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" placeholder="Password" />
        <button className="btn btn-primary mt-4">Login</button>
      </form>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  )
}
```

Protecting dashboard (client-side)

```tsx
// In frontend/src/app/dashboard/layout.tsx or page.tsx (client)
'use client'
import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }){
  const supabase = createClientComponentClient()
  const router = useRouter()
  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      if(!data.session) router.push('/login')
    })
  },[])
  return <>{children}</>
}
```

Cypress test (login) — `cypress/e2e/login.cy.js`

```js
it('logs in and shows dashboard', ()=>{
  cy.visit('/login')
  cy.get('input[placeholder=Email]').type('test@example.com')
  cy.get('input[placeholder=Password]').type('password')
  cy.get('button').contains('Login').click()
  cy.url().should('include', '/dashboard')
})
```

Run instructions (dev)

```powershell
# Ensure Supabase env vars in backend and frontend (.env.local)
# Start backend
uvicorn app.main:app --reload --port 8000
# Start frontend
npm run dev
# Run Cypress (after creating a test user in Supabase via SQL or API)
npx cypress open
```

---

## Gantt-style timeline (4-6 weeks)

| Week | Tasks |
|------|-------|
| 1    | Step 1: Model trainer, model file, explain API, frontend fetch, mocked Cypress pass |
| 2    | Step 1: Performance tuning (cache explainer), add Redis support if required, add unit tests |
| 3    | Step 2: Supabase login, onboarding flow, protected dashboard, RFQ creation form |
| 4    | Step 2: Payments wiring (KredX/Stripe sandbox), monitoring, security review |
| 5-6  | Polish, user testing, analytics, marketing prep, pricing & retention experiments |

---

## Final notes & next actions
1. Copy this file to VS Code (`bell24h-next-plan.md`) and open it in the Copilot chat or use it as a prompt in-file.
2. I can implement Step 1 automatically now: add the trainer script, update `ai_services.py`, update `ai.py`, update frontend fetch, add Cypress live test flag, and run unit tests. Choose:
   - A: Make code changes and add sample model + tests now.
   - B: Only generate the Copilot prompt (this file) and let you run Copilot locally.

If you want me to proceed with A (apply the changes now), confirm and I'll continue with the edits and run tests. If B, this file is ready to paste into Copilot or save for later.
