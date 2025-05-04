"""
Simplified API Server for Bell24h

This module provides a stripped-down version of the main API server
for testing specific features without requiring the full backend.
"""

import json
import logging
import sys
import os
import random
import math
from typing import Dict, List, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import uvicorn
    from fastapi import FastAPI, Query
    from fastapi.middleware.cors import CORSMiddleware
except ImportError:
    logger.error("FastAPI or Uvicorn not installed. Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn"])
    import uvicorn
    from fastapi import FastAPI, Query
    from fastapi.middleware.cors import CORSMiddleware

# Performance metrics we track for suppliers
PERFORMANCE_METRICS = [
    "delivery_time",
    "quality_score",
    "price_competitiveness",
    "communication_responsiveness",
    "order_accuracy",
    "return_rate",
    "customer_satisfaction",
    "payment_terms_flexibility",
    "technical_specification_adherence",
    "warranty_policy",
    "gst_compliance"
]

# Industry categories for suppliers
INDUSTRY_CATEGORIES = [
    "Electronics",
    "Textiles",
    "Chemicals",
    "Automotive",
    "Pharmaceuticals",
    "Food Processing",
    "Construction Materials",
    "IT Services",
    "Machinery",
    "Furniture"
]

# Regions for suppliers
REGIONS = [
    "North India",
    "South India",
    "East India",
    "West India",
    "Central India",
    "Northeast India",
    "International"
]

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

# === Data Generation Functions ===

