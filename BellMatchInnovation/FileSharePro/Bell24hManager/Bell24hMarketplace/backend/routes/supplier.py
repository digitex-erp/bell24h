from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from typing import List, Optional, Dict, Any
from datetime import datetime

from backend.database import get_db, supabase, fetch_one, fetch_many
from backend.routes.auth import get_current_user
from backend.models.supplier import SupplierDetail, SupplierBid, SupplierMetrics

router = APIRouter()

@router.get("/bids", response_model=List[SupplierBid])
async def get_supplier_bids(current_user = Depends(get_current_user)):
    """Get all bids placed by the current supplier"""
    try:
        # Ensure user is a supplier
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        
        if not profile_response.data or profile_response.data[0]["role"] != "supplier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only suppliers can access this endpoint"
            )
        
        # Get supplier's bids
        bid_response = supabase.table("bids").select("*").eq("supplier_id", current_user.id).order("created_at", desc=True).execute()
        
        if not bid_response.data:
            return []
        
        bids = bid_response.data
        
        # Get RFQ details for each bid
        rfq_ids = [bid["rfq_id"] for bid in bids]
        rfq_response = supabase.table("rfqs").select("id, title, status").in_("id", rfq_ids).execute()
        rfq_details = {rfq["id"]: rfq for rfq in rfq_response.data}
        
        # Combine data for response
        result = []
        for bid in bids:
            rfq_id = bid["rfq_id"]
            rfq = rfq_details.get(rfq_id, {})
            
            bid_with_details = {
                **bid,
                "rfq_title": rfq.get("title", "Unknown RFQ"),
                "rfq_status": rfq.get("status", "unknown")
            }
            result.append(bid_with_details)
        
        return result
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get supplier bids: {str(e)}"
        )

@router.get("/metrics", response_model=SupplierMetrics)
async def get_supplier_metrics(current_user = Depends(get_current_user)):
    """Get performance metrics for the current supplier"""
    try:
        # Ensure user is a supplier
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        
        if not profile_response.data or profile_response.data[0]["role"] != "supplier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only suppliers can access this endpoint"
            )
        
        # Get supplier metrics
        metrics_response = supabase.table("supplier_metrics").select("*").eq("supplier_id", current_user.id).execute()
        
        # If no metrics yet, return default values
        if not metrics_response.data:
            return {
                "completion_rate": 0.0,
                "avg_rating": 0.0,
                "avg_delivery_days": 0.0,
                "total_completed": 0
            }
        
        metrics = metrics_response.data[0]
        
        # Return formatted metrics
        return {
            "completion_rate": metrics["completion_rate"],
            "avg_rating": metrics["avg_rating"],
            "avg_delivery_days": metrics["avg_delivery_days"],
            "total_completed": metrics["total_completed"]
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get supplier metrics: {str(e)}"
        )

@router.get("/{supplier_id}", response_model=SupplierDetail)
async def get_supplier_details(
    supplier_id: str = Path(..., description="The ID of the supplier"),
    current_user = Depends(get_current_user)
):
    """Get detailed information about a supplier"""
    try:
        # Get supplier profile
        supplier_response = supabase.table("user_profiles").select("*").eq("id", supplier_id).eq("role", "supplier").execute()
        
        if not supplier_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        supplier = supplier_response.data[0]
        
        # Get supplier metrics
        metrics_response = supabase.table("supplier_metrics").select("*").eq("supplier_id", supplier_id).execute()
        
        metrics = metrics_response.data[0] if metrics_response.data else {
            "completion_rate": 0.0,
            "avg_rating": 0.0,
            "avg_delivery_days": 0.0,
            "total_completed": 0
        }
        
        # Get supplier categories/specializations
        specializations_response = supabase.table("supplier_specializations").select("category").eq("supplier_id", supplier_id).execute()
        specializations = [item["category"] for item in specializations_response.data] if specializations_response.data else []
        
        # Combine data for response
        supplier_detail = {
            "id": supplier["id"],
            "name": supplier["name"],
            "company_name": supplier["company"],
            "email": supplier["email"],
            "gstin": supplier["gstin"],
            "is_gst_verified": supplier["is_verified"],
            "city": supplier.get("city", ""),
            "state": supplier.get("state", ""),
            "specializations": specializations,
            "completion_rate": metrics["completion_rate"],
            "avg_delivery_days": metrics["avg_delivery_days"],
            "rating": metrics["avg_rating"],
            "total_completed": metrics["total_completed"],
            "price_competitiveness": supplier.get("price_competitiveness", "medium")
        }
        
        return supplier_detail
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get supplier details: {str(e)}"
        )

@router.post("/specializations", response_model=Dict[str, Any])
async def update_specializations(
    specializations: List[str],
    current_user = Depends(get_current_user)
):
    """Update supplier specializations/categories"""
    try:
        # Ensure user is a supplier
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        
        if not profile_response.data or profile_response.data[0]["role"] != "supplier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only suppliers can update specializations"
            )
        
        # Delete existing specializations
        supabase.table("supplier_specializations").delete().eq("supplier_id", current_user.id).execute()
        
        # Insert new specializations
        if specializations:
            specialization_data = [
                {"supplier_id": current_user.id, "category": category}
                for category in specializations
            ]
            
            insert_response = supabase.table("supplier_specializations").insert(specialization_data).execute()
            
            if not insert_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update specializations"
                )
        
        return {"detail": "Specializations updated successfully"}
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update specializations: {str(e)}"
        )

@router.post("/profile", response_model=Dict[str, Any])
async def update_supplier_profile(
    profile_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Update supplier profile information"""
    try:
        # Ensure user is a supplier
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        
        if not profile_response.data or profile_response.data[0]["role"] != "supplier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only suppliers can update their profile"
            )
        
        # Fields that can be updated
        allowed_fields = ["company", "city", "state", "phone", "address", "pincode"]
        update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Update profile
        if update_data:
            update_response = supabase.table("user_profiles").update(update_data).eq("id", current_user.id).execute()
            
            if not update_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update profile"
                )
        
        return {"detail": "Profile updated successfully"}
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )
