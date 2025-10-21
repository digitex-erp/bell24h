from fastapi import Request, HTTPException
from sqlalchemy.orm import Session
from app.models.subscription import Subscription, SubscriptionTier, SubscriptionStatus
from app.db.session import SessionLocal
from datetime import datetime
from typing import Dict, Any

class SubscriptionMiddleware:
    async def __call__(
        self,
        request: Request,
        call_next: Any
    ):
        # Skip middleware for non-API routes and subscription-related endpoints
        if not request.url.path.startswith("/api/v1") or \
           request.url.path.startswith("/api/v1/subscription"):
            return await call_next(request)

        # Get current user from request state
        user = getattr(request.state, "user", None)
        if not user:
            return await call_next(request)

        db = SessionLocal()
        try:
            # Get active subscription
            subscription = db.query(Subscription).filter(
                Subscription.user_id == user.id,
                Subscription.status == SubscriptionStatus.ACTIVE
            ).first()

            if not subscription:
                # Create free tier subscription
                subscription = Subscription(
                    user_id=user.id,
                    tier=SubscriptionTier.FREE,
                    status=SubscriptionStatus.ACTIVE,
                    start_date=datetime.utcnow()
                )
                db.add(subscription)
                db.commit()
                db.refresh(subscription)

            # Check usage limits
            await self._check_usage_limits(request, subscription)

            # Update usage counters
            if request.url.path.startswith("/api/v1/rfq"):
                subscription.rfq_count += 1
            elif request.url.path.startswith("/api/v1/ai"):
                subscription.ai_matches_count += 1

            db.commit()

            response = await call_next(request)
            return response

        finally:
            db.close()

    async def _check_usage_limits(
        self,
        request: Request,
        subscription: Subscription
    ):
        """Check if the request exceeds subscription limits"""
        # Define limits per tier
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

        # Check RFQ limits
        if request.url.path.startswith("/api/v1/rfq"):
            if subscription.rfq_count >= current_limits["rfq_limit"]:
                raise HTTPException(
                    status_code=403,
                    detail="RFQ limit reached for your subscription tier"
                )

        # Check AI matches limits
        elif request.url.path.startswith("/api/v1/ai"):
            if subscription.ai_matches_count >= current_limits["ai_matches_limit"]:
                raise HTTPException(
                    status_code=403,
                    detail="AI matches limit reached for your subscription tier"
                )
