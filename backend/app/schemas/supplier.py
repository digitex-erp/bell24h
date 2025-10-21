from pydantic import BaseModel, Field
from typing import List, Optional

class SupplierBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=20)
    categories: List[str]
    subcategories: List[str]
    specialties: str = Field(..., min_length=20)
    certifications: Optional[List[str]] = []
    location: str

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    company_name: Optional[str] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    subcategories: Optional[List[str]] = None
    specialties: Optional[str] = None
    certifications: Optional[List[str]] = None
    location: Optional[str] = None

class Supplier(SupplierBase):
    id: int
    user_id: int
    embedding: Optional[List[float]] = None

    class Config:
        from_attributes = True

class SupplierMatch(BaseModel):
    supplier: Supplier
    score: float
    category_match: bool
    subcategory_match: bool

    class Config:
        from_attributes = True
