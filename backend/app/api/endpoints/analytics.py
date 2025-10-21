from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.services.analytics_service import AnalyticsService
from typing import Optional

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_analytics(
    timeframe: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get all analytics data for the dashboard
    """
    return await AnalyticsService.get_dashboard_metrics(db, timeframe)

@router.get("/rfq-metrics")
async def get_rfq_metrics(
    timeframe: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get RFQ-specific metrics
    """
    metrics = await AnalyticsService.get_dashboard_metrics(db, timeframe)
    return metrics["rfqMetrics"]

@router.get("/supplier-metrics")
async def get_supplier_metrics(
    timeframe: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get supplier-specific metrics
    """
    metrics = await AnalyticsService.get_dashboard_metrics(db, timeframe)
    return metrics["supplierMetrics"]

@router.get("/market-trends")
async def get_market_trends(
    timeframe: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get market trends data
    """
    metrics = await AnalyticsService.get_dashboard_metrics(db, timeframe)
    return metrics["marketTrends"]

@router.get("/category-distribution")
async def get_category_distribution(
    timeframe: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get category distribution data
    """
    metrics = await AnalyticsService.get_dashboard_metrics(db, timeframe)
    return metrics["categoryDistribution"]
