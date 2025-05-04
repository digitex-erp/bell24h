"""
Supplier Performance API Routes

This module provides API endpoints for supplier performance visualizations,
including heatmaps, comparisons, and time-series data.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.ai.supplier_performance import (
    get_performance_heatmap_data,
    get_supplier_comparison,
    get_supplier_metric_history,
    PERFORMANCE_METRICS,
    INDUSTRY_CATEGORIES,
    REGIONS
)

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