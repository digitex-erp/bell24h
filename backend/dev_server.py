from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from sqlalchemy import create_engine, text

# Import the ai endpoints router
try:
    from app.api.endpoints import ai as ai_endpoints
except Exception:
    ai_endpoints = None
import json
import os

# Lightweight local explainer for dev: reads backend/data/suppliers.json and returns
# a simplified explanations list matching the demo page and Cypress expectations.
def _local_explain_from_json(supplier_id: int):
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'suppliers.json')
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            suppliers = json.load(f)
    except Exception:
        # Default mock if file is missing
        suppliers = []

    supplier = next((s for s in suppliers if int(s.get('id', -1)) == int(supplier_id)), None)
    if supplier is None:
        # If not found, return deterministic default explanations
        vals = [0.25, 0.25, 0.25, 0.25]
    else:
        # Map the first four features to friendly names
        vals = [
            float(supplier.get('feature_0', 0.25)),
            float(supplier.get('feature_1', 0.25)),
            float(supplier.get('feature_2', 0.25)),
            float(supplier.get('feature_3', 0.25)),
        ]

    feature_names = ['price', 'delivery', 'quality', 'compliance']
    explanations = [
        { 'feature': name, 'importance': float(val), 'contribution': 'positive' if val >= 0 else 'negative' }
        for name, val in zip(feature_names, vals)
    ]
    return explanations

app = FastAPI(title="Bell24h Dev Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend assets from the repo `public/` directory so the demo is same-origin
public_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'public'))
if os.path.isdir(public_dir):
    app.mount('/public', StaticFiles(directory=public_dir), name='public')

@app.get("/api/health")
async def health():
    return {"status": "healthy", "version": "dev"}

if ai_endpoints and hasattr(ai_endpoints, 'router'):
    app.include_router(ai_endpoints.router, prefix="/api/v1/ai")


@app.post('/api/v1/ai/explain-match/{supplier_id}')
async def explain_match_demo(supplier_id: int):
    """Lightweight unauthenticated explain endpoint for local dev/demo.

    This bypasses database/auth dependencies used in the full router so the
    static demo page and Cypress can call it directly.
    """
    # If a DATABASE_URL is configured, attempt a minimal DB read here (avoid
    # importing app.services.ai_services to prevent optional heavy deps at import).
    db_url = getattr(settings, 'DATABASE_URL', None)
    if db_url:
        try:
            engine = create_engine(db_url)
            with engine.connect() as conn:
                stmt = text("SELECT feature_0, feature_1, feature_2, feature_3 FROM suppliers WHERE id = :id")
                res = conn.execute(stmt, {"id": supplier_id})
                row = res.fetchone()
                if row:
                    vals = [float(row[0]), float(row[1]), float(row[2]), float(row[3])]
                    feature_names = ['price', 'delivery', 'quality', 'compliance']
                    explanations = [
                        { 'feature': name, 'importance': float(val), 'contribution': 'positive' if val >= 0 else 'negative' }
                        for name, val in zip(feature_names, vals)
                    ]
                    # return a consistent envelope expected by the demo page
                    return {"explanations": explanations}
        except Exception:
            # On any DB error, fall back to JSON path below
            pass

    try:
        explanations = _local_explain_from_json(supplier_id)
        return {"explanations": explanations}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000, reload=True)
