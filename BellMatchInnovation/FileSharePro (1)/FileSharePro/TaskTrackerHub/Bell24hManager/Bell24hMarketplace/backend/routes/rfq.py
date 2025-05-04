from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from backend.database import get_db, supabase, fetch_one, fetch_many, insert, update
from backend.routes.auth import get_current_user
from backend.models.rfq import RFQCreate, RFQResponse, RFQDetail, BidCreate, BidResponse
from backend.models.supplier import SupplierWithScore, SupplierDetail
from backend.ai.matching_engine import match_suppliers_for_rfq
from backend.ai.rfq_categorizer import categorize_rfq
from backend.routes.websocket import broadcast_message

router = APIRouter()

@router.post("/create", response_model=RFQResponse)
async def create_rfq(rfq_data: RFQCreate, current_user = Depends(get_current_user)):
    """Create a new RFQ"""
    try:
        # Ensure user is a buyer
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        
        if not profile_response.data or profile_response.data[0]["role"] != "buyer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only buyers can create RFQs"
            )
        
        # Generate a new ID
        rfq_id = str(uuid.uuid4())
        
        # Calculate deadline (30 days from now by default)
        deadline = datetime.utcnow() + timedelta(days=30)
        
        # Use AI to categorize RFQ if no category is provided
        if not rfq_data.category or rfq_data.category == "other":
            predicted_category = await categorize_rfq(
                title=rfq_data.title,
                description=rfq_data.description
            )
            if predicted_category:
                rfq_data.category = predicted_category
        
        # Prepare RFQ data
        rfq_db_data = {
            "id": rfq_id,
            "buyer_id": current_user.id,
            "title": rfq_data.title,
            "description": rfq_data.description,
            "category": rfq_data.category,
            "quantity": rfq_data.quantity,
            "budget": rfq_data.budget,
            "delivery_days": rfq_data.delivery_days,
            "requirements": rfq_data.requirements,
            "address": rfq_data.address,
            "city": rfq_data.city,
            "state": rfq_data.state,
            "pincode": rfq_data.pincode,
            "status": "open",
            "deadline": deadline.isoformat(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Insert RFQ into database
        rfq_response = supabase.table("rfqs").insert(rfq_db_data).execute()
        
        if not rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create RFQ"
            )
        
        created_rfq = rfq_response.data[0]
        
        # Get buyer name for response
        buyer_response = supabase.table("user_profiles").select("name").eq("id", current_user.id).execute()
        buyer_name = buyer_response.data[0]["name"] if buyer_response.data else "Unknown Buyer"
        
        # Combine data for response
        rfq_with_buyer = {
            **created_rfq,
            "buyer_name": buyer_name,
            "bid_count": 0
        }
        
        # Broadcast notification to relevant suppliers
        await broadcast_message("new_rfq", rfq_with_buyer)
        
        return rfq_with_buyer
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create RFQ: {str(e)}"
        )

@router.get("/buyer", response_model=List[RFQResponse])
async def get_buyer_rfqs(current_user = Depends(get_current_user)):
    """Get all RFQs created by the current user (buyer)"""
    try:
        # Get RFQs
        rfq_response = supabase.table("rfqs").select("*").eq("buyer_id", current_user.id).order("created_at", desc=True).execute()
        
        if not rfq_response.data:
            return []
        
        rfqs = rfq_response.data
        
        # Get bid counts
        bid_counts = {}
        bid_response = supabase.table("bids").select("rfq_id, count", count="exact").eq("rfq_id", rfqs[0]["id"]).group_by("rfq_id").execute()
        
        for rfq in rfqs:
            rfq_id = rfq["id"]
            matching_bids = [bid for bid in bid_response.data if bid["rfq_id"] == rfq_id]
            bid_counts[rfq_id] = matching_bids[0]["count"] if matching_bids else 0
        
        # Get buyer name
        buyer_response = supabase.table("user_profiles").select("name").eq("id", current_user.id).execute()
        buyer_name = buyer_response.data[0]["name"] if buyer_response.data else "Unknown Buyer"
        
        # Add buyer name and bid count to each RFQ
        result = []
        for rfq in rfqs:
            rfq_with_details = {
                **rfq,
                "buyer_name": buyer_name,
                "bid_count": bid_counts.get(rfq["id"], 0)
            }
            result.append(rfq_with_details)
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve RFQs: {str(e)}"
        )

@router.get("/active", response_model=List[RFQResponse])
async def get_active_rfqs(current_user = Depends(get_current_user)):
    """Get all active RFQs (for suppliers)"""
    try:
        # Ensure user is a supplier
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        
        if not profile_response.data or profile_response.data[0]["role"] != "supplier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only suppliers can access this endpoint"
            )
        
        # Get active RFQs
        rfq_response = supabase.table("rfqs").select("*").eq("status", "open").order("created_at", desc=True).execute()
        
        if not rfq_response.data:
            return []
        
        rfqs = rfq_response.data
        
        # Get buyer names
        buyer_ids = [rfq["buyer_id"] for rfq in rfqs]
        buyer_response = supabase.table("user_profiles").select("id, name").in_("id", buyer_ids).execute()
        buyer_names = {buyer["id"]: buyer["name"] for buyer in buyer_response.data}
        
        # Get bid counts
        bid_counts = {}
        for rfq in rfqs:
            bid_count_response = supabase.table("bids").select("count", count="exact").eq("rfq_id", rfq["id"]).execute()
            bid_counts[rfq["id"]] = bid_count_response.count
        
        # Add buyer name and bid count to each RFQ
        result = []
        for rfq in rfqs:
            rfq_with_details = {
                **rfq,
                "buyer_name": buyer_names.get(rfq["buyer_id"], "Unknown Buyer"),
                "bid_count": bid_counts.get(rfq["id"], 0)
            }
            result.append(rfq_with_details)
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve active RFQs: {str(e)}"
        )

@router.get("/{rfq_id}", response_model=RFQDetail)
async def get_rfq_detail(
    rfq_id: str = Path(..., description="The ID of the RFQ to get"),
    current_user = Depends(get_current_user)
):
    """Get detailed information about an RFQ"""
    try:
        # Get RFQ
        rfq_response = supabase.table("rfqs").select("*").eq("id", rfq_id).execute()
        
        if not rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        rfq = rfq_response.data[0]
        
        # Get buyer name
        buyer_response = supabase.table("user_profiles").select("name").eq("id", rfq["buyer_id"]).execute()
        buyer_name = buyer_response.data[0]["name"] if buyer_response.data else "Unknown Buyer"
        
        # Get bid count
        bid_count_response = supabase.table("bids").select("count", count="exact").eq("rfq_id", rfq_id).execute()
        bid_count = bid_count_response.count
        
        # If RFQ is in progress, get selected supplier details
        selected_supplier_name = None
        if rfq["status"] == "in_progress" and rfq.get("selected_supplier_id"):
            supplier_response = supabase.table("user_profiles").select("name").eq("id", rfq["selected_supplier_id"]).execute()
            selected_supplier_name = supplier_response.data[0]["name"] if supplier_response.data else "Unknown Supplier"
        
        # Combine data for response
        rfq_detail = {
            **rfq,
            "buyer_name": buyer_name,
            "bid_count": bid_count,
            "selected_supplier_name": selected_supplier_name
        }
        
        return rfq_detail
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get RFQ details: {str(e)}"
        )

@router.get("/{rfq_id}/suppliers", response_model=List[SupplierWithScore])
async def get_rfq_suppliers(
    rfq_id: str = Path(..., description="The ID of the RFQ"),
    current_user = Depends(get_current_user)
):
    """Get AI-matched suppliers for an RFQ (for buyers)"""
    try:
        # Get RFQ
        rfq_response = supabase.table("rfqs").select("*").eq("id", rfq_id).execute()
        
        if not rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        rfq = rfq_response.data[0]
        
        # Ensure user is the RFQ owner
        if rfq["buyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view suppliers for this RFQ"
            )
        
        # Get recommended suppliers using AI matching engine
        recommended_suppliers = await match_suppliers_for_rfq(rfq)
        
        return recommended_suppliers
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get suppliers: {str(e)}"
        )

@router.post("/{rfq_id}/bid", response_model=BidResponse)
async def create_bid(
    bid_data: BidCreate,
    rfq_id: str = Path(..., description="The ID of the RFQ to bid on"),
    current_user = Depends(get_current_user)
):
    """Create a new bid for an RFQ (for suppliers)"""
    try:
        # Ensure user is a supplier
        profile_response = supabase.table("user_profiles").select("role, name").eq("id", current_user.id).execute()
        
        if not profile_response.data or profile_response.data[0]["role"] != "supplier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only suppliers can create bids"
            )
        
        supplier_name = profile_response.data[0]["name"]
        
        # Get RFQ
        rfq_response = supabase.table("rfqs").select("*").eq("id", rfq_id).execute()
        
        if not rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        rfq = rfq_response.data[0]
        
        # Ensure RFQ is open for bids
        if rfq["status"] != "open":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This RFQ is not open for bids"
            )
        
        # Check if supplier has already bid on this RFQ
        existing_bid_response = supabase.table("bids").select("*").eq("rfq_id", rfq_id).eq("supplier_id", current_user.id).execute()
        
        if existing_bid_response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already bid on this RFQ"
            )
        
        # Generate a new ID
        bid_id = str(uuid.uuid4())
        
        # Prepare bid data
        bid_db_data = {
            "id": bid_id,
            "rfq_id": rfq_id,
            "supplier_id": current_user.id,
            "price": bid_data.price,
            "delivery_days": bid_data.delivery_days,
            "notes": bid_data.notes,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Insert bid into database
        bid_response = supabase.table("bids").insert(bid_db_data).execute()
        
        if not bid_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create bid"
            )
        
        created_bid = bid_response.data[0]
        
        # Get RFQ title for response
        rfq_title = rfq["title"]
        
        # Combine data for response
        bid_with_details = {
            **created_bid,
            "supplier_name": supplier_name,
            "rfq_title": rfq_title,
            "rfq_status": rfq["status"]
        }
        
        # Broadcast notification to the RFQ owner
        await broadcast_message("new_bid", {
            "bid_id": bid_id,
            "supplier_name": supplier_name,
            "supplier_id": current_user.id,
            "rfq_id": rfq_id,
            "price": bid_data.price,
            "delivery_days": bid_data.delivery_days
        })
        
        return bid_with_details
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create bid: {str(e)}"
        )

@router.get("/{rfq_id}/bids", response_model=List[BidResponse])
async def get_rfq_bids(
    rfq_id: str = Path(..., description="The ID of the RFQ"),
    current_user = Depends(get_current_user)
):
    """Get all bids for an RFQ (for buyers)"""
    try:
        # Get RFQ
        rfq_response = supabase.table("rfqs").select("*").eq("id", rfq_id).execute()
        
        if not rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        rfq = rfq_response.data[0]
        
        # Ensure user is the RFQ owner or an admin
        profile_response = supabase.table("user_profiles").select("role").eq("id", current_user.id).execute()
        user_role = profile_response.data[0]["role"] if profile_response.data else None
        
        if rfq["buyer_id"] != current_user.id and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view bids for this RFQ"
            )
        
        # Get bids
        bid_response = supabase.table("bids").select("*").eq("rfq_id", rfq_id).order("created_at", desc=True).execute()
        
        if not bid_response.data:
            return []
        
        bids = bid_response.data
        
        # Get supplier names
        supplier_ids = [bid["supplier_id"] for bid in bids]
        supplier_response = supabase.table("user_profiles").select("id, name").in_("id", supplier_ids).execute()
        supplier_names = {supplier["id"]: supplier["name"] for supplier in supplier_response.data}
        
        # Add supplier name to each bid
        result = []
        for bid in bids:
            bid_with_details = {
                **bid,
                "supplier_name": supplier_names.get(bid["supplier_id"], "Unknown Supplier"),
                "rfq_title": rfq["title"],
                "rfq_status": rfq["status"]
            }
            result.append(bid_with_details)
        
        return result
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get bids: {str(e)}"
        )

@router.get("/{rfq_id}/user-bid", response_model=Optional[BidResponse])
async def get_user_bid_for_rfq(
    rfq_id: str = Path(..., description="The ID of the RFQ"),
    current_user = Depends(get_current_user)
):
    """Get the current user's bid for an RFQ (for suppliers)"""
    try:
        # Get RFQ
        rfq_response = supabase.table("rfqs").select("*").eq("id", rfq_id).execute()
        
        if not rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        rfq = rfq_response.data[0]
        
        # Get user's bid
        bid_response = supabase.table("bids").select("*").eq("rfq_id", rfq_id).eq("supplier_id", current_user.id).execute()
        
        if not bid_response.data:
            return None
        
        bid = bid_response.data[0]
        
        # Get supplier name
        supplier_response = supabase.table("user_profiles").select("name").eq("id", current_user.id).execute()
        supplier_name = supplier_response.data[0]["name"] if supplier_response.data else "Unknown Supplier"
        
        # Combine data for response
        bid_with_details = {
            **bid,
            "supplier_name": supplier_name,
            "rfq_title": rfq["title"],
            "rfq_status": rfq["status"]
        }
        
        return bid_with_details
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user bid: {str(e)}"
        )

@router.post("/{rfq_id}/accept-bid", response_model=Dict[str, Any])
async def accept_bid(
    bid_data: Dict[str, str],
    rfq_id: str = Path(..., description="The ID of the RFQ"),
    current_user = Depends(get_current_user)
):
    """Accept a bid for an RFQ (for buyers)"""
    try:
        bid_id = bid_data.get("bid_id")
        if not bid_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bid ID is required"
            )
        
        # Get RFQ
        rfq_response = supabase.table("rfqs").select("*").eq("id", rfq_id).execute()
        
        if not rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        rfq = rfq_response.data[0]
        
        # Ensure user is the RFQ owner
        if rfq["buyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to accept bids for this RFQ"
            )
        
        # Ensure RFQ is open
        if rfq["status"] != "open":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This RFQ is not open for accepting bids"
            )
        
        # Get bid
        bid_response = supabase.table("bids").select("*").eq("id", bid_id).execute()
        
        if not bid_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bid not found"
            )
        
        bid = bid_response.data[0]
        
        # Update bid status to accepted
        update_bid_response = supabase.table("bids").update({"status": "accepted", "updated_at": datetime.utcnow().isoformat()}).eq("id", bid_id).execute()
        
        if not update_bid_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update bid status"
            )
        
        # Update all other bids for this RFQ to rejected
        supabase.table("bids").update({"status": "rejected", "updated_at": datetime.utcnow().isoformat()}).eq("rfq_id", rfq_id).neq("id", bid_id).execute()
        
        # Update RFQ status to in_progress and set selected supplier
        update_rfq_response = supabase.table("rfqs").update({
            "status": "in_progress",
            "selected_supplier_id": bid["supplier_id"],
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", rfq_id).execute()
        
        if not update_rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update RFQ status"
            )
        
        # Broadcast notifications
        await broadcast_message("rfq_update", {
            "id": rfq_id,
            "status": "in_progress",
            "selected_supplier_id": bid["supplier_id"]
        })
        
        for _bid in await fetch_many("bids", rfq_id=rfq_id):
            await broadcast_message("bid_status_update", {
                "bid_id": _bid["id"],
                "status": "accepted" if _bid["id"] == bid_id else "rejected",
                "rfq_id": rfq_id
            })
        
        return {
            "detail": "Bid accepted successfully",
            "supplier_id": bid["supplier_id"]
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept bid: {str(e)}"
        )

@router.post("/{rfq_id}/complete", response_model=Dict[str, Any])
async def complete_rfq(
    rfq_id: str = Path(..., description="The ID of the RFQ"),
    current_user = Depends(get_current_user)
):
    """Mark an RFQ as complete (for buyers)"""
    try:
        # Get RFQ
        rfq_response = supabase.table("rfqs").select("*").eq("id", rfq_id).execute()
        
        if not rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RFQ not found"
            )
        
        rfq = rfq_response.data[0]
        
        # Ensure user is the RFQ owner
        if rfq["buyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to complete this RFQ"
            )
        
        # Ensure RFQ is in progress
        if rfq["status"] != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only in-progress RFQs can be marked as complete"
            )
        
        # Update RFQ status to completed
        update_rfq_response = supabase.table("rfqs").update({
            "status": "completed",
            "updated_at": datetime.utcnow().isoformat(),
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", rfq_id).execute()
        
        if not update_rfq_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update RFQ status"
            )
        
        # Update accepted bid status to completed
        supabase.table("bids").update({
            "status": "completed",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("rfq_id", rfq_id).eq("status", "accepted").execute()
        
        # Update supplier metrics
        if rfq.get("selected_supplier_id"):
            # Get supplier profile
            supplier_response = supabase.table("user_profiles").select("*").eq("id", rfq["selected_supplier_id"]).execute()
            
            if supplier_response.data:
                supplier = supplier_response.data[0]
                
                # Get supplier metrics
                metrics_response = supabase.table("supplier_metrics").select("*").eq("supplier_id", rfq["selected_supplier_id"]).execute()
                
                if metrics_response.data:
                    # Update existing metrics
                    metrics = metrics_response.data[0]
                    total_completed = metrics["total_completed"] + 1
                    
                    # Update metrics
                    supabase.table("supplier_metrics").update({
                        "total_completed": total_completed,
                        "completion_rate": total_completed / (total_completed + metrics["total_cancelled"]),
                        "updated_at": datetime.utcnow().isoformat()
                    }).eq("supplier_id", rfq["selected_supplier_id"]).execute()
                else:
                    # Create new metrics
                    supabase.table("supplier_metrics").insert({
                        "supplier_id": rfq["selected_supplier_id"],
                        "completion_rate": 1.0,
                        "avg_rating": 0.0,
                        "avg_delivery_days": rfq["delivery_days"],
                        "total_completed": 1,
                        "total_cancelled": 0,
                        "created_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat()
                    }).execute()
        
        # Broadcast notification
        updated_rfq = update_rfq_response.data[0]
        await broadcast_message("rfq_update", {
            "id": rfq_id,
            "status": "completed"
        })
        
        return {
            "detail": "RFQ marked as complete successfully"
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete RFQ: {str(e)}"
        )
