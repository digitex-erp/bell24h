"""
Supplier Performance Analysis Module

This module provides functionality to analyze supplier performance across multiple dimensions
and generate data for heatmap visualizations.
"""

import json
import logging
import math
import random
from typing import Dict, List, Any, Optional, Tuple

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

class SupplierPerformanceAnalyzer:
    """
    Analyzes supplier performance data and generates heatmap visualizations.
    """
    
    def __init__(self, db_connector=None):
        """
        Initialize the analyzer with optional database connector.
        
        Args:
            db_connector: Optional database connector for retrieving real supplier data
        """
        self.db_connector = db_connector
        
    async def get_supplier_performance_heatmap_data(
        self, 
        industry: Optional[str] = None,
        region: Optional[str] = None,
        min_suppliers: int = 20,
        max_suppliers: int = 50,
        metric_subset: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate heatmap data for supplier performance visualization.
        
        In production, this would retrieve data from the database.
        For development, we generate synthetic data with realistic patterns.
        
        Args:
            industry: Filter by industry category
            region: Filter by geographical region
            min_suppliers: Minimum number of suppliers to include
            max_suppliers: Maximum number of suppliers to include
            metric_subset: Optional subset of metrics to include (defaults to all)
            
        Returns:
            Dictionary containing heatmap data structure
        """
        try:
            if self.db_connector:
                # In production, we'd retrieve real data
                return await self._get_real_supplier_performance_data(
                    industry, region, min_suppliers, max_suppliers, metric_subset
                )
            else:
                # For development, generate synthetic data with realistic patterns
                return self._generate_synthetic_performance_data(
                    industry, region, min_suppliers, max_suppliers, metric_subset
                )
                
        except Exception as e:
            logger.error(f"Error generating supplier performance data: {str(e)}")
            raise
            
    async def _get_real_supplier_performance_data(
        self,
        industry: Optional[str] = None,
        region: Optional[str] = None,
        min_suppliers: int = 20,
        max_suppliers: int = 50,
        metric_subset: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Retrieve actual supplier performance data from the database.
        
        Args:
            industry: Filter by industry category
            region: Filter by geographical region
            min_suppliers: Minimum number of suppliers to include
            max_suppliers: Maximum number of suppliers to include
            metric_subset: Optional subset of metrics to include (defaults to all)
            
        Returns:
            Dictionary containing heatmap data structure
        """
        if not self.db_connector:
            raise ValueError("Database connector not provided")
            
        # This would be replaced with actual database queries
        # For now, just return synthetic data
        return self._generate_synthetic_performance_data(
            industry, region, min_suppliers, max_suppliers, metric_subset
        )
    
    def _generate_synthetic_performance_data(
        self,
        industry: Optional[str] = None,
        region: Optional[str] = None,
        min_suppliers: int = 20,
        max_suppliers: int = 50,
        metric_subset: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate synthetic supplier performance data with realistic patterns.
        
        Args:
            industry: Filter by industry category
            region: Filter by geographical region
            min_suppliers: Minimum number of suppliers to include
            max_suppliers: Maximum number of suppliers to include
            metric_subset: Optional subset of metrics to include (defaults to all)
            
        Returns:
            Dictionary containing heatmap data structure
        """
        # Select metrics to use
        metrics = metric_subset if metric_subset else PERFORMANCE_METRICS
        
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
            for metric in metrics:
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
        for metric in metrics:
            total = sum(supplier["metrics"][metric] for supplier in suppliers)
            industry_averages[metric] = round(total / len(suppliers))
        
        # Prepare result structure
        result = {
            "suppliers": suppliers,
            "metrics": metrics,
            "industry_averages": industry_averages,
            "metadata": {
                "industry": selected_industry,
                "region": selected_region,
                "supplier_count": len(suppliers),
                "generated_at": "2023-11-15T12:00:00Z"  # Would use actual timestamp in production
            }
        }
        
        return result
    
    async def get_supplier_performance_comparison(
        self, 
        supplier_ids: List[str],
        metrics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Compare performance metrics across selected suppliers.
        
        Args:
            supplier_ids: List of supplier IDs to compare
            metrics: Optional list of metrics to include (defaults to all)
            
        Returns:
            Dictionary with comparison data
        """
        # This would fetch real data in production
        # For demo, we generate synthetic data
        
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
    
    async def get_supplier_time_series_performance(
        self,
        supplier_id: str,
        metric: str,
        period: str = "monthly",  # daily, weekly, monthly
        num_periods: int = 12
    ) -> Dict[str, Any]:
        """
        Get time-series performance data for a specific supplier and metric.
        
        Args:
            supplier_id: The supplier ID
            metric: The performance metric to analyze
            period: Time period aggregation (daily, weekly, monthly)
            num_periods: Number of periods to include
            
        Returns:
            Dictionary with time series data
        """
        # This would fetch real data in production
        # For demo, we generate synthetic data
        
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

# Utility functions for the API endpoints

async def get_performance_heatmap_data(
    industry: Optional[str] = None,
    region: Optional[str] = None,
    min_suppliers: int = 20,
    max_suppliers: int = 50,
    metrics: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    API function to get heatmap data for supplier performance.
    
    Args:
        industry: Filter by industry
        region: Filter by region
        min_suppliers: Minimum number of suppliers
        max_suppliers: Maximum number of suppliers
        metrics: List of metrics to include
        
    Returns:
        Dictionary with heatmap data
    """
    analyzer = SupplierPerformanceAnalyzer()
    data = await analyzer.get_supplier_performance_heatmap_data(
        industry, region, min_suppliers, max_suppliers, metrics
    )
    return data

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
    analyzer = SupplierPerformanceAnalyzer()
    data = await analyzer.get_supplier_performance_comparison(supplier_ids, metrics)
    return data

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
    analyzer = SupplierPerformanceAnalyzer()
    data = await analyzer.get_supplier_time_series_performance(
        supplier_id, metric, period, num_periods
    )
    return data