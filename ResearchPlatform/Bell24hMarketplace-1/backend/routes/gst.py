from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..utils.gst_validator import GSTValidator

router = APIRouter(prefix="/api/gst", tags=["gst"])
gst_validator = GSTValidator()

class GSTValidationRequest(BaseModel):
    gst_number: str

class GSTValidationResponse(BaseModel):
    valid: bool
    details: Optional[dict] = None
    message: str

@router.post("/validate", response_model=GSTValidationResponse)
async def validate_gst(request: GSTValidationRequest):
    if not gst_validator.validate_format(request.gst_number):
        return GSTValidationResponse(
            valid=False,
            message="Invalid GST number format"
        )

    if not gst_validator.validate_checksum(request.gst_number):
        return GSTValidationResponse(
            valid=False,
            message="Invalid GST number checksum"
        )

    details = await gst_validator.verify_gst_details(request.gst_number)
    if not details:
        return GSTValidationResponse(
            valid=False,
            message="Could not verify GST details"
        )

    return GSTValidationResponse(
        valid=True,
        details=details,
        message="GST number is valid"
    )

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from backend.routes.auth import get_current_user
from backend.utils.gst_validator import validate_gstin
from backend.database import supabase
from datetime import datetime

router2 = APIRouter()

from fastapi import BackgroundTasks
from typing import List

@router2.post("/validate", response_model=Dict[str, Any])
async def validate_gst(
    gst_data: Dict[str, str],
    background_tasks: BackgroundTasks,
    detailed: bool = False,
    current_user = Depends(get_current_user)
):
    """Validate a GSTIN using the India GST API"""
    try:
        gstin = gst_data.get("gstin")
        
        if not gstin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GSTIN is required"
            )
        
        # Validate GSTIN format
        if len(gstin) != 15:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GSTIN must be 15 characters long"
            )
        
        # Call GST validation service
        validation_result = await validate_gstin(gstin)
        
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation_result["message"]
            )
        
        # If the current user is a supplier, update their profile
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        
        if profile_response.data and profile_response.data[0]["role"] == "supplier":
            # Update GSTIN validation status
            update_data = {
                "gstin_verified": True,
                "gstin_verified_at": datetime.utcnow().isoformat(),
                "gstin_legal_name": validation_result.get("legal_name"),
                "gstin_address": validation_result.get("address"),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("user_profiles").update(update_data).eq("id", current_user.id).execute()
        
        return {
            "valid": True,
            "gstin": gstin,
            "legal_name": validation_result.get("legal_name"),
            "address": validation_result.get("address"),
            "message": "GSTIN validation successful"
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate GSTIN: {str(e)}"
        )

@router2.post("/bulk-validate", response_model=Dict[str, Any])
async def bulk_validate_gst(
    gst_data: Dict[str, list],
    current_user = Depends(get_current_user)
):
    """Bulk validate multiple GSTINs (admin only)"""
    try:
        # Ensure user is an admin
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        
        if not profile_response.data or profile_response.data[0]["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can perform bulk GSTIN validation"
            )
        
        gstins = gst_data.get("gstins", [])
        
        if not gstins:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No GSTINs provided"
            )
        
        results = []
        
        for gstin in gstins:
            try:
                # Validate GSTIN
                validation_result = await validate_gstin(gstin)
                
                # Get supplier with this GSTIN
                supplier_response = supabase.table("user_profiles").select("id").eq("gstin", gstin).execute()
                
                if supplier_response.data:
                    supplier_id = supplier_response.data[0]["id"]
                    
                    # Update GSTIN validation status
                    update_data = {
                        "gstin_verified": validation_result["valid"],
                        "updated_at": datetime.utcnow().isoformat()
                    }
                    
                    if validation_result["valid"]:
                        update_data.update({
                            "gstin_verified_at": datetime.utcnow().isoformat(),
                            "gstin_legal_name": validation_result.get("legal_name"),
                            "gstin_address": validation_result.get("address")
                        })
                    
                    supabase.table("user_profiles").update(update_data).eq("id", supplier_id).execute()
                
                results.append({
                    "gstin": gstin,
                    "valid": validation_result["valid"],
                    "message": validation_result["message"]
                })
            
            except Exception as e:
                results.append({
                    "gstin": gstin,
                    "valid": False,
                    "message": str(e)
                })
        
        return {
            "results": results,
            "total": len(gstins),
            "successful": sum(1 for result in results if result["valid"])
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform bulk GSTIN validation: {str(e)}"
        )