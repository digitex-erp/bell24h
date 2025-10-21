from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class SubscriptionTier(str, enum.Enum):
    FREE = "FREE"
    BASIC = "BASIC"
    PREMIUM = "PREMIUM"
    ENTERPRISE = "ENTERPRISE"

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.FREE)
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    last_billing_date = Column(DateTime)
    next_billing_date = Column(DateTime)
    
    # Monthly usage tracking
    rfq_count = Column(Integer, default=0)
    ai_matches_count = Column(Integer, default=0)
    
    # Billing details
    amount = Column(Float)
    currency = Column(String, default="INR")
    payment_method = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    
    class Config:
        orm_mode = True
