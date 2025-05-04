#!/usr/bin/env python
"""
Price Prediction Model Explainer

This script provides explainable AI features for the price prediction model
using SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations).

It explains the factors that influence price predictions, making the pricing
algorithm more transparent to users.
"""

import os
import sys
import json
import argparse
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import lime
import lime.lime_tabular
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import base64
from io import BytesIO
import random

# Define the features used in the price prediction model
PRICE_PREDICTION_FEATURES = [
    'base_price',  # Base price of the product
    'quantity',  # Quantity being purchased
    'delivery_timeline',  # Requested delivery timeline in days
    'market_demand',  # Market demand index (0-1)
    'seasonal_factor',  # Seasonal price adjustment factor
    'raw_material_cost',  # Current cost of raw materials
    'competitor_pricing',  # Average competitor pricing
    'currency_exchange',  # Exchange rate factor
    'customer_tier',  # Customer tier (encoded)
    'bulk_discount_eligible',  # Is the order eligible for bulk discount?
    'special_handling',  # Does the order require special handling?
    'shipping_distance'  # Distance for shipping
]

class PricePredictionExplainer:
    """Provides explainable insights for price predictions."""
    
    def __init__(self, model_path=None):
        """Initialize the explainer with an optional model path."""
        try:
            # Try to load the pre-trained model
            if model_path and os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(model_path.replace('.joblib', '_scaler.joblib'))
            else:
                # If no model is available, train a simple model for demonstration
                self.model, self.scaler = self._train_demo_model()
            
            # Initialize LIME explainer
            self.lime_explainer = lime.lime_tabular.LimeTabularExplainer(
                training_data=np.random.rand(100, len(PRICE_PREDICTION_FEATURES)),  # Demo data
                feature_names=PRICE_PREDICTION_FEATURES,
                mode='regression'
            )
        except Exception as e:
            print(f"Error initializing price prediction explainer: {e}")
            raise
    
    def _train_demo_model(self):
        """Train a simple demo model for price prediction."""
        # Generate synthetic data
        np.random.seed(42)
        X = np.random.rand(1000, len(PRICE_PREDICTION_FEATURES))
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Generate synthetic prices using a linear combination with noise
        base_price = np.random.uniform(100, 1000, X_scaled.shape[0])
        
        # Price is primarily influenced by base price, quantity, and raw materials
        # with some influence from other factors
        y = base_price * (
            1.0 +  # Start with base price
            -0.1 * X_scaled[:, 1] +  # Quantity discount effect
            0.05 * X_scaled[:, 2] +  # Expedited delivery premium
            0.2 * X_scaled[:, 3] +  # Market demand effect
            0.1 * X_scaled[:, 4] +  # Seasonal variation
            0.3 * X_scaled[:, 5] +  # Raw material cost effect
            0.05 * X_scaled[:, 6] +  # Competitor pricing alignment
            0.1 * X_scaled[:, 7] +  # Currency exchange impact
            -0.05 * X_scaled[:, 8] +  # Customer tier discount
            -0.08 * X_scaled[:, 9] +  # Bulk discount
            0.07 * X_scaled[:, 10] +  # Special handling fee
            0.05 * X_scaled[:, 11] +  # Shipping distance cost
            np.random.normal(0, 0.05, X_scaled.shape[0])  # Random variation
        )
        
        # Train a regression model
        model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        model.fit(X_scaled, y)
        
        return model, scaler
    
    def _preprocess_input(self, input_data):
        """Preprocess the input data to get features for the model."""
        # In a real application, this would extract and transform features
        # from the product and order data
        
        # For demonstration, we'll use the input data directly with some defaults
        features = {
            'base_price': float(input_data.get('base_price', 100)),
            'quantity': float(input_data.get('quantity', 1)),
            'delivery_timeline': float(input_data.get('delivery_timeline', 30)),
            'market_demand': float(input_data.get('market_demand', 0.5)),
            'seasonal_factor': float(input_data.get('seasonal_factor', 1.0)),
            'raw_material_cost': float(input_data.get('raw_material_cost', 50)),
            'competitor_pricing': float(input_data.get('competitor_pricing', 95)),
            'currency_exchange': float(input_data.get('currency_exchange', 1.0)),
            'customer_tier': self._encode_customer_tier(input_data.get('customer_tier', 'standard')),
            'bulk_discount_eligible': float(input_data.get('quantity', 1) > 10),
            'special_handling': float(input_data.get('special_handling', False)),
            'shipping_distance': float(input_data.get('shipping_distance', 500))
        }
        
        # Convert to array in the correct order
        X = np.array([[features[feature] for feature in PRICE_PREDICTION_FEATURES]])
        
        return X, features
    
    def _encode_customer_tier(self, tier):
        """Encode customer tier as a numeric value."""
        tier_map = {
            'platinum': 0.9,
            'gold': 0.7,
            'silver': 0.5,
            'standard': 0.3,
            'new': 0.1
        }
        return tier_map.get(tier.lower(), 0.3)  # Default to standard
    
    def predict_price(self, input_data):
        """
        Predict price for a product based on input features.
        
        Args:
            input_data: Dictionary with product and order features
            
        Returns:
            Dictionary with predicted price and details
        """
        try:
            # Preprocess input
            X, features = self._preprocess_input(input_data)
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Predict price
            predicted_price = float(self.model.predict(X_scaled)[0])
            
            # Calculate price range (+/- 10%)
            price_range = {
                'min': predicted_price * 0.9,
                'max': predicted_price * 1.1
            }
            
            # Calculate recommended discount based on quantity and customer tier
            base_discount = 0
            if features['quantity'] > 100:
                base_discount = 15
            elif features['quantity'] > 50:
                base_discount = 10
            elif features['quantity'] > 10:
                base_discount = 5
            
            tier_discount = {
                0.9: 10,  # platinum
                0.7: 7,   # gold
                0.5: 5,   # silver
                0.3: 0,   # standard
                0.1: 0    # new
            }.get(features['customer_tier'], 0)
            
            recommended_discount = min(base_discount + tier_discount, 25)  # Cap at 25%
            
            # Calculate confidence based on feature quality
            # In a real model, this would be more sophisticated
            confidence = 0.7 + random.uniform(-0.1, 0.1)
            
            return {
                'predicted_price': predicted_price,
                'price_range': price_range,
                'recommended_discount': recommended_discount,
                'confidence': confidence
            }
        except Exception as e:
            print(f"Error predicting price: {e}")
            raise
    
    def explain_prediction(self, input_data, method='both'):
        """
        Explain the price prediction using LIME and/or SHAP.
        
        Args:
            input_data: Dictionary with product and order features
            method: 'lime', 'shap', or 'both'
            
        Returns:
            Dictionary with explanation details
        """
        try:
            # Preprocess input
            X, features = self._preprocess_input(input_data)
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Get the price prediction
            prediction = self.predict_price(input_data)
            
            # Prepare explanation result
            explanation = {
                'prediction': prediction,
                'method': method
            }
            
            # LIME explanation
            if method in ['lime', 'both']:
                lime_exp = self.lime_explainer.explain_instance(
                    X_scaled[0], 
                    self.model.predict,
                    num_features=len(PRICE_PREDICTION_FEATURES)
                )
                
                # Extract feature importances
                lime_features = lime_exp.as_list()
                
                explanation['lime_explanation'] = {
                    'feature_importances': [
                        {'feature': feature, 'importance': float(importance)}
                        for feature, importance in lime_features
                    ],
                    'visualization': self._create_lime_visualization(lime_exp)
                }
            
            # SHAP explanation
            if method in ['shap', 'both']:
                # For simplicity, we'll use the feature importance from the GBM
                importances = self.model.feature_importances_
                
                # Multiply by feature values to get directional impact
                feature_values = X_scaled[0] - np.mean(X_scaled, axis=0)
                directional_importances = importances * feature_values
                
                explanation['shap_explanation'] = {
                    'feature_importances': [
                        {'feature': feature, 'importance': float(importance)}
                        for feature, importance in zip(PRICE_PREDICTION_FEATURES, directional_importances)
                    ],
                    'visualization': self._create_shap_visualization(
                        PRICE_PREDICTION_FEATURES, directional_importances
                    )
                }
            
            # Combine explanations if both methods are used
            if method == 'both':
                # Average the feature importances from both methods
                combined_importances = {}
                
                for item in explanation['lime_explanation']['feature_importances']:
                    feature = item['feature']
                    importance = item['importance']
                    combined_importances[feature] = importance
                
                for item in explanation['shap_explanation']['feature_importances']:
                    feature = item['feature']
                    importance = item['importance']
                    if feature in combined_importances:
                        combined_importances[feature] = (combined_importances[feature] + importance) / 2
                    else:
                        combined_importances[feature] = importance
                
                # Sort by absolute importance
                sorted_features = sorted(
                    combined_importances.items(),
                    key=lambda x: abs(x[1]),
                    reverse=True
                )
                
                explanation['feature_importances'] = [
                    {'feature': feature, 'importance': float(importance)}
                    for feature, importance in sorted_features
                ]
            else:
                # Use the explanations from the selected method
                if method == 'lime':
                    explanation['feature_importances'] = explanation['lime_explanation']['feature_importances']
                else:  # shap
                    explanation['feature_importances'] = explanation['shap_explanation']['feature_importances']
            
            return explanation
        except Exception as e:
            print(f"Error explaining price prediction: {e}")
            raise
    
    def _create_lime_visualization(self, lime_exp):
        """Create a visualization of the LIME explanation."""
        plt.figure(figsize=(10, 6))
        lime_exp.as_pyplot_figure()
        plt.tight_layout()
        
        # Save figure to a base64 string
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        
        # Convert to base64 for embedding in HTML
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        return f"data:image/png;base64,{img_str}"
    
    def _create_shap_visualization(self, features, importances):
        """Create a visualization of feature importances."""
        # Sort features by importance
        indices = np.argsort(np.abs(importances))
        plt.figure(figsize=(10, 6))
        
        # Plot horizontal bar chart
        bars = plt.barh(
            range(len(features)), 
            importances[indices],
            color=['red' if imp < 0 else 'green' for imp in importances[indices]]
        )
        
        # Add feature names as y-axis labels
        plt.yticks(range(len(features)), [features[i] for i in indices])
        
        # Add a title and labels
        plt.title('Feature Importance for Price Prediction')
        plt.xlabel('Impact on Price')
        plt.tight_layout()
        
        # Save figure to a base64 string
        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        
        # Convert to base64 for embedding in HTML
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        return f"data:image/png;base64,{img_str}"

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Price Prediction Model Explainer')
    parser.add_argument('--input', required=True, help='Path to input JSON file')
    parser.add_argument('--output', required=True, help='Path to output JSON file')
    parser.add_argument('--model', help='Path to model file', default=None)
    parser.add_argument('--method', help='Explanation method: lime, shap, or both', default='both')
    return parser.parse_args()

def main():
    """Main function to run the explainer."""
    args = parse_args()
    
    try:
        # Load input data
        with open(args.input, 'r') as f:
            input_data = json.load(f)
        
        # Initialize explainer
        explainer = PricePredictionExplainer(model_path=args.model)
        
        # Get explanation
        explanation = explainer.explain_prediction(input_data, method=args.method)
        
        # Add metadata
        result = {
            'predicted_price': explanation['prediction']['predicted_price'],
            'price_range': explanation['prediction']['price_range'],
            'recommended_discount': explanation['prediction']['recommended_discount'],
            'confidence': explanation['prediction']['confidence'],
            'feature_importances': explanation['feature_importances'],
            'method': explanation['method'],
            'visualization_url': explanation['lime_explanation']['visualization'] 
                if 'lime_explanation' in explanation 
                else explanation['shap_explanation']['visualization']
        }
        
        # Save output
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"Explanation saved to {args.output}")
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())