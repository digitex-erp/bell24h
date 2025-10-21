from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class QuotationAttachmentBase(BaseModel):
    file_name: str
    file_type: str
    description: Optional[str] = None

class QuotationAttachmentCreate(QuotationAttachmentBase):
    file_url: str

class QuotationAttachment(QuotationAttachmentBase):
    id: int
    quotation_id: int
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuotationBase(BaseModel):
    unit_price: Decimal = Field(..., ge=0, decimal_places=2)
    total_price: Decimal = Field(..., ge=0, decimal_places=2)
    currency: str = Field(default="INR")
    delivery_time: int = Field(..., gt=0)
    delivery_terms: str
    warranty_period: str
    payment_terms: str
    validity_period: int = Field(..., gt=0)
    technical_specifications: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    notes: Optional[str] = None

    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ['INR', 'USD', 'EUR', 'GBP']
        if v not in allowed_currencies:
            raise ValueError(f'Currency must be one of {allowed_currencies}')
        return v

class QuotationCreate(QuotationBase):
    rfq_id: int
    attachments: Optional[List[QuotationAttachmentCreate]] = []

class QuotationUpdate(QuotationBase):
    unit_price: Optional[Decimal] = None
    total_price: Optional[Decimal] = None
    currency: Optional[str] = None
    delivery_time: Optional[int] = None
    delivery_terms: Optional[str] = None
    warranty_period: Optional[str] = None
    payment_terms: Optional[str] = None
    validity_period: Optional[int] = None

class Quotation(QuotationBase):
    id: int
    rfq_id: int
    supplier_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    attachments: List[QuotationAttachment] = []

    class Config:
        from_attributes = True
