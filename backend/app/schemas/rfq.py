from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

class RFQAttachmentBase(BaseModel):
    file_name: str
    file_type: str

class RFQAttachmentCreate(RFQAttachmentBase):
    file_url: str

class RFQAttachment(RFQAttachmentBase):
    id: int
    rfq_id: int
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True

class RFQBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    category: str
    subcategory: str
    quantity: int = Field(..., gt=0)
    unit: str
    budget: Decimal = Field(..., ge=0, decimal_places=2)
    deadline: datetime
    delivery_location: str

class RFQCreate(RFQBase):
    attachments: Optional[List[RFQAttachmentCreate]] = []

class RFQ(RFQBase):
    id: int
    status: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    attachments: List[RFQAttachment] = []

    class Config:
        from_attributes = True
