#!/usr/bin/env python3
"""
Supplier Risk Assessment Script

This script provides an interface for the TypeScript server to interact with
the supplier risk assessment model with explainability.
"""

import sys
import os
import json
from typing import Dict, Any, Optional

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our explainable AI module
from explainable.supplier_risk_model import supplier_risk_model

def predict_risk(supplier_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict the risk score for a supplier
    
    Args:
        supplier_data: Dictionary containing supplier data
        
    Returns:
        Dictionary with risk score and category
    """
    risk_score = supplier_risk_model.predict_risk(supplier_data)
    risk_category = supplier_risk_model.get_risk_category(risk_score)
    
    return {
        "risk_score": float(risk_score),
        "risk_category": risk_category
    }

def explain_prediction(supplier_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate an explanation for a risk prediction
    
    Args:
        supplier_data: Dictionary containing supplier data
        
    Returns:
        Dictionary with explanation data and visualization
    """
    return supplier_risk_model.explain_prediction(supplier_data)

def main():
    """Main entry point for the script"""
    if len(sys.argv) != 2:
        print(json.dumps({
            "error": "Invalid arguments. Usage: supplier_risk.py <args_file>"
        }))
        sys.exit(1)
        
    args_file = sys.argv[1]
    
    try:
        with open(args_file, 'r') as f:
            args = json.load(f)
            
        action = args.get('action')
        data = args.get('data')
        
        if not action or not data:
            print(json.dumps({
                "error": "Missing required arguments: action and data"
            }))
            sys.exit(1)
            
        if action == 'predict':
            result = predict_risk(data)
        elif action == 'explain':
            result = explain_prediction(data)
        else:
            print(json.dumps({
                "error": f"Unknown action: {action}"
            }))
            sys.exit(1)
            
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()