from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.api import deps
from app.services.ai_services import AIServices
from app.schemas.supplier import SupplierRisk
import numpy as np

router = APIRouter()

@router.post("/voice-rfq")
async def create_voice_rfq(
    audio: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Create RFQ from voice input
    """
    result = await AIServices.voice_to_rfq(audio.file)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result["data"]

@router.post("/supplier-risk/{supplier_id}")
async def get_supplier_risk(
    supplier_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Calculate risk score for a supplier
    """
    # Get supplier data (implement your actual data gathering logic)
    supplier_data = {
        "late_delivery_rate": 0.1,  # Example values
        "compliance_score": 0.9,
        "financial_stability": 0.85,
        "user_feedback": 0.95
    }
    
    result = AIServices.calculate_supplier_risk(supplier_data)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/market-trends/{industry}")
async def get_market_trends(
    industry: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get market trends for an industry
    """
    result = await AIServices.get_stock_trends(industry)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result["data"]

@router.post("/explain-match/{supplier_id}")
async def explain_supplier_match(
    supplier_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get explanation for supplier match
    """
    # Get supplier features (implement your actual feature extraction)
    supplier_features = np.array([[0.8, 0.9, 0.7, 0.85]])  # Example features
    # Use friendly feature names expected by the frontend/cypress mock
    feature_names = ["price", "delivery", "quality", "compliance"]
    
    result = AIServices.explain_supplier_match(supplier_features, feature_names)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result["explanations"]

@router.post("/predict-rfq-success/{rfq_id}")
async def predict_rfq_success(
    rfq_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Predict success probability for an RFQ
    """
    # Get RFQ data (implement your actual data gathering logic)
    rfq_data = {
        "category_demand": 0.8,
        "supplier_count": 15,
        "budget_range": 0.6,
        "deadline_buffer": 0.7
    }
    
    result = await AIServices.predict_rfq_success(rfq_data)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result["prediction"]
