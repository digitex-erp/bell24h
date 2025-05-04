#!/usr/bin/env python3
"""
RFQ Matching Model with Explainability

This module provides a matching model for RFQs to suppliers with 
explainability using LIME and SHAP.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import lime
import lime.lime_tabular
import os
import json
import matplotlib.pyplot as plt
import base64
from io import BytesIO
from datetime import datetime
import math

# Define the path to the model file
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'rfq_matching_model.joblib')
SCALER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'rfq_matching_scaler.joblib')

# Features used for matching prediction
FEATURES = [
    'rfq_quantity',
    'rfq_deadline_days',
    'rfq_estimated_value',
    'rfq_priority',
    'supplier_rating',
    'supplier_compliance_score',
    'supplier_financial_stability',
    'supplier_late_delivery_rate',
    'supplier_years_in_business',
    'location_match',
    'category_match'
]

# Feature descriptions for use in explanations
FEATURE_DESCRIPTIONS = {
    'rfq_quantity': 'Quantity requested in the RFQ',
    'rfq_deadline_days': 'Days until the RFQ deadline',
    'rfq_estimated_value': 'Estimated value of the RFQ',
    'rfq_priority': 'Priority level of the RFQ (1-3)',
    'supplier_rating': 'Overall supplier rating',
    'supplier_compliance_score': 'Supplier compliance score',
    'supplier_financial_stability': 'Supplier financial stability',
    'supplier_late_delivery_rate': 'Supplier late delivery rate',
    'supplier_years_in_business': 'Years supplier has been in business',
    'location_match': 'Whether supplier location matches RFQ location',
    'category_match': 'Whether supplier category matches RFQ category'
}

class RfqMatchingModel:
    """Model for predicting RFQ-supplier matches with explainability"""
    
    def __init__(self):
        """Initialize the matching model and load or train the model"""
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
                print("Loaded existing RFQ matching model")
            else:
                print("Training new RFQ matching model")
                self._train_model()
                
            # Initialize the explainer
            self._initialize_explainer()
        except Exception as e:
            print(f"Error loading/training matching model: {e}")
            # Initialize with default model
            self._train_model()
    
    def _train_model(self):
        """Train a new matching model on synthetic data"""
        # Create synthetic data for model training
        np.random.seed(42)
        n_samples = 1000
        
        # Generate synthetic RFQ-Supplier matching data
        data = {
            'rfq_quantity': np.random.randint(1, 1000, n_samples),
            'rfq_deadline_days': np.random.randint(1, 90, n_samples),
            'rfq_estimated_value': np.random.uniform(1000, 100000, n_samples),
            'rfq_priority': np.random.randint(1, 4, n_samples),
            'supplier_rating': np.random.uniform(60, 100, n_samples),
            'supplier_compliance_score': np.random.uniform(60, 100, n_samples),
            'supplier_financial_stability': np.random.uniform(60, 100, n_samples),
            'supplier_late_delivery_rate': np.random.uniform(0, 20, n_samples),
            'supplier_years_in_business': np.random.randint(1, 20, n_samples),
            'location_match': np.random.randint(0, 2, n_samples),
            'category_match': np.random.randint(0, 2, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Calculate match score from synthetic data with a formula that makes intuitive sense
        # Higher match for: category match, location match, higher ratings, lower late delivery, etc.
        match_score = (
            0.3 * data['category_match'] * 100 +
            0.2 * data['location_match'] * 100 +
            0.1 * data['supplier_rating'] +
            0.1 * data['supplier_compliance_score'] +
            0.1 * data['supplier_financial_stability'] +
            0.1 * (100 - data['supplier_late_delivery_rate'] * 5) +
            0.05 * np.minimum(data['supplier_years_in_business'] * 5, 100) +
            # Penalize for very short deadlines if late delivery rate is high
            -0.1 * (data['supplier_late_delivery_rate'] / 20) * (30 / np.maximum(data['rfq_deadline_days'], 1)) * 100
        )
        
        # Normalize to 0-100 scale
        match_score = 100 * (match_score - match_score.min()) / (match_score.max() - match_score.min())
        
        # Convert to binary match/no-match (threshold at 60)
        match_binary = (match_score >= 60).astype(int)
        
        # Prepare data for model training
        X = df[FEATURES]
        y = match_binary
        
        # Scale the features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train the model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
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
            class_names=['No Match', 'Match'],
            mode='classification',
            discretize_continuous=True
        )
    
    def predict_match(self, match_data):
        """
        Predict match probability for an RFQ-Supplier pair
        
        Args:
            match_data: Dictionary with RFQ-Supplier features
            
        Returns:
            Match probability from 0-100
        """
        if self.model is None or self.scaler is None:
            self._load_or_train_model()
            
        # Extract features
        X = self._extract_features(match_data)
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict
        match_proba = self.model.predict_proba(X_scaled)[0, 1] * 100
        
        return match_proba
    
    def get_match_category(self, match_score):
        """
        Get match category for a given match score
        
        Args:
            match_score: Match score from 0-100
            
        Returns:
            Match category as string
        """
        if match_score < 20:
            return 'Poor Match'
        elif match_score < 50:
            return 'Fair Match'
        elif match_score < 75:
            return 'Good Match'
        elif match_score < 90:
            return 'Very Good Match'
        else:
            return 'Excellent Match'
    
    def _extract_features(self, match_data):
        """Extract features from match data"""
        features = {}
        
        # For each feature, get value from match_data or use default
        for feature in FEATURES:
            if feature in match_data:
                features[feature] = match_data[feature]
            else:
                # Default values for missing features
                if feature == 'rfq_quantity':
                    features[feature] = 100
                elif feature == 'rfq_deadline_days':
                    features[feature] = 30
                elif feature == 'rfq_estimated_value':
                    features[feature] = 10000
                elif feature == 'rfq_priority':
                    features[feature] = 2
                elif feature in ['supplier_rating', 'supplier_compliance_score', 'supplier_financial_stability']:
                    features[feature] = 80
                elif feature == 'supplier_late_delivery_rate':
                    features[feature] = 5
                elif feature == 'supplier_years_in_business':
                    features[feature] = 5
                elif feature in ['location_match', 'category_match']:
                    features[feature] = 0
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
        plt.title('Feature Importance for RFQ Matching')
        plt.barh(range(len(indices)), feature_importance[indices], color='g', align='center')
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
    
    def _create_match_data(self, rfq_data, supplier_data):
        """
        Create match data from RFQ and supplier data
        
        Args:
            rfq_data: Dictionary with RFQ data
            supplier_data: Dictionary with supplier data
            
        Returns:
            Dictionary with match data
        """
        # Calculate days until deadline
        if 'deadline' in rfq_data:
            try:
                deadline = datetime.fromisoformat(rfq_data['deadline'].replace('Z', '+00:00'))
                days_until_deadline = max(1, (deadline - datetime.now()).days)
            except:
                days_until_deadline = 30  # Default
        else:
            days_until_deadline = 30  # Default
        
        # Calculate years in business
        years_in_business = 1
        if 'yearFounded' in supplier_data and supplier_data['yearFounded']:
            current_year = datetime.now().year
            years_in_business = max(1, current_year - supplier_data['yearFounded'])
        
        # Check location match
        location_match = 0
        if ('location' in rfq_data and 'location' in supplier_data and 
            rfq_data['location'] and supplier_data['location']):
            if rfq_data['location'].lower() == supplier_data['location'].lower():
                location_match = 1
        
        # Check category match
        category_match = 0
        if ('category' in rfq_data and 'industry' in supplier_data and 
            rfq_data['category'] and supplier_data['industry']):
            if rfq_data['category'].lower() == supplier_data['industry'].lower():
                category_match = 1
        
        # Create match data
        match_data = {
            'rfq_quantity': int(rfq_data.get('quantity', 1)),
            'rfq_deadline_days': days_until_deadline,
            'rfq_estimated_value': float(rfq_data.get('estimatedValue', 10000)),
            'rfq_priority': int(rfq_data.get('priority', 2)),
            'supplier_rating': float(supplier_data.get('userFeedback', 80)),
            'supplier_compliance_score': float(supplier_data.get('complianceScore', 80)),
            'supplier_financial_stability': float(supplier_data.get('financialStability', 80)),
            'supplier_late_delivery_rate': float(supplier_data.get('lateDeliveryRate', 5)),
            'supplier_years_in_business': years_in_business,
            'location_match': location_match,
            'category_match': category_match
        }
        
        return match_data
    
    def predict_match_for_rfq(self, rfq_data, suppliers):
        """
        Predict matches for an RFQ with multiple suppliers
        
        Args:
            rfq_data: Dictionary with RFQ data
            suppliers: List of dictionaries with supplier data
            
        Returns:
            List of dictionaries with match predictions and explanations
        """
        matches = []
        
        for supplier in suppliers:
            # Create match data
            match_data = self._create_match_data(rfq_data, supplier)
            
            # Get match score
            match_score = self.predict_match(match_data)
            match_category = self.get_match_category(match_score)
            
            # Get a simplified explanation
            explanation = self.explain_prediction(match_data, simplified=True)
            
            matches.append({
                'supplier_id': supplier.get('id'),
                'supplier_name': supplier.get('companyName', 'Unknown Supplier'),
                'match_score': float(match_score),
                'match_category': match_category,
                'key_strengths': explanation.get('key_strengths', []),
                'key_weaknesses': explanation.get('key_weaknesses', [])
            })
        
        # Sort by match score (descending)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return matches
    
    def explain_prediction(self, match_data, simplified=False):
        """
        Explain the match prediction
        
        Args:
            match_data: Dictionary with match features
            simplified: Whether to return a simplified explanation
            
        Returns:
            Dictionary with explanation data
        """
        if self.model is None or self.scaler is None:
            self._load_or_train_model()
            
        # Get match score
        match_score = self.predict_match(match_data)
        match_category = self.get_match_category(match_score)
        
        # Extract features
        X = self._extract_features(match_data)
        X_scaled = self.scaler.transform(X)
        
        # Get LIME explanation
        exp = self.explainer.explain_instance(
            X_scaled[0], 
            self.model.predict_proba,
            num_features=len(FEATURES),
            labels=(1,)  # Explain the "match" class
        )
        
        # Extract feature importance from explanation
        feature_importance = []
        for feature, importance in exp.as_list(label=1):
            feature_importance.append({
                'feature': feature,
                'importance': abs(importance),
                'direction': 'positive' if importance > 0 else 'negative'
            })
        
        # Sort by importance
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        # Create visualization from model's feature importance
        model_feature_importance = self.model.feature_importances_
        visualization_img = None
        if not simplified:
            visualization_img = self._plot_feature_importance(model_feature_importance, FEATURES)
        
        # Generate explanation text
        explanation_text = self._generate_explanation_text(match_score, match_category, feature_importance)
        
        # Extract key strengths and weaknesses
        strengths = []
        weaknesses = []
        
        for item in feature_importance[:4]:  # Top 4 features
            feature = item['feature']
            importance = item['importance']
            direction = item['direction']
            feature_value = match_data.get(feature, "N/A")
            
            if feature in FEATURE_DESCRIPTIONS:
                feature_desc = FEATURE_DESCRIPTIONS[feature]
            else:
                feature_desc = feature.replace('_', ' ').title()
            
            if direction == 'positive':
                strengths.append({
                    'feature': feature,
                    'description': feature_desc,
                    'value': feature_value,
                    'importance': float(importance)
                })
            else:
                weaknesses.append({
                    'feature': feature,
                    'description': feature_desc,
                    'value': feature_value,
                    'importance': float(importance)
                })
        
        result = {
            'match_score': float(match_score),
            'match_category': match_category,
            'explanation_text': explanation_text,
            'feature_importance': feature_importance,
            'key_strengths': strengths[:2],  # Top 2 strengths
            'key_weaknesses': weaknesses[:2]  # Top 2 weaknesses
        }
        
        if not simplified:
            result['visualization_data'] = visualization_img
        
        return result
    
    def _generate_explanation_text(self, match_score, match_category, feature_importance):
        """Generate natural language explanation text"""
        top_features = feature_importance[:3]
        
        explanation = f"The supplier has a match score of {match_score:.1f} out of 100, "
        explanation += f"categorized as '{match_category}'. "
        
        if top_features:
            explanation += "The most significant factors in this assessment are: "
            
            for i, feature in enumerate(top_features):
                if i > 0:
                    explanation += "; " if i < len(top_features) - 1 else "; and "
                    
                feature_name = feature['feature'].replace('_', ' ').title()
                if feature['direction'] == 'positive':
                    explanation += f"{feature_name} which increases match quality"
                else:
                    explanation += f"{feature_name} which decreases match quality"
        
        return explanation

# Create a singleton instance
rfq_matching_model = RfqMatchingModel()

# Simple test if run directly
if __name__ == "__main__":
    # Test with sample data
    test_match_data = {
        'rfq_quantity': 100,
        'rfq_deadline_days': 45,
        'rfq_estimated_value': 25000,
        'rfq_priority': 2,
        'supplier_rating': 85,
        'supplier_compliance_score': 90,
        'supplier_financial_stability': 80,
        'supplier_late_delivery_rate': 5,
        'supplier_years_in_business': 8,
        'location_match': 1,
        'category_match': 1
    }
    
    match_score = rfq_matching_model.predict_match(test_match_data)
    match_category = rfq_matching_model.get_match_category(match_score)
    explanation = rfq_matching_model.explain_prediction(test_match_data)
    
    print(f"Match Score: {match_score}")
    print(f"Match Category: {match_category}")
    print(f"Explanation: {explanation['explanation_text']}")
    print(f"Feature Importance: {explanation['feature_importance']}")
    print(f"Key Strengths: {explanation['key_strengths']}")
    print(f"Key Weaknesses: {explanation['key_weaknesses']}")