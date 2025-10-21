from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.subscription import Subscription, SubscriptionTier, SubscriptionStatus
from app.schemas.subscription import SubscriptionCreate, SubscriptionUpdate
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

@router.get("/subscription/current")
def get_current_subscription(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get current user's subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    
    if not subscription:
        # Create free tier subscription
        subscription = Subscription(
            user_id=current_user.id,
            tier=SubscriptionTier.FREE,
            status=SubscriptionStatus.ACTIVE,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30)
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
    
    return subscription

@router.post("/subscription/upgrade")
def upgrade_subscription(
    tier: SubscriptionTier,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Upgrade subscription to a new tier"""
    current_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    
    if not current_subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    # Calculate pricing
    pricing = {
        SubscriptionTier.FREE: 0,
        SubscriptionTier.BASIC: 999,
        SubscriptionTier.PREMIUM: 2499,
        SubscriptionTier.ENTERPRISE: None  # Custom pricing
    }
    
    if tier == SubscriptionTier.ENTERPRISE:
        raise HTTPException(
            status_code=400,
            detail="Please contact sales for enterprise pricing"
        )
    
    # Update subscription
    current_subscription.tier = tier
    current_subscription.amount = pricing[tier]
    current_subscription.start_date = datetime.utcnow()
    current_subscription.end_date = datetime.utcnow() + timedelta(days=30)
    current_subscription.last_billing_date = datetime.utcnow()
    current_subscription.next_billing_date = datetime.utcnow() + timedelta(days=30)
    
    db.commit()
    db.refresh(current_subscription)
    
    return current_subscription

@router.post("/subscription/cancel")
def cancel_subscription(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Cancel current subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    subscription.status = SubscriptionStatus.CANCELLED
    db.commit()
    
    return {"message": "Subscription cancelled successfully"}

@router.get("/subscription/usage")
def get_subscription_usage(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get current subscription usage"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    # Get usage limits
    limits = {
        SubscriptionTier.FREE: {
            "rfq_limit": 5,
            "ai_matches_limit": 10
        },
        SubscriptionTier.BASIC: {
            "rfq_limit": 25,
            "ai_matches_limit": 50
        },
        SubscriptionTier.PREMIUM: {
            "rfq_limit": float('inf'),
            "ai_matches_limit": float('inf')
        },
        SubscriptionTier.ENTERPRISE: {
            "rfq_limit": float('inf'),
            "ai_matches_limit": float('inf')
        }
    }
    
    current_limits = limits[subscription.tier]
    
    return {
        "tier": subscription.tier,
        "rfq_usage": {
            "used": subscription.rfq_count,
            "limit": current_limits["rfq_limit"]
        },
        "ai_matches_usage": {
            "used": subscription.ai_matches_count,
            "limit": current_limits["ai_matches_limit"]
        },
        "days_remaining": (subscription.end_date - datetime.utcnow()).days
    }
