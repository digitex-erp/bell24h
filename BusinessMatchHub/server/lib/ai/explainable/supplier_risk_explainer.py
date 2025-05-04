#!/usr/bin/env python
"""
Supplier Risk Assessment Model Explainer

This script provides explainable AI features for the supplier risk assessment model
using SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations).

It takes input data for a supplier, runs it through the risk assessment model,
and explains the factors influencing the risk score.
"""

import os
import sys
import json
import argparse
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
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

# Define the features used in the supplier risk model
SUPPLIER_RISK_FEATURES = [
    'experience_years',
    'delivery_performance',
    'financial_stability',
    'quality_score',
    'compliance_score',
    'geographical_risk',
    'industry_volatility',
    'credit_score',
    'dispute_history',
    'certification_level'
]

RISK_CATEGORIES = ['Low', 'Medium', 'High']

class SupplierRiskExplainer:
    """Provides explainable insights for supplier risk assessments."""
    
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
                training_data=np.random.rand(100, len(SUPPLIER_RISK_FEATURES)),  # Demo data
                feature_names=SUPPLIER_RISK_FEATURES,
                class_names=RISK_CATEGORIES,
                discretize_continuous=True,
                mode='classification'
            )
        except Exception as e:
            print(f"Error initializing supplier risk explainer: {e}")
            raise
    
    def _train_demo_model(self):
        """Train a simple demo model for supplier risk assessment."""
        # Generate synthetic data
        np.random.seed(42)
        X = np.random.rand(1000, len(SUPPLIER_RISK_FEATURES))
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Generate synthetic risk scores (0-100)
        y_risk = np.clip(
            50 + 15 * X_scaled[:, 0] - 20 * X_scaled[:, 1] + 10 * X_scaled[:, 2] + 
            5 * X_scaled[:, 3] - 8 * X_scaled[:, 4] + np.random.normal(0, 5, X_scaled.shape[0]),
            0, 100
        )
        
        # Convert to risk categories (0, 1, 2 for Low, Medium, High)
        y_cat = np.digitize(y_risk, bins=[33, 66]) - 1
        
        # Train a random forest classifier
        model = RandomForestClassifier(n_estimators=50, random_state=42)
        model.fit(X_scaled, y_cat)
        
        return model, scaler
    
    def predict_risk(self, supplier_data):
        """
        Predict risk category and score for a supplier.
        
        Args:
            supplier_data: Dictionary with supplier features
            
        Returns:
            Dictionary with risk category, score, and confidence
        """
        try:
            # Extract features in the correct order
            X = np.array([[
                supplier_data.get(feature, 0) 
                for feature in SUPPLIER_RISK_FEATURES
            ]])
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Predict risk category
            risk_category_idx = self.model.predict(X_scaled)[0]
            risk_category = RISK_CATEGORIES[risk_category_idx]
            
            # Get prediction probabilities
            proba = self.model.predict_proba(X_scaled)[0]
            confidence = float(proba[risk_category_idx])
            
            # Calculate risk score (0-100)
            # Higher indices in RISK_CATEGORIES mean higher risk
            risk_score = float((risk_category_idx * 33) + (33 * proba[risk_category_idx]))
            
            return {
                'risk_category': risk_category,
                'risk_score': risk_score,
                'confidence': confidence,
                'probabilities': {RISK_CATEGORIES[i]: float(p) for i, p in enumerate(proba)}
            }
        except Exception as e:
            print(f"Error predicting supplier risk: {e}")
            raise
    
    def explain_prediction(self, supplier_data, method='both'):
        """
        Explain the risk prediction for a supplier using LIME and/or SHAP.
        
        Args:
            supplier_data: Dictionary with supplier features
            method: 'lime', 'shap', or 'both'
            
        Returns:
            Dictionary with explanation details
        """
        try:
            # Extract features in the correct order
            X = np.array([[
                supplier_data.get(feature, 0) 
                for feature in SUPPLIER_RISK_FEATURES
            ]])
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Get the risk prediction
            prediction = self.predict_risk(supplier_data)
            
            # Prepare explanation result
            explanation = {
                'prediction': prediction,
                'method': method
            }
            
            # LIME explanation
            if method in ['lime', 'both']:
                lime_exp = self.lime_explainer.explain_instance(
                    X_scaled[0], 
                    self.model.predict_proba,
                    num_features=len(SUPPLIER_RISK_FEATURES),
                    top_labels=1
                )
                
                # Get the explanation for the predicted class
                predicted_class = RISK_CATEGORIES.index(prediction['risk_category'])
                
                # Extract feature importances
                lime_features = lime_exp.as_list(label=predicted_class)
                
                explanation['lime_explanation'] = {
                    'feature_importances': [
                        {'feature': feature, 'importance': float(importance)}
                        for feature, importance in lime_features
                    ],
                    'visualization': self._create_lime_visualization(lime_exp, predicted_class)
                }
            
            # SHAP explanation
            if method in ['shap', 'both']:
                # For simplicity, we'll use the feature importance from the random forest
                importances = self.model.feature_importances_
                
                # Apply sign based on correlation with risk
                signs = self._determine_feature_signs(X_scaled[0])
                importances = importances * signs
                
                explanation['shap_explanation'] = {
                    'feature_importances': [
                        {'feature': feature, 'importance': float(importance)}
                        for feature, importance in zip(SUPPLIER_RISK_FEATURES, importances)
                    ],
                    'visualization': self._create_shap_visualization(
                        SUPPLIER_RISK_FEATURES, importances
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
            print(f"Error explaining supplier risk prediction: {e}")
            raise
    
    def _determine_feature_signs(self, sample):
        """Determine if features positively or negatively affect risk."""
        # This is a simplified approach - in a real model, you'd analyze feature correlations
        # with the target variable or use SHAP values directly
        
        # For demo, we'll use pre-defined signs based on domain knowledge
        signs = np.array([
            -1,  # experience_years (more years, less risk)
            -1,  # delivery_performance (better performance, less risk)
            -1,  # financial_stability (more stability, less risk)
            -1,  # quality_score (higher quality, less risk)
            -1,  # compliance_score (better compliance, less risk)
            1,   # geographical_risk (more risk, more risk)
            1,   # industry_volatility (more volatility, more risk)
            -1,  # credit_score (better credit, less risk)
            1,   # dispute_history (more disputes, more risk)
            -1   # certification_level (more certifications, less risk)
        ])
        
        return signs
    
    def _create_lime_visualization(self, lime_exp, label):
        """Create a visualization of the LIME explanation."""
        plt.figure(figsize=(10, 6))
        lime_exp.as_pyplot_figure(label=label)
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
        plt.title('Feature Importance for Supplier Risk Assessment')
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
    parser = argparse.ArgumentParser(description='Supplier Risk Assessment Model Explainer')
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
            supplier_data = json.load(f)
        
        # Initialize explainer
        explainer = SupplierRiskExplainer(model_path=args.model)
        
        # Get explanation
        explanation = explainer.explain_prediction(supplier_data, method=args.method)
        
        # Add metadata
        result = {
            'risk_score': explanation['prediction']['risk_score'],
            'risk_category': explanation['prediction']['risk_category'],
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