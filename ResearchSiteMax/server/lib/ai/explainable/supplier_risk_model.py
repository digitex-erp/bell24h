#!/usr/bin/env python3
"""
Supplier Risk Assessment Model with Explainability

This module provides a risk assessment model for suppliers with 
explainability using LIME and SHAP.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import lime
import lime.lime_tabular
import os
import json
import matplotlib.pyplot as plt
import base64
from io import BytesIO

# Define the path to the model file
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'supplier_risk_model.joblib')
SCALER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'supplier_risk_scaler.joblib')

# Features used for risk prediction
FEATURES = [
    'late_delivery_rate',
    'compliance_score',
    'financial_stability',
    'user_feedback',
    'order_fulfillment_rate',
    'payment_timeliness',
    'quality_rating',
    'communication_rating',
    'years_in_business', 
    'certifications_count',
    'dispute_ratio', 
    'average_response_time',
    'repeat_business_rate'
]

# Feature descriptions for use in explanations
FEATURE_DESCRIPTIONS = {
    'late_delivery_rate': 'Percentage of orders delivered late',
    'compliance_score': 'Compliance score (higher is better)',
    'financial_stability': 'Financial stability score (higher is better)',
    'user_feedback': 'User feedback rating (higher is better)',
    'order_fulfillment_rate': 'Percentage of orders successfully fulfilled',
    'payment_timeliness': 'Payment timeliness score (higher is better)',
    'quality_rating': 'Quality of products/services rating',
    'communication_rating': 'Communication rating',
    'years_in_business': 'Number of years in business',
    'certifications_count': 'Number of certifications',
    'dispute_ratio': 'Ratio of disputed orders to total orders',
    'average_response_time': 'Average response time in hours',
    'repeat_business_rate': 'Rate of repeat business (higher is better)'
}

class SupplierRiskModel:
    """Model for predicting supplier risk with explainability"""
    
    def __init__(self):
        """Initialize the risk model and load or train the model"""
        self.model = None
        self.scaler = None
        self.explainer = None
        
        # Try to load the model
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load the model from disk or train a new one if not available"""
        try:
            # Check if model file exists
            if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                print("Loaded existing supplier risk model")
            else:
                print("Training new supplier risk model")
                self._train_model()
                
            # Initialize the explainer
            self._initialize_explainer()
        except Exception as e:
            print(f"Error loading/training risk model: {e}")
            # Initialize with default model
            self._train_model()
    
    def _train_model(self):
        """Train a new risk model on synthetic data"""
        # Create synthetic data for model training
        np.random.seed(42)
        n_samples = 1000
        
        # Generate synthetic supplier data
        data = {
            'late_delivery_rate': np.random.uniform(0, 30, n_samples),
            'compliance_score': np.random.uniform(60, 100, n_samples),
            'financial_stability': np.random.uniform(50, 100, n_samples),
            'user_feedback': np.random.uniform(70, 100, n_samples),
            'order_fulfillment_rate': np.random.uniform(80, 100, n_samples),
            'payment_timeliness': np.random.uniform(80, 100, n_samples),
            'quality_rating': np.random.uniform(70, 100, n_samples),
            'communication_rating': np.random.uniform(70, 100, n_samples),
            'years_in_business': np.random.randint(1, 20, n_samples),
            'certifications_count': np.random.randint(0, 5, n_samples),
            'dispute_ratio': np.random.uniform(0, 0.1, n_samples),
            'average_response_time': np.random.uniform(1, 48, n_samples),
            'repeat_business_rate': np.random.uniform(0.5, 1.0, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Calculate risk score from synthetic data with a formula that makes intuitive sense
        # Higher risk for: higher late delivery, higher dispute ratio, lower feedback, etc.
        risk_score = (
            0.3 * data['late_delivery_rate'] +
            0.2 * (100 - data['compliance_score']) +
            0.2 * (100 - data['financial_stability']) +
            0.1 * (100 - data['user_feedback']) +
            0.1 * (100 - data['order_fulfillment_rate']) +
            0.1 * (5 - data['certifications_count']) * 5 +
            0.1 * data['dispute_ratio'] * 300 +
            0.1 * data['average_response_time'] * 0.5 +
            0.1 * (1 - data['repeat_business_rate']) * 30 +
            # Years in business has a non-linear effect - newer suppliers are higher risk
            0.1 * np.exp(-data['years_in_business'] / 5) * 20
        )
        
        # Normalize to 0-100 scale
        risk_score = 100 * (risk_score - risk_score.min()) / (risk_score.max() - risk_score.min())
        
        # Prepare data for model training
        X = df[FEATURES]
        y = risk_score
        
        # Scale the features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train the model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, y)
        
        # Save the model and scaler
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)
    
    def _initialize_explainer(self):
        """Initialize the LIME explainer for model interpretability"""
        # Create a training dataset for the explainer
        np.random.seed(42)
        n_samples = 1000
        
        data = {feature: np.random.normal(50, 20, n_samples) for feature in FEATURES}
        data = pd.DataFrame(data)
        
        # Scale the data
        data_scaled = self.scaler.transform(data[FEATURES])
        
        # Create explainer
        self.explainer = lime.lime_tabular.LimeTabularExplainer(
            data_scaled,
            feature_names=FEATURES,
            class_names=['risk_score'],
            mode='regression',
            discretize_continuous=True
        )
    
    def predict_risk(self, supplier_data):
        """
        Predict risk score for a supplier
        
        Args:
            supplier_data: Dictionary with supplier features
            
        Returns:
            Risk score from 0-100
        """
        if self.model is None or self.scaler is None:
            self._load_or_train_model()
            
        # Extract features
        X = self._extract_features(supplier_data)
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict
        risk_score = self.model.predict(X_scaled)[0]
        
        # Ensure score is between 0 and 100
        risk_score = max(0, min(100, risk_score))
        
        return risk_score
    
    def get_risk_category(self, risk_score):
        """
        Get risk category for a given risk score
        
        Args:
            risk_score: Risk score from 0-100
            
        Returns:
            Risk category as string
        """
        if risk_score < 20:
            return 'Low Risk'
        elif risk_score < 50:
            return 'Medium-Low Risk'
        elif risk_score < 70:
            return 'Medium Risk'
        elif risk_score < 85:
            return 'Medium-High Risk'
        else:
            return 'High Risk'
    
    def _extract_features(self, supplier_data):
        """Extract features from supplier data"""
        features = {}
        
        # For each feature, get value from supplier_data or use default
        for feature in FEATURES:
            if feature in supplier_data:
                features[feature] = supplier_data[feature]
            else:
                # Default values for missing features
                if feature == 'late_delivery_rate':
                    features[feature] = 0
                elif feature in ['compliance_score', 'financial_stability', 'user_feedback', 
                              'order_fulfillment_rate', 'payment_timeliness']:
                    features[feature] = 100
                elif feature in ['quality_rating', 'communication_rating']:
                    features[feature] = 90
                elif feature == 'years_in_business':
                    features[feature] = 5
                elif feature == 'certifications_count':
                    features[feature] = 1
                elif feature == 'dispute_ratio':
                    features[feature] = 0
                elif feature == 'average_response_time':
                    features[feature] = 24
                elif feature == 'repeat_business_rate':
                    features[feature] = 0.7
                else:
                    features[feature] = 0
        
        # Convert to DataFrame in correct order
        X = pd.DataFrame([features])[FEATURES]
        return X
    
    def _plot_feature_importance(self, feature_importance, feature_names):
        """
        Create a bar chart of feature importance
        
        Args:
            feature_importance: List of feature importance scores
            feature_names: List of feature names
            
        Returns:
            Base64 encoded PNG of plot
        """
        # Sort by importance
        indices = np.argsort(feature_importance)
        plt.figure(figsize=(10, 6))
        plt.title('Feature Importance')
        plt.barh(range(len(indices)), feature_importance[indices], color='b', align='center')
        plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
        plt.xlabel('Relative Importance')
        plt.tight_layout()
        
        # Save to BytesIO
        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        plt.close()
        buffer.seek(0)
        
        # Encode as base64
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return img_str
    
    def explain_prediction(self, supplier_data):
        """
        Explain the risk prediction for a supplier
        
        Args:
            supplier_data: Dictionary with supplier features
            
        Returns:
            Dictionary with explanation data
        """
        if self.model is None or self.scaler is None:
            self._load_or_train_model()
            
        # Get risk score
        risk_score = self.predict_risk(supplier_data)
        risk_category = self.get_risk_category(risk_score)
        
        # Extract features
        X = self._extract_features(supplier_data)
        X_scaled = self.scaler.transform(X)
        
        # Get LIME explanation
        exp = self.explainer.explain_instance(
            X_scaled[0], 
            self.model.predict,
            num_features=len(FEATURES)
        )
        
        # Extract feature importance from explanation
        feature_importance = []
        for feature, importance in exp.as_list():
            feature_importance.append({
                'feature': feature,
                'importance': abs(importance),
                'direction': 'increases risk' if importance > 0 else 'decreases risk'
            })
        
        # Sort by importance
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        # Create visualization from model's feature importance
        model_feature_importance = self.model.feature_importances_
        feature_img = self._plot_feature_importance(model_feature_importance, FEATURES)
        
        # Generate explanation text
        explanation_text = self._generate_explanation_text(risk_score, risk_category, feature_importance)
        
        # Extract key strengths and weaknesses
        strengths = []
        weaknesses = []
        
        for item in feature_importance[:4]:  # Top 4 features
            feature = item['feature']
            importance = item['importance']
            direction = item['direction']
            feature_value = supplier_data.get(feature, "N/A")
            
            if feature in FEATURE_DESCRIPTIONS:
                feature_desc = FEATURE_DESCRIPTIONS[feature]
            else:
                feature_desc = feature.replace('_', ' ').title()
            
            if direction == 'decreases risk':
                strengths.append({
                    'feature': feature,
                    'description': feature_desc,
                    'value': feature_value,
                    'importance': importance
                })
            else:
                weaknesses.append({
                    'feature': feature,
                    'description': feature_desc,
                    'value': feature_value,
                    'importance': importance
                })
        
        return {
            'risk_score': float(risk_score),
            'risk_category': risk_category,
            'explanation_text': explanation_text,
            'feature_importance': feature_importance,
            'key_strengths': strengths[:2],  # Top 2 strengths
            'key_weaknesses': weaknesses[:2],  # Top 2 weaknesses
            'visualization_data': feature_img
        }
    
    def _generate_explanation_text(self, risk_score, risk_category, feature_importance):
        """Generate natural language explanation text"""
        top_features = feature_importance[:3]
        
        explanation = f"The supplier has a risk score of {risk_score:.1f} out of 100, "
        explanation += f"categorized as '{risk_category}'. "
        
        if top_features:
            explanation += "The most significant factors in this assessment are: "
            
            for i, feature in enumerate(top_features):
                if i > 0:
                    explanation += "; " if i < len(top_features) - 1 else "; and "
                    
                feature_name = feature['feature'].replace('_', ' ').title()
                if feature['direction'] == 'increases risk':
                    explanation += f"{feature_name} which increases risk"
                else:
                    explanation += f"{feature_name} which decreases risk"
        
        return explanation

# Create a singleton instance
supplier_risk_model = SupplierRiskModel()

# Simple test if run directly
if __name__ == "__main__":
    # Test with sample data
    test_data = {
        'late_delivery_rate': 5,
        'compliance_score': 95,
        'financial_stability': 90,
        'user_feedback': 95,
        'order_fulfillment_rate': 98,
        'payment_timeliness': 100,
        'quality_rating': 95,
        'communication_rating': 90,
        'years_in_business': 12,
        'certifications_count': 3,
        'dispute_ratio': 0.02,
        'average_response_time': 8,
        'repeat_business_rate': 0.85
    }
    
    risk_score = supplier_risk_model.predict_risk(test_data)
    risk_category = supplier_risk_model.get_risk_category(risk_score)
    explanation = supplier_risk_model.explain_prediction(test_data)
    
    print(f"Risk Score: {risk_score}")
    print(f"Risk Category: {risk_category}")
    print(f"Explanation: {explanation['explanation_text']}")
    print(f"Feature Importance: {explanation['feature_importance']}")
    print(f"Key Strengths: {explanation['key_strengths']}")
    print(f"Key Weaknesses: {explanation['key_weaknesses']}")