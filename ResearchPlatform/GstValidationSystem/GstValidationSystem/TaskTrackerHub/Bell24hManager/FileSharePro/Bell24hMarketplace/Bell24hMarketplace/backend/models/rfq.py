from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class RFQBase(BaseModel):
    """Base model for RFQ data"""
    title: str
    description: str
    category: str
    quantity: int = Field(..., gt=0)
    budget: float = Field(..., gt=0)
    delivery_days: int = Field(..., gt=0)
    requirements: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str

class RFQCreate(RFQBase):
    """Model for creating a new RFQ"""
    pass

class RFQResponse(RFQBase):
    """Model for RFQ data returned to client"""
    id: str
    buyer_id: str
    buyer_name: str
    status: str
    created_at: datetime
    updated_at: datetime
    deadline: datetime
    bid_count: int = 0

class RFQDetail(RFQResponse):
    """Detailed RFQ model with additional fields"""
    selected_supplier_id: Optional[str] = None
    selected_supplier_name: Optional[str] = None
    completed_at: Optional[datetime] = None

class BidBase(BaseModel):
    """Base model for bid data"""
    price: float = Field(..., gt=0)
    delivery_days: int = Field(..., gt=0)
    notes: Optional[str] = None

class BidCreate(BidBase):
    """Model for creating a new bid"""
    pass

class BidResponse(BidBase):
    """Model for bid data returned to client"""
    id: str
    rfq_id: str
    supplier_id: str
    supplier_name: str
    status: str
    created_at: datetime
    updated_at: datetime
    rfq_title: str
    rfq_status: str
