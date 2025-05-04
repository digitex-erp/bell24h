#!/usr/bin/env python3
"""
RFQ Matching Script

This script provides an interface for the TypeScript server to interact with
the RFQ matching model with explainability.
"""

import sys
import os
import json
from typing import Dict, List, Any, Optional

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our explainable AI module
from explainable.rfq_matching_model import rfq_matching_model

def match_rfq(rfq_data: Dict[str, Any], suppliers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Predict matches between an RFQ and multiple suppliers
    
    Args:
        rfq_data: Dictionary containing RFQ data
        suppliers: List of supplier dictionaries
        
    Returns:
        List of dictionaries with match predictions and explanations
    """
    return rfq_matching_model.predict_match_for_rfq(rfq_data, suppliers)

def explain_match(rfq_data: Dict[str, Any], supplier_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate an explanation for a specific RFQ-Supplier match
    
    Args:
        rfq_data: Dictionary containing RFQ data
        supplier_data: Dictionary containing supplier data
        
    Returns:
        Dictionary with explanation data and visualization
    """
    # Create match data
    match_data = rfq_matching_model._create_match_data(rfq_data, supplier_data)
    
    # Generate explanation
    return rfq_matching_model.explain_prediction(match_data)

def main():
    """Main entry point for the script"""
    if len(sys.argv) != 2:
        print(json.dumps({
            "error": "Invalid arguments. Usage: rfq_matching.py <args_file>"
        }))
        sys.exit(1)
        
    args_file = sys.argv[1]
    
    try:
        with open(args_file, 'r') as f:
            args = json.load(f)
            
        action = args.get('action')
        
        if not action:
            print(json.dumps({
                "error": "Missing required argument: action"
            }))
            sys.exit(1)
            
        if action == 'match_rfq':
            rfq = args.get('rfq')
            suppliers = args.get('suppliers')
            
            if not rfq or not suppliers:
                print(json.dumps({
                    "error": "Missing required arguments: rfq and suppliers"
                }))
                sys.exit(1)
                
            result = match_rfq(rfq, suppliers)
            
        elif action == 'explain_match':
            rfq = args.get('rfq')
            supplier = args.get('supplier')
            
            if not rfq or not supplier:
                print(json.dumps({
                    "error": "Missing required arguments: rfq and supplier"
                }))
                sys.exit(1)
                
            result = explain_match(rfq, supplier)
            
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