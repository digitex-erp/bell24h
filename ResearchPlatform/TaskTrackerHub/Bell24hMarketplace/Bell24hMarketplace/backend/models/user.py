from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    """Base model for user data"""
    email: EmailStr
    name: str
    role: str = Field(..., description="User role - 'buyer', 'supplier', or 'admin'")
    company: str

class UserCreate(UserBase):
    """Model for user registration"""
    password: str = Field(..., min_length=8)
    gstin: Optional[str] = Field(None, description="GSTIN required for suppliers")
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ["buyer", "supplier", "admin"]:
            raise ValueError("Role must be 'buyer', 'supplier', or 'admin'")
        return v
    
    @validator('gstin')
    def validate_gstin(cls, v, values):
        if values.get('role') == 'supplier' and not v:
            raise ValueError("GSTIN is required for suppliers")
        
        if v and len(v) != 15:
            raise ValueError("GSTIN must be 15 characters long")
        
        return v

class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    """Model for user profile data"""
    id: str
    name: str
    email: EmailStr
    role: str
    company: str
    gstin: Optional[str] = None
    is_verified: bool = False
    wallet_balance: float = 0
    city: Optional[str] = None
    state: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserResponse(BaseModel):
    """Model for user data returned to client"""
    id: str
    email: EmailStr
    name: str
    role: str
    company: str
