














 ⚠ Port 3000 is in use, trying 3001 instead.
 ⚠ Port 3001 is in use, trying 3002 instead.
 ⚠ Port 3002 is in use, trying 3003 instead.
   ▲ Next.js 14.0.3
   - Local:        http://localhost:3003from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List, Optional
from pydantic import BaseModel
import transformers
import shap
import lime
from datetime import datetime

app = FastAPI(title="Bell24h API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RFQ(BaseModel):
    title: str
    description: str
    category: str
    budget: float
    deadline: datetime
    requirements: List[str]

class SupplierMatch(BaseModel):
    supplier_id: str
    match_score: float
    explanation: dict
    gst_compliant: bool

@app.get("/")
async def root():
    return {"message": "Welcome to Bell24h API"}

@app.post("/api/rfq/submit")
async def submit_rfq(rfq: RFQ):
    try:
        # TODO: Implement RFQ processing with HuggingFace
        return {"status": "success", "message": "RFQ submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suppliers/match/{rfq_id}")
async def match_suppliers(rfq_id: str):
    try:
        # TODO: Implement supplier matching with SHAP/LIME
        matches = []  # Will contain SupplierMatch objects
        return {"matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/gst/validate/{gstin}")
async def validate_gst(gstin: str):
    try:
        # TODO: Implement GST validation
        return {"valid": True, "business_name": "Example Business"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
