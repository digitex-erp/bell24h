from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class SupplierBase(BaseModel):
    """Base model for supplier data"""
    id: str
    name: str
    company_name: str
    email: str
    gstin: Optional[str] = None
    is_gst_verified: bool = False

class SupplierDetail(SupplierBase):
    """Detailed supplier model with additional fields"""
    city: Optional[str] = None
    state: Optional[str] = None
    specializations: List[str] = []
    completion_rate: float = 0.0
    avg_delivery_days: float = 0.0
    rating: float = 0.0
    total_completed: int = 0
    price_competitiveness: str = "medium"  # "low", "medium", or "high"

class ShapValue(BaseModel):
    """Model for SHAP values explaining a supplier match"""
    name: str
    value: float
    explanation: str

class SupplierWithScore(SupplierDetail):
    """Supplier with AI match score and explanations"""
    match_score: float
    shap_values: List[ShapValue]

class SupplierBid(BaseModel):
    """Model for bids placed by a supplier"""
    id: str
    rfq_id: str
    price: float
    delivery_days: int
    notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    rfq_title: str
    rfq_status: str

class SupplierMetrics(BaseModel):
    """Model for supplier performance metrics"""
    completion_rate: float
    avg_rating: float
    avg_delivery_days: float
    total_completed: int
