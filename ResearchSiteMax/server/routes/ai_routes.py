"""
AI API Routes for Bell24h

This module defines the API routes for AI functionality in Bell24h.com,
including supplier risk assessment and RFQ matching with explainability.
"""

import sys
import os
from typing import Dict, List, Any
import json

# Add the server directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.ai import supplier_risk_model, rfq_matching_model
from storage import storage

# Create a router
def register_ai_routes(app):
    """
    Register AI API routes with the Express app.
    
    Args:
        app: Express application instance
    """
    
    # Supplier Risk Assessment Routes
    
    @app.get("/api/ai/supplier-risk/:supplierId")
    async def get_supplier_risk(req, res):
        """Get risk assessment for a supplier with explanation."""
        try:
            supplier_id = int(req.params.supplierId)
            
            # Get supplier data
            supplier = await storage.getSupplier(supplier_id)
            if not supplier:
                return res.status(404).json({
                    "success": False,
                    "message": "Supplier not found"
                })
            
            # Get user data for additional supplier info
            user = await storage.getUser(supplier.userId)
            if not user:
                return res.status(404).json({
                    "success": False,
                    "message": "Supplier user not found"
                })
            
            # Prepare data for risk model
            supplier_data = {
                'late_delivery_rate': supplier.lateDeliveryRate or 0,
                'compliance_score': supplier.complianceScore or 100,
                'financial_stability': supplier.financialStability or 100,
                'user_feedback': supplier.userFeedback or 100,
                'order_fulfillment_rate': 100 - (supplier.lateDeliveryRate or 0),
                'payment_timeliness': 100, # Default value
                'quality_rating': supplier.userFeedback or 80,
                'communication_rating': supplier.userFeedback or 80,
                'years_in_business': user.yearFounded and (2024 - user.yearFounded) or 1,
                'certifications_count': len(supplier.certifications or []),
                'dispute_ratio': 0, # Default value
                'average_response_time': 24, # Default value, in hours
                'repeat_business_rate': 0.7 # Default value, 70%
            }
            
            # Get risk assessment with explanation
            result = supplier_risk_model.explain_prediction(supplier_data)
            
            # Add supplier info to result
            result["supplier"] = {
                "id": supplier.id,
                "name": user.companyName,
                "industry": supplier.industry
            }
            
            return res.json({
                "success": True,
                "data": result
            })
            
        except Exception as e:
            print(f"Error in supplier risk assessment: {str(e)}")
            return res.status(500).json({
                "success": False,
                "message": f"Error in risk assessment: {str(e)}"
            })
    
    @app.get("/api/ai/supplier-risk/batch")
    async def get_batch_supplier_risk(req, res):
        """Get risk assessment for multiple suppliers."""
        try:
            # Get supplier IDs from query params
            supplier_ids_param = req.query.supplierIds
            if not supplier_ids_param:
                return res.status(400).json({
                    "success": False,
                    "message": "No supplier IDs provided"
                })
            
            # Parse supplier IDs
            try:
                supplier_ids = [int(id) for id in supplier_ids_param.split(',')]
            except:
                return res.status(400).json({
                    "success": False,
                    "message": "Invalid supplier IDs format"
                })
            
            # Get risk assessment for each supplier
            results = []
            for supplier_id in supplier_ids:
                # Get supplier data
                supplier = await storage.getSupplier(supplier_id)
                if not supplier:
                    continue
                
                # Get user data
                user = await storage.getUser(supplier.userId)
                if not user:
                    continue
                
                # Prepare data for risk model
                supplier_data = {
                    'late_delivery_rate': supplier.lateDeliveryRate or 0,
                    'compliance_score': supplier.complianceScore or 100,
                    'financial_stability': supplier.financialStability or 100,
                    'user_feedback': supplier.userFeedback or 100,
                    'order_fulfillment_rate': 100 - (supplier.lateDeliveryRate or 0),
                    'payment_timeliness': 100,
                    'quality_rating': supplier.userFeedback or 80,
                    'communication_rating': supplier.userFeedback or 80,
                    'years_in_business': user.yearFounded and (2024 - user.yearFounded) or 1,
                    'certifications_count': len(supplier.certifications or []),
                    'dispute_ratio': 0,
                    'average_response_time': 24,
                    'repeat_business_rate': 0.7
                }
                
                # Get risk score (without full explanation for batch processing)
                risk_score = supplier_risk_model.predict_risk(supplier_data)
                risk_category = supplier_risk_model.get_risk_category(risk_score)
                
                results.append({
                    "supplier_id": supplier.id,
                    "supplier_name": user.companyName,
                    "risk_score": risk_score,
                    "risk_category": risk_category
                })
            
            return res.json({
                "success": True,
                "data": results
            })
            
        except Exception as e:
            print(f"Error in batch supplier risk assessment: {str(e)}")
            return res.status(500).json({
                "success": False,
                "message": f"Error in batch risk assessment: {str(e)}"
            })
    
    # RFQ Matching Routes
    
    @app.get("/api/ai/rfq-match/:rfqId")
    async def get_rfq_matches(req, res):
        """Get supplier matches for an RFQ with explanations."""
        try:
            rfq_id = int(req.params.rfqId)
            
            # Get RFQ data
            rfq = await storage.getRfq(rfq_id)
            if not rfq:
                return res.status(404).json({
                    "success": False,
                    "message": "RFQ not found"
                })
            
            # Get suppliers to match
            suppliers = await storage.getAllSuppliers()
            if not suppliers:
                return res.status(404).json({
                    "success": False,
                    "message": "No suppliers found"
                })
            
            # Prepare RFQ data for matching
            rfq_data = {
                "id": rfq.id,
                "title": rfq.title,
                "description": rfq.description,
                "category": rfq.category,
                "quantity": rfq.quantity,
                "deadline": rfq.deadline,
                "estimatedValue": rfq.estimatedValue or 5000,  # Default value
                "location": rfq.location or "India",
                "attachments": rfq.attachments,
                "priority": rfq.priority or 2  # Default medium priority
            }
            
            # Enhance supplier data for matching
            enhanced_suppliers = []
            for supplier in suppliers:
                user = await storage.getUser(supplier.userId)
                if not user:
                    continue
                
                # Add user data to supplier
                enhanced_supplier = {
                    **supplier,
                    "companyName": user.companyName,
                    "email": user.email,
                    "location": user.location,
                    "yearFounded": user.yearFounded
                }
                
                enhanced_suppliers.append(enhanced_supplier)
            
            # Get matches with explanations
            matches = rfq_matching_model.predict_match_for_rfq(rfq_data, enhanced_suppliers)
            
            return res.json({
                "success": True,
                "data": {
                    "rfq": {
                        "id": rfq.id,
                        "title": rfq.title,
                        "category": rfq.category
                    },
                    "matches": matches
                }
            })
            
        except Exception as e:
            print(f"Error in RFQ matching: {str(e)}")
            return res.status(500).json({
                "success": False,
                "message": f"Error in RFQ matching: {str(e)}"
            })
    
    @app.get("/api/ai/explain-match")
    async def explain_match(req, res):
        """Get explanation for a specific RFQ-Supplier match."""
        try:
            rfq_id = int(req.query.rfqId)
            supplier_id = int(req.query.supplierId)
            
            # Get RFQ and supplier data
            rfq = await storage.getRfq(rfq_id)
            supplier = await storage.getSupplier(supplier_id)
            
            if not rfq or not supplier:
                return res.status(404).json({
                    "success": False,
                    "message": "RFQ or supplier not found"
                })
            
            # Get user data for supplier
            user = await storage.getUser(supplier.userId)
            if not user:
                return res.status(404).json({
                    "success": False,
                    "message": "Supplier user not found"
                })
            
            # Prepare RFQ data
            rfq_data = {
                "id": rfq.id,
                "title": rfq.title,
                "description": rfq.description,
                "category": rfq.category,
                "quantity": rfq.quantity,
                "deadline": rfq.deadline,
                "estimatedValue": rfq.estimatedValue or 5000,
                "location": rfq.location or "India",
                "attachments": rfq.attachments,
                "priority": rfq.priority or 2
            }
            
            # Prepare supplier data
            supplier_data = {
                **supplier,
                "companyName": user.companyName,
                "email": user.email,
                "location": user.location,
                "yearFounded": user.yearFounded
            }
            
            # Create match data
            match_data = rfq_matching_model._create_match_data(rfq_data, supplier_data)
            
            # Get detailed explanation
            explanation = rfq_matching_model.explain_prediction(match_data)
            
            # Add context to result
            result = {
                "rfq": {
                    "id": rfq.id,
                    "title": rfq.title,
                    "category": rfq.category
                },
                "supplier": {
                    "id": supplier.id,
                    "name": user.companyName,
                    "industry": supplier.industry
                },
                **explanation
            }
            
            return res.json({
                "success": True,
                "data": result
            })
            
        except Exception as e:
            print(f"Error in match explanation: {str(e)}")
            return res.status(500).json({
                "success": False,
                "message": f"Error in match explanation: {str(e)}"
            })
    
    return app