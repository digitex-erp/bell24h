import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio

from backend.database import supabase
from backend.models.supplier import SupplierWithScore, ShapValue, Supplier
from backend.models.rfq import RFQ
from backend.ai.explainer import get_shap_explanations

class SupplierMatcher:
    def __init__(self):
        self.weights = {
            'category_match': 0.3,
            'price_range': 0.2,
            'delivery_time': 0.15,
            'rating': 0.15,
            'performance_score': 0.2
        }

    def calculate_match_score(self, rfq: Dict, supplier: Dict) -> float:
        """Calculate match score between RFQ and supplier"""
        scores = []

        # Category matching
        category_match = 1.0 if rfq['category'] == supplier['primary_category'] else 0.5
        scores.append(category_match * self.weights['category_match'])

        # Price range compatibility
        price_diff = abs(rfq['budget'] - supplier['avg_price']) / rfq['budget']
        price_score = max(0, 1 - price_diff)
        scores.append(price_score * self.weights['price_range'])

        # Delivery time
        delivery_score = 1.0 if supplier['avg_delivery_days'] <= rfq['delivery_days'] else 0.7
        scores.append(delivery_score * self.weights['delivery_time'])

        # Rating and performance
        scores.append((supplier['rating'] / 5.0) * self.weights['rating'])
        scores.append((supplier['performance_score'] / 100) * self.weights['performance_score'])

        return sum(scores)

    async def find_matching_suppliers(self, rfq: Dict, suppliers: List[Dict], limit: int = 10) -> List[Dict]:
        """Find best matching suppliers for an RFQ"""
        matches = []
        for supplier in suppliers:
            score = self.calculate_match_score(rfq, supplier)
            matches.append({
                'supplier': supplier,
                'match_score': score,
                'explanation': self.generate_match_explanation(rfq, supplier, score)
            })

        matches.sort(key=lambda x: x['match_score'], reverse=True)
        return matches[:limit]

    def generate_match_explanation(self, rfq: Dict, supplier: Dict, score: float) -> str:
        """Generate human-readable explanation for the match score"""
        reasons = []
        if rfq['category'] == supplier['primary_category']:
            reasons.append("Perfect category match")
        if supplier['avg_delivery_days'] <= rfq['delivery_days']:
            reasons.append("Can meet delivery timeline")
        if supplier['rating'] >= 4.0:
            reasons.append("High supplier rating")

        return f"Match score: {score:.2f}. " + ", ".join(reasons)


async def match_suppliers_for_rfq(rfq_data: Dict[str, Any]) -> List[SupplierWithScore]:
    """
    Match suppliers for a given RFQ using AI matching engine
    This function:
    1. Retrieves verified suppliers
    2. Scores them based on multiple criteria
    3. Provides SHAP explanations for the scores
    4. Returns sorted suppliers with scores and explanations

    Args:
        rfq_data: RFQ data dictionary

    Returns:
        List of suppliers with match scores and explanations
    """
    try:
        # Get all verified suppliers
        supplier_response = supabase.table("user_profiles").select("*").eq("role", "supplier").eq("is_verified", True).execute()

        if not supplier_response.data:
            return []

        suppliers_data = supplier_response.data

        #Convert to Supplier objects.  Assumes necessary fields are present in the database response
        suppliers = [Supplier(**s) for s in suppliers_data]

        #Get RFQ data, needs adaptation to your RFQ model.
        rfq = RFQ(**rfq_data)

        # Instantiate the matching engine
        matcher = SupplierMatcher()

        # Match suppliers using the enhanced algorithm
        matches = await matcher.find_matching_suppliers(rfq.dict(), [s.dict() for s in suppliers])

        #Prepare the result to match the original format.  This is an approximation and might need adjustments based on your data model.

        result = []
        for match in matches:
            supplier_details = {
                "id": match['supplier']['id'],
                "name": match['supplier']['name'],
                # Add other supplier details as needed from your Supplier model
                "match_score": match['match_score'],
                "shap_values": [] # Placeholder for SHAP values -  SHAP explanation needs to be reimplemented or removed.
            }
            result.append(SupplierWithScore(**supplier_details))


        # Sort by match score (descending)
        result.sort(key=lambda x: x.match_score, reverse=True)

        # Return top matches
        return result[:10]  # Return top 10 matches

    except Exception as e:
        print(f"Error in supplier matching: {str(e)}")
        return []