async def get_performance_heatmap_data(
    industry: Optional[str] = None,
    region: Optional[str] = None,
    min_suppliers: int = 20,
    max_suppliers: int = 50,
    metrics: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Generate heatmap data for supplier performance visualization.
    
    Args:
        industry: Filter by industry
        region: Filter by region
        min_suppliers: Minimum number of suppliers
        max_suppliers: Maximum number of suppliers
        metrics: List of metrics to include
        
    Returns:
        Dictionary with heatmap data
    """
    # Select metrics to use
    metrics_to_use = metrics if metrics else PERFORMANCE_METRICS
    
    # Filter industry category
    industries = [industry] if industry else INDUSTRY_CATEGORIES
    selected_industry = random.choice(industries)
    
    # Filter region
    regions = [region] if region else REGIONS
    selected_region = random.choice(regions)
    
    # Generate number of suppliers
    num_suppliers = random.randint(min_suppliers, max_suppliers)
    
    # Generate supplier data
    suppliers = []
    for i in range(1, num_suppliers + 1):
        supplier_id = f"SUPP{i:04d}"
        supplier_name = f"Supplier {i}"
        supplier_industry = selected_industry
        supplier_region = selected_region
        
        # Generate base performance profile for this supplier
        # This creates a realistic pattern where some suppliers are generally
        # good across all metrics, some are bad, and most are mixed
        base_performance = random.betavariate(2, 2)  # Beta distribution for more realistic distribution
        
        # Generate metric scores with some random variation around the base
        metric_scores = {}
        for metric in metrics_to_use:
            # Add some random variation around the base performance
            # Different metrics have different variance patterns
            if metric == "gst_compliance":
                # GST compliance is usually very high (regulatory requirement)
                score = min(1.0, base_performance * 1.3 + random.uniform(0.3, 0.6))
            elif metric == "delivery_time":
                # Delivery time has high variance
                score = max(0.1, min(1.0, base_performance + random.uniform(-0.3, 0.3)))
            elif metric == "price_competitiveness":
                # Price competitiveness is often inversely related to quality
                quality_factor = 1.0 - (metric_scores.get("quality_score", base_performance))
                score = max(0.1, min(1.0, quality_factor * 0.7 + random.uniform(0.0, 0.3)))
            else:
                # Other metrics vary somewhat around the base
                score = max(0.1, min(1.0, base_performance + random.uniform(-0.2, 0.2)))
            
            # Convert to a 0-100 scale for the UI
            metric_scores[metric] = round(score * 100)
        
        # Create supplier object
        supplier = {
            "id": supplier_id,
            "name": supplier_name,
            "industry": supplier_industry,
            "region": supplier_region,
            "metrics": metric_scores
        }
        
        suppliers.append(supplier)
    
    # Calculate industry averages
    industry_averages = {}
    for metric in metrics_to_use:
        total = sum(supplier["metrics"][metric] for supplier in suppliers)
        industry_averages[metric] = round(total / len(suppliers))
    
    # Prepare result structure
    result = {
        "suppliers": suppliers,
        "metrics": metrics_to_use,
        "industry_averages": industry_averages,
        "metadata": {
            "industry": selected_industry,
            "region": selected_region,
            "supplier_count": len(suppliers),
            "generated_at": "2025-04-02T12:00:00Z"  # Would use actual timestamp in production
        }
    }
    
    return result

async def get_supplier_comparison(
    supplier_ids: List[str],
    metrics: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    API function to compare performance across suppliers.
    
    Args:
        supplier_ids: List of supplier IDs to compare
        metrics: List of metrics to include
        
    Returns:
        Dictionary with comparison data
    """
    metrics_to_use = metrics if metrics else PERFORMANCE_METRICS
    
    # Generate synthetic data for each supplier
    suppliers = []
    for idx, supplier_id in enumerate(supplier_ids):
        # Generate a base profile for this supplier
        base_performance = random.betavariate(2, 2)
        
        # Generate metric scores
        metric_scores = {}
        for metric in metrics_to_use:
            # Add some random variation around the base performance
            score = max(0.1, min(1.0, base_performance + random.uniform(-0.2, 0.2)))
            # Convert to a 0-100 scale
            metric_scores[metric] = round(score * 100)
        
        supplier = {
            "id": supplier_id,
            "name": f"Supplier {idx + 1}",
            "metrics": metric_scores
        }
        
        suppliers.append(supplier)
    
    # Calculate averages
    averages = {}
    for metric in metrics_to_use:
        total = sum(supplier["metrics"][metric] for supplier in suppliers)
        averages[metric] = round(total / len(suppliers))
    
    # Prepare result
    result = {
        "suppliers": suppliers,
        "metrics": metrics_to_use,
        "averages": averages
    }
    
    return result

async def get_supplier_metric_history(
    supplier_id: str,
    metric: str,
    period: str = "monthly",
    num_periods: int = 12
) -> Dict[str, Any]:
    """
    API function to get historical performance for a supplier metric.
    
    Args:
        supplier_id: The supplier ID
        metric: The metric to analyze
        period: Time period aggregation
        num_periods: Number of periods
        
    Returns:
        Dictionary with time series data
    """
    if metric not in PERFORMANCE_METRICS:
        raise ValueError(f"Unknown metric: {metric}")
    
    # Generate base performance for this supplier
    base_performance = random.betavariate(2, 2) * 100
    
    # Generate time series data with a realistic trend
    time_points = []
    values = []
    
    # Add a realistic trend (gradual improvement or decline)
    trend_direction = random.choice([-1, 1])  # -1 for decline, 1 for improvement
    trend_magnitude = random.uniform(0.5, 2.0)  # How strong is the trend
    
    # Add some seasonality for realism
    seasonality_magnitude = random.uniform(2, 8)
    
    for i in range(num_periods):
        # Generate time point label based on period
        if period == "daily":
            time_point = f"Day {i+1}"
        elif period == "weekly":
            time_point = f"Week {i+1}"
        else:  # monthly
            time_point = f"Month {i+1}"
        
        # Calculate value with trend and seasonality
        trend_component = trend_direction * trend_magnitude * i / num_periods
        seasonality_component = math.sin(i / num_periods * 2 * math.pi) * seasonality_magnitude
        random_component = random.uniform(-5, 5)
        
        value = base_performance + trend_component * 20 + seasonality_component + random_component
        value = max(0, min(100, value))  # Clamp to 0-100 range
        
        time_points.append(time_point)
        values.append(round(value, 1))
    
    # Prepare result
    result = {
        "supplier_id": supplier_id,
        "metric": metric,
        "period": period,
        "time_points": time_points,
        "values": values
    }
    
    return result

# === API Endpoints ===

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
    logger.info("Starting Simplified API Server on port 5005...")
    uvicorn.run(
        "simplified_server:app",
        host="0.0.0.0",
        port=5005,
        log_level="info"
    )