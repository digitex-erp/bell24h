"""
Simplified API Server for Bell24h

This module provides a stripped-down version of the main API server
for testing specific features without requiring the full backend.
"""

import json
import logging
import sys
import os
import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional

# Add the root directory to the path so we can import the backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.ai.supplier_performance import (
    get_performance_heatmap_data,
    get_supplier_comparison,
    get_supplier_metric_history,
    PERFORMANCE_METRICS,
    INDUSTRY_CATEGORIES,
    REGIONS
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Bell24h API (Simplified)",
    description="Simplified API for Bell24h.com - Testing Features",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Supplier Performance API Endpoints ===

@app.get("/api/supplier-performance/metadata")
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

@app.get("/api/supplier-performance/heatmap")
async def heatmap_data(
    industry: Optional[str] = None,
    region: Optional[str] = None,
    min_suppliers: int = Query(20, ge=5, le=100),
    max_suppliers: int = Query(50, ge=10, le=200),
    metrics: Optional[List[str]] = Query(None)
):
    """
    Get heatmap data for supplier performance visualization.
    """
    data = await get_performance_heatmap_data(
        industry=industry,
        region=region,
        min_suppliers=min_suppliers,
        max_suppliers=max_suppliers,
        metrics=metrics
    )
    return data

@app.get("/api/supplier-performance/comparison")
async def supplier_comparison(
    supplier_ids: List[str] = Query(..., min_length=2, max_length=10),
    metrics: Optional[List[str]] = Query(None)
):
    """
    Compare performance metrics across selected suppliers.
    """
    data = await get_supplier_comparison(
        supplier_ids=supplier_ids,
        metrics=metrics
    )
    return data

@app.get("/api/supplier-performance/time-series")
async def time_series_data(
    supplier_id: str,
    metric: str,
    period: str = Query("monthly", regex="^(daily|weekly|monthly)$"),
    num_periods: int = Query(12, ge=3, le=36)
):
    """
    Get time-series performance data for a specific supplier and metric.
    """
    data = await get_supplier_metric_history(
        supplier_id=supplier_id,
        metric=metric,
        period=period,
        num_periods=num_periods
    )
    return data

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "Bell24h API (Simplified)"}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Bell24h API (Simplified)",
        "version": "0.1.0",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "backend.simplified_server:app",
        host="0.0.0.0",
        port=5002,
        reload=True
    )