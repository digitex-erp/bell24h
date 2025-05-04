"""
Supplier Performance API Routes

This module provides API endpoints for supplier performance visualizations,
including heatmaps, comparisons, and time-series data.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta
from backend.ai.supplier_performance import (
    get_performance_heatmap_data,
    get_supplier_comparison,
    get_supplier_metric_history,
    PERFORMANCE_METRICS,
    INDUSTRY_CATEGORIES,
    REGIONS
)
from ..models.supplier import Supplier
from ..models.rfq import RFQ
from ..database import get_db
from sqlalchemy.orm import Session
import numpy as np


router = APIRouter(
    prefix="/api/supplier-performance",
    tags=["supplier_performance"],
    responses={404: {"description": "Not found"}},
)

# Models for request/response validation

class HeatmapDataResponse(BaseModel):
    suppliers: List[dict]
    metrics: List[str]
    industry_averages: dict
    metadata: dict

class SupplierComparisonResponse(BaseModel):
    suppliers: List[dict]
    metrics: List[str]
    averages: dict

class TimeSeriesDataResponse(BaseModel):
    supplier_id: str
    metric: str
    period: str
    time_points: List[str]
    values: List[float]

# API endpoints

@router.get("/metadata", response_model=dict)
async def get_metadata():
    """
    Get metadata for supplier performance analysis including
    available metrics, industries, and regions.
    """
    return {
        "metrics": PERFORMANCE_METRICS,
        "industries": INDUSTRY_CATEGORIES,
        "regions": REGIONS
    }

@router.get("/heatmap", response_model=HeatmapDataResponse)
async def heatmap_data(
    industry: Optional[str] = None,
    region: Optional[str] = None,
    min_suppliers: int = Query(20, ge=5, le=100),
    max_suppliers: int = Query(50, ge=10, le=200),
    metrics: Optional[List[str]] = Query(None)
):
    """
    Get heatmap data for supplier performance visualization.

    Parameters:
    - industry: Optional filter by industry category
    - region: Optional filter by geographical region
    - min_suppliers: Minimum number of suppliers to include
    - max_suppliers: Maximum number of suppliers to include
    - metrics: Optional list of metrics to include
    """
    try:
        # Validate industry if provided
        if industry and industry not in INDUSTRY_CATEGORIES:
            raise HTTPException(status_code=400, detail=f"Invalid industry: {industry}")

        # Validate region if provided
        if region and region not in REGIONS:
            raise HTTPException(status_code=400, detail=f"Invalid region: {region}")

        # Validate metrics if provided
        if metrics:
            invalid_metrics = [m for m in metrics if m not in PERFORMANCE_METRICS]
            if invalid_metrics:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid metrics: {', '.join(invalid_metrics)}"
                )

        # Get the data
        data = await get_performance_heatmap_data(
            industry=industry,
            region=region,
            min_suppliers=min_suppliers,
            max_suppliers=max_suppliers,
            metrics=metrics
        )

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/comparison", response_model=SupplierComparisonResponse)
async def supplier_comparison(
    supplier_ids: List[str] = Query(..., min_length=2, max_length=10),
    metrics: Optional[List[str]] = Query(None)
):
    """
    Compare performance metrics across selected suppliers.

    Parameters:
    - supplier_ids: List of supplier IDs to compare (2-10 suppliers)
    - metrics: Optional list of metrics to include
    """
    try:
        # Validate metrics if provided
        if metrics:
            invalid_metrics = [m for m in metrics if m not in PERFORMANCE_METRICS]
            if invalid_metrics:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid metrics: {', '.join(invalid_metrics)}"
                )

        # Get the comparison data
        data = await get_supplier_comparison(
            supplier_ids=supplier_ids,
            metrics=metrics
        )

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/time-series", response_model=TimeSeriesDataResponse)
async def time_series_data(
    supplier_id: str,
    metric: str,
    period: str = Query("monthly", regex="^(daily|weekly|monthly)$"),
    num_periods: int = Query(12, ge=3, le=36)
):
    """
    Get time-series performance data for a specific supplier and metric.

    Parameters:
    - supplier_id: The supplier ID
    - metric: The performance metric to analyze
    - period: Time period aggregation (daily, weekly, monthly)
    - num_periods: Number of periods to include (3-36)
    """
    try:
        # Validate metric
        if metric not in PERFORMANCE_METRICS:
            raise HTTPException(status_code=400, detail=f"Invalid metric: {metric}")

        # Get the time series data
        data = await get_supplier_metric_history(
            supplier_id=supplier_id,
            metric=metric,
            period=period,
            num_periods=num_periods
        )

        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# New endpoints from edited code

@router.get("/api/supplier/performance/{supplier_id}")
async def get_supplier_performance(
    supplier_id: int,
    time_period: str = "30d",
    db: Session = Depends(get_db)
):
    # Get supplier and their RFQ history
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    # Calculate time window
    now = datetime.utcnow()
    if time_period == "7d":
        start_date = now - timedelta(days=7)
    elif time_period == "30d":
        start_date = now - timedelta(days=30)
    elif time_period == "90d":
        start_date = now - timedelta(days=90)
    else:
        raise HTTPException(status_code=400, detail="Invalid time period")

    # Get RFQs in time period
    rfqs = db.query(RFQ).filter(
        RFQ.supplier_id == supplier_id,
        RFQ.created_at >= start_date
    ).all()

    # Calculate metrics
    total_rfqs = len(rfqs)
    won_rfqs = sum(1 for rfq in rfqs if rfq.status == "accepted")
    avg_response_time = np.mean([
        (rfq.response_time.total_seconds() / 3600) for rfq in rfqs if rfq.response_time
    ]) if rfqs else 0

    # Calculate win rate
    win_rate = (won_rfqs / total_rfqs * 100) if total_rfqs > 0 else 0

    return {
        "supplier_id": supplier_id,
        "metrics": {
            "total_rfqs": total_rfqs,
            "won_rfqs": won_rfqs,
            "win_rate": round(win_rate, 2),
            "avg_response_time_hours": round(avg_response_time, 2)
        },
        "time_period": time_period,
        "last_updated": now.isoformat()
    }

@router.get("/api/supplier/performance/compare")
async def compare_suppliers(
    supplier_ids: List[int],
    db: Session = Depends(get_db)
):
    performance_data = {}
    for supplier_id in supplier_ids:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            continue

        rfqs = db.query(RFQ).filter(RFQ.supplier_id == supplier_id).all()
        total_rfqs = len(rfqs)
        won_rfqs = sum(1 for rfq in rfqs if rfq.status == "accepted")

        performance_data[supplier_id] = {
            "name": supplier.name,
            "total_rfqs": total_rfqs,
            "won_rfqs": won_rfqs,
            "win_rate": round((won_rfqs / total_rfqs * 100) if total_rfqs > 0 else 0, 2)
        }

    return performance_data

@router.get("/analytics/overview", response_model=Dict[str, Any])
async def get_supplier_analytics_overview(
    supplier_id: str,
    time_period: str = Query("30d", regex="^(7d|30d|90d)$"),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics overview for a supplier"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    # Calculate time window
    now = datetime.utcnow()
    if time_period == "7d":
        start_date = now - timedelta(days=7)
    elif time_period == "30d":
        start_date = now - timedelta(days=30)
    else:  # 90d
        start_date = now - timedelta(days=90)

    # Get RFQs in time period
    rfqs = db.query(RFQ).filter(
        RFQ.supplier_id == supplier_id,
        RFQ.created_at >= start_date
    ).all()

    # Calculate core metrics
    total_rfqs = len(rfqs)
    won_rfqs = sum(1 for rfq in rfqs if rfq.status == "accepted")
    completed_rfqs = sum(1 for rfq in rfqs if rfq.status == "completed")
    response_times = [
        (rfq.response_time.total_seconds() / 3600) 
        for rfq in rfqs if rfq.response_time
    ]

    avg_response_time = np.mean(response_times) if response_times else 0
    win_rate = (won_rfqs / total_rfqs * 100) if total_rfqs > 0 else 0
    completion_rate = (completed_rfqs / won_rfqs * 100) if won_rfqs > 0 else 0

    return {
        "overview": {
            "total_rfqs": total_rfqs,
            "won_rfqs": won_rfqs,
            "completed_rfqs": completed_rfqs,
            "win_rate": round(win_rate, 2),
            "completion_rate": round(completion_rate, 2),
            "avg_response_time_hours": round(avg_response_time, 2)
        },
        "time_period": time_period,
        "last_updated": now.isoformat()
    }

@router.get("/metrics", response_model=SupplierMetrics)
async def get_supplier_metrics(current_user = Depends(get_current_user)):
    pass # Placeholder -  original function implementation needs to be added here.  This assumes SupplierMetrics is defined elsewhere.