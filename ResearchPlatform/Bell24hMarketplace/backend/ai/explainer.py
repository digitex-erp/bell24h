import numpy as np
from typing import List, Dict, Any, Tuple

def get_shap_explanations(features: np.ndarray, weights: np.ndarray, feature_names: List[str]) -> List[List[float]]:
    """
    Calculate SHAP values for feature importance explanation
    
    This is a simplified implementation of SHAP values calculation.
    For a real-world scenario, you would use the SHAP library.
    
    Args:
        features: Feature vectors for all suppliers (n_suppliers x n_features)
        weights: Weight vector for features (n_features)
        feature_names: Names of features
        
    Returns:
        List of SHAP values for each supplier
    """
    try:
        # SHAP value implementation
        # In a simplified model, SHAP values are the contribution of each feature to the prediction
        # SHAP value = feature value * feature weight
        
        # Calculate mean features across all suppliers
        mean_features = np.mean(features, axis=0)
        
        # For each supplier, calculate SHAP values
        shap_values = []
        
        for i in range(features.shape[0]):
            # Calculate SHAP values for this supplier
            # SHAP value = (feature - mean) * weight
            # This gives us the marginal contribution of each feature
            supplier_shap = (features[i] - mean_features) * weights
            shap_values.append(supplier_shap.tolist())
        
        return shap_values
    
    except Exception as e:
        print(f"Error calculating SHAP values: {str(e)}")
        # Return empty explanations as fallback
        return [[0.0] * len(feature_names) for _ in range(features.shape[0])]

def get_lime_explanation(features: np.ndarray, weights: np.ndarray, feature_names: List[str]) -> List[Tuple[str, float]]:
    """
    Generate a LIME-style explanation for a single prediction
    
    Args:
        features: Feature vector for a single supplier
        weights: Weight vector for features
        feature_names: Names of features
        
    Returns:
        List of (feature_name, contribution) pairs
    """
    try:
        # Calculate contribution for each feature
        contributions = features * weights
        
        # Create explanation pairs
        explanation = [(name, contribution) for name, contribution in zip(feature_names, contributions)]
        
        # Sort by absolute contribution
        explanation.sort(key=lambda x: abs(x[1]), reverse=True)
        
        return explanation
    
    except Exception as e:
        print(f"Error generating LIME explanation: {str(e)}")
        return [(name, 0.0) for name in feature_names]

def get_text_explanation(features: np.ndarray, weights: np.ndarray, feature_names: List[str], threshold: float = 0.1) -> str:
    """
    Generate a human-readable text explanation for a prediction
    
    Args:
        features: Feature vector for a single supplier
        weights: Weight vector for features
        feature_names: Names of features
        threshold: Minimum absolute contribution to include in explanation
        
    Returns:
        Text explanation
    """
    try:
        # Get LIME-style explanation
        lime_explanation = get_lime_explanation(features, weights, feature_names)
        
        # Filter to significant contributions
        significant = [(name, value) for name, value in lime_explanation if abs(value) >= threshold]
        
        if not significant:
            return "No significant factors found."
        
        # Split into positive and negative factors
        positive = [(name, value) for name, value in significant if value > 0]
        negative = [(name, value) for name, value in significant if value < 0]
        
        explanation_parts = []
        
        if positive:
            positive_text = "This supplier is a good match because: " + ", ".join(
                f"{name} (+{value:.2f})" for name, value in positive
            )
            explanation_parts.append(positive_text)
        
        if negative:
            negative_text = "However, consider these factors: " + ", ".join(
                f"{name} ({value:.2f})" for name, value in negative
            )
            explanation_parts.append(negative_text)
        
        return " ".join(explanation_parts)
    
    except Exception as e:
        print(f"Error generating text explanation: {str(e)}")
        return "Unable to generate explanation."
