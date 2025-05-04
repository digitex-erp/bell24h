import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio

from backend.database import supabase
from backend.models.supplier import SupplierWithScore, ShapValue
from backend.ai.explainer import get_shap_explanations

async def match_suppliers_for_rfq(rfq: Dict[str, Any]) -> List[SupplierWithScore]:
    """
    Match suppliers for a given RFQ using AI matching engine
    
    This function:
    1. Retrieves verified suppliers
    2. Scores them based on multiple criteria
    3. Provides SHAP explanations for the scores
    4. Returns sorted suppliers with scores and explanations
    
    Args:
        rfq: RFQ data dictionary
        
    Returns:
        List of suppliers with match scores and explanations
    """
    try:
        # Get all verified suppliers
        supplier_response = supabase.table("user_profiles").select("*").eq("role", "supplier").eq("is_verified", True).execute()
        
        if not supplier_response.data:
            return []
        
        suppliers = supplier_response.data
        
        # Get supplier metrics
        supplier_ids = [supplier["id"] for supplier in suppliers]
        metrics_response = supabase.table("supplier_metrics").select("*").in_("supplier_id", supplier_ids).execute()
        
        # Create a mapping of supplier_id to metrics
        metrics_map = {
            metric["supplier_id"]: metric 
            for metric in metrics_response.data
        } if metrics_response.data else {}
        
        # Get supplier specializations/categories
        specializations_response = supabase.table("supplier_specializations").select("*").in_("supplier_id", supplier_ids).execute()
        
        # Create a mapping of supplier_id to specializations
        specializations_map = {}
        if specializations_response.data:
            for spec in specializations_response.data:
                if spec["supplier_id"] not in specializations_map:
                    specializations_map[spec["supplier_id"]] = []
                specializations_map[spec["supplier_id"]].append(spec["category"])
        
        # Calculate feature vectors for each supplier
        feature_vectors = []
        supplier_details = []
        
        for supplier in suppliers:
            supplier_id = supplier["id"]
            metrics = metrics_map.get(supplier_id, {})
            specializations = specializations_map.get(supplier_id, [])
            
            # Prepare supplier details
            detail = {
                "id": supplier_id,
                "name": supplier["name"],
                "company_name": supplier["company"],
                "email": supplier["email"],
                "gstin": supplier["gstin"],
                "is_gst_verified": supplier["is_verified"],
                "city": supplier.get("city", ""),
                "state": supplier.get("state", ""),
                "specializations": specializations,
                "completion_rate": metrics.get("completion_rate", 0.0),
                "avg_delivery_days": metrics.get("avg_delivery_days", 0.0),
                "rating": metrics.get("avg_rating", 0.0),
                "total_completed": metrics.get("total_completed", 0),
                "price_competitiveness": supplier.get("price_competitiveness", "medium")
            }
            
            supplier_details.append(detail)
            
            # Extract features for scoring
            category_match = 1.0 if rfq["category"] in specializations else 0.0
            
            # Convert price competitiveness to numeric value
            price_comp_value = {
                "low": 0.3,
                "medium": 0.6,
                "high": 0.9
            }.get(supplier.get("price_competitiveness", "medium"), 0.6)
            
            # Calculate delivery match score
            # Higher score if supplier delivery days are less than or equal to required
            avg_delivery = metrics.get("avg_delivery_days", 0.0)
            delivery_match = 0.0
            if avg_delivery > 0:
                delivery_ratio = rfq["delivery_days"] / avg_delivery
                delivery_match = min(1.0, max(0.0, delivery_ratio))
            
            # Features vector
            features = np.array([
                category_match,  # Category match (0 or 1)
                price_comp_value,  # Price competitiveness (0.3, 0.6, 0.9)
                metrics.get("completion_rate", 0.0),  # Completion rate (0 to 1)
                delivery_match,  # Delivery time match (0 to 1)
                min(1.0, metrics.get("avg_rating", 0.0) / 5.0),  # Rating (0 to 1)
                min(1.0, metrics.get("total_completed", 0) / 10.0)  # Experience level (0 to 1)
            ])
            
            feature_vectors.append(features)
        
        if not feature_vectors:
            return []
        
        # Convert to numpy array
        features_array = np.array(feature_vectors)
        
        # Define weights for each feature
        weights = np.array([
            0.25,  # Category match
            0.20,  # Price competitiveness
            0.15,  # Completion rate
            0.20,  # Delivery time match
            0.10,  # Rating
            0.10   # Experience level
        ])
        
        # Calculate scores
        scores = features_array.dot(weights)
        
        # Get SHAP explanations for scores
        feature_names = [
            "Category Match",
            "Price Competitiveness",
            "Completion Rate",
            "Delivery Time",
            "Supplier Rating",
            "Supplier Experience"
        ]
        
        # Get explanations for each supplier
        explanations = get_shap_explanations(features_array, weights, feature_names)
        
        # Combine scores, explanations, and supplier details
        result = []
        for i, (score, explanation) in enumerate(zip(scores, explanations)):
            # Prepare SHAP values
            shap_values = []
            for j, (name, value) in enumerate(zip(feature_names, explanation)):
                # Create explanation text based on feature
                expl_text = ""
                if name == "Category Match":
                    if value > 0:
                        expl_text = f"Supplier specializes in {rfq['category']}"
                    else:
                        expl_text = f"Supplier doesn't specialize in {rfq['category']}"
                elif name == "Price Competitiveness":
                    comp_level = supplier_details[i]["price_competitiveness"]
                    expl_text = f"{comp_level.capitalize()} price competitiveness based on past quotes"
                elif name == "Completion Rate":
                    rate = supplier_details[i]["completion_rate"] * 100
                    expl_text = f"Supplier completes {rate:.1f}% of accepted RFQs"
                elif name == "Delivery Time":
                    avg_days = supplier_details[i]["avg_delivery_days"]
                    if avg_days > 0:
                        expl_text = f"Average delivery time is {avg_days:.1f} days vs. {rfq['delivery_days']} days requested"
                    else:
                        expl_text = "No delivery history available"
                elif name == "Supplier Rating":
                    rating = supplier_details[i]["rating"]
                    expl_text = f"Supplier has an average rating of {rating:.1f}/5.0"
                elif name == "Supplier Experience":
                    completed = supplier_details[i]["total_completed"]
                    expl_text = f"Supplier has completed {completed} orders"
                
                shap_values.append(ShapValue(
                    name=name,
                    value=float(value),
                    explanation=expl_text
                ))
            
            # Sort SHAP values by absolute magnitude
            shap_values.sort(key=lambda x: abs(x.value), reverse=True)
            
            result.append(SupplierWithScore(
                **supplier_details[i],
                match_score=float(score),
                shap_values=shap_values
            ))
        
        # Sort by match score (descending)
        result.sort(key=lambda x: x.match_score, reverse=True)
        
        # Return top matches
        return result[:10]  # Return top 10 matches
    
    except Exception as e:
        print(f"Error in supplier matching: {str(e)}")
        return []
