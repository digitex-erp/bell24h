from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.subscription import SubscriptionTier, SubscriptionStatus

class SubscriptionBase(BaseModel):
    tier: SubscriptionTier
    status: SubscriptionStatus
    start_date: datetime
    end_date: datetime
    amount: Optional[float] = None
    currency: str = "INR"

class SubscriptionCreate(SubscriptionBase):
    user_id: int
    payment_method: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    tier: Optional[SubscriptionTier] = None
    status: Optional[SubscriptionStatus] = None
    end_date: Optional[datetime] = None
    amount: Optional[float] = None
    payment_method: Optional[str] = None

class SubscriptionInDB(SubscriptionBase):
    id: int
    user_id: int
    rfq_count: int
    ai_matches_count: int
    last_billing_date: Optional[datetime]
    next_billing_date: Optional[datetime]
    payment_method: Optional[str]

    class Config:
        orm_mode = True

class SubscriptionUsage(BaseModel):
    tier: SubscriptionTier
    rfq_usage: dict
    ai_matches_usage: dict
    days_remaining: int
