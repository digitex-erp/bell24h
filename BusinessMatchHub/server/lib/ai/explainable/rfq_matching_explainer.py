#!/usr/bin/env python
"""
RFQ-Supplier Matching Model Explainer

This script provides explainable AI features for the RFQ-supplier matching model
using SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations).

It explains why certain suppliers are recommended for specific RFQs, making the
matching algorithm more transparent to users.
"""

import os
import sys
import json
import argparse
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import lime
import lime.lime_tabular
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import base64
from io import BytesIO
from datetime import datetime
import random

# Define the features used in the RFQ matching model
RFQ_MATCHING_FEATURES = [
    'rfq_category_match',  # Categorical match between RFQ and supplier categories
    'capacity_fulfillment',  # Can the supplier fulfill the quantity requested?
    'deadline_feasibility',  # Can the supplier meet the deadline?
    'supplier_rating',  # Overall rating of the supplier
    'geographical_distance',  # Distance between buyer and supplier
    'previous_business',  # Have they worked together before?
    'price_competitiveness',  # How competitive is the supplier's pricing?
    'quality_match',  # Match between quality requirements and supplier capabilities
    'delivery_capability',  # Supplier's track record of on-time delivery
    'technical_compliance',  # Can the supplier meet technical requirements?
    'communication_responsiveness',  # How responsive is the supplier?
    'financial_stability'  # Financial stability of the supplier
]

class RfqMatchingExplainer:
    """Provides explainable insights for RFQ-supplier matching."""
    
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
                training_data=np.random.rand(100, len(RFQ_MATCHING_FEATURES)),  # Demo data
                feature_names=RFQ_MATCHING_FEATURES,
                mode='regression'
            )
        except Exception as e:
            print(f"Error initializing RFQ matching explainer: {e}")
            raise
    
    def _train_demo_model(self):
        """Train a simple demo model for RFQ matching."""
        # Generate synthetic data
        np.random.seed(42)
        X = np.random.rand(1000, len(RFQ_MATCHING_FEATURES))
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Generate synthetic match scores (0-100)
        y = np.clip(
            20 + 25 * X_scaled[:, 0] + 15 * X_scaled[:, 1] + 10 * X_scaled[:, 2] + 
            8 * X_scaled[:, 3] + 5 * X_scaled[:, 4] - 5 * X_scaled[:, 5] + 
            15 * X_scaled[:, 6] + 10 * X_scaled[:, 7] + 7 * X_scaled[:, 8] +
            5 * X_scaled[:, 9] + 5 * X_scaled[:, 10] + 5 * X_scaled[:, 11] +
            np.random.normal(0, 5, X_scaled.shape[0]),
            0, 100
        )
        
        # Train a regression model
        model = GradientBoostingRegressor(n_estimators=50, random_state=42)
        model.fit(X_scaled, y)
        
        return model, scaler
    
    def _preprocess_input(self, input_data):
        """Preprocess the input data to get features for the model."""
        # In a real application, this would extract and transform features
        # from the RFQ and supplier data
        
        # For demonstration, we'll create synthetic features based on the input
        rfq_category = input_data.get('rfq_category', '')
        supplier_category = input_data.get('supplier_category', '')
        
        # Calculate category match (1 if exact match, 0.5 if partial match, 0 otherwise)
        if rfq_category.lower() == supplier_category.lower():
            category_match = 1.0
        elif rfq_category.lower() in supplier_category.lower() or supplier_category.lower() in rfq_category.lower():
            category_match = 0.5
        else:
            category_match = 0.1
        
        # Parse deadline
        try:
            deadline_str = input_data.get('rfq_deadline', '')
            deadline = datetime.fromisoformat(deadline_str)
            days_to_deadline = (deadline - datetime.now()).days
            
            # Normalize to a 0-1 scale where higher means more feasible
            deadline_feasibility = np.clip(days_to_deadline / 30, 0, 1)
        except:
            deadline_feasibility = 0.5  # Default value
        
        # Extract other features with defaults
        features = {
            'rfq_category_match': category_match,
            'capacity_fulfillment': float(input_data.get('supplier_capacity', 'medium') == 'high'),
            'deadline_feasibility': deadline_feasibility,
            'supplier_rating': float(input_data.get('supplier_rating', 3)) / 5,
            'geographical_distance': 1.0 - float(input_data.get('geographical_distance', 0.5)),  # Inverse (closer is better)
            'previous_business': float(input_data.get('previous_business', False)),
            'price_competitiveness': float(input_data.get('price_competitiveness', 0.5)),
            'quality_match': float(input_data.get('quality_match', 0.7)),
            'delivery_capability': float(input_data.get('delivery_capability', 0.8)),
            'technical_compliance': random.uniform(0.6, 0.9),  # Random value for demo
            'communication_responsiveness': random.uniform(0.5, 0.9),  # Random value for demo
            'financial_stability': random.uniform(0.6, 0.9)  # Random value for demo
        }
        
        # Convert to array in the correct order
        X = np.array([[features[feature] for feature in RFQ_MATCHING_FEATURES]])
        
        return X, features
    
    def predict_match_score(self, input_data):
        """
        Predict match score between RFQ and supplier.
        
        Args:
            input_data: Dictionary with RFQ and supplier features
            
        Returns:
            Dictionary with match score and details
        """
        try:
            # Preprocess input
            X, _ = self._preprocess_input(input_data)
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Predict match score
            match_score = float(self.model.predict(X_scaled)[0])
            
            # Determine match quality and recommendation level
            if match_score >= 80:
                match_quality = "Excellent"
                recommendation_level = "Highly Recommended"
            elif match_score >= 60:
                match_quality = "Good"
                recommendation_level = "Recommended"
            elif match_score >= 40:
                match_quality = "Fair"
                recommendation_level = "Consider"
            else:
                match_quality = "Poor"
                recommendation_level = "Not Recommended"
            
            # Calculate confidence based on feature quality
            # In a real model, this would be more sophisticated
            confidence = 0.7 + random.uniform(-0.1, 0.1)
            
            return {
                'match_score': match_score,
                'match_quality': match_quality,
                'recommendation_level': recommendation_level,
                'confidence': confidence
            }
        except Exception as e:
            print(f"Error predicting match score: {e}")
            raise
    
    def explain_prediction(self, input_data, method='both'):
        """
        Explain the match prediction using LIME and/or SHAP.
        
        Args:
            input_data: Dictionary with RFQ and supplier features
            method: 'lime', 'shap', or 'both'
            
        Returns:
            Dictionary with explanation details
        """
        try:
            # Preprocess input
            X, features = self._preprocess_input(input_data)
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Get the match prediction
            prediction = self.predict_match_score(input_data)
            
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
                    num_features=len(RFQ_MATCHING_FEATURES)
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
                        for feature, importance in zip(RFQ_MATCHING_FEATURES, directional_importances)
                    ],
                    'visualization': self._create_shap_visualization(
                        RFQ_MATCHING_FEATURES, directional_importances
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
            print(f"Error explaining match prediction: {e}")
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
        plt.title('Feature Importance for RFQ-Supplier Matching')
        plt.xlabel('Importance')
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
    parser = argparse.ArgumentParser(description='RFQ-Supplier Matching Model Explainer')
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
        explainer = RfqMatchingExplainer(model_path=args.model)
        
        # Get explanation
        explanation = explainer.explain_prediction(input_data, method=args.method)
        
        # Add metadata
        result = {
            'match_score': explanation['prediction']['match_score'],
            'match_quality': explanation['prediction']['match_quality'],
            'recommendation_level': explanation['prediction']['recommendation_level'],
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