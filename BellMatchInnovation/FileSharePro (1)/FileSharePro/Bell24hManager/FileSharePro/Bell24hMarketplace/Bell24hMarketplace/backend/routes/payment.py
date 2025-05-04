from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import hmac
import hashlib

from backend.database import get_db, supabase, fetch_one, fetch_many, insert, update
from backend.routes.auth import get_current_user
from backend.models.payment import WalletTransaction, WalletBalance
from backend.utils.razorpay_client import get_razorpay_client
from backend.routes.websocket import broadcast_message

router = APIRouter()

@router.get("/balance", response_model=WalletBalance)
async def get_wallet_balance(current_user = Depends(get_current_user)):
    """Get the current user's wallet balance"""
    try:
        # Get user profile
        profile_response = supabase.table("user_profiles").select("wallet_balance").eq("id", current_user.id).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        balance = profile_response.data[0]["wallet_balance"] or 0
        
        return {"balance": balance}
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get wallet balance: {str(e)}"
        )

@router.get("/transactions", response_model=List[WalletTransaction])
async def get_wallet_transactions(
    limit: int = Query(20, ge=1, le=100),
    current_user = Depends(get_current_user)
):
    """Get the current user's wallet transactions"""
    try:
        # Get transactions
        transaction_response = supabase.table("wallet_transactions").select("*").eq("user_id", current_user.id).order("created_at", desc=True).limit(limit).execute()
        
        if not transaction_response.data:
            return []
        
        return transaction_response.data
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get wallet transactions: {str(e)}"
        )

@router.post("/add-funds", response_model=Dict[str, Any])
async def add_funds_to_wallet(
    amount_data: Dict[str, float],
    current_user = Depends(get_current_user)
):
    """Create a RazorpayX order to add funds to wallet"""
    try:
        amount = amount_data.get("amount")
        
        if not amount or amount < 100:  # Minimum amount is ₹100
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be at least ₹100"
            )
        
        # Get RazorpayX client
        razorpay_client = get_razorpay_client()
        
        # Get user profile
        profile_response = supabase.table("user_profiles").select("name, email").eq("id", current_user.id).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        profile = profile_response.data[0]
        
        # Create a RazorpayX order
        # RazorpayX expects amount in paise (1 rupee = 100 paise)
        order_data = {
            "amount": int(amount * 100),
            "currency": "INR",
            "receipt": f"wallet-{current_user.id}-{uuid.uuid4()}",
            "notes": {
                "user_id": current_user.id,
                "type": "wallet_deposit"
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        # Return order details for frontend to initiate payment
        return {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": razorpay_client.key_id,
            "user_name": profile["name"],
            "user_email": profile["email"]
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )

@router.post("/verify-payment", response_model=Dict[str, Any])
async def verify_razorpay_payment(
    payment_data: Dict[str, str],
    current_user = Depends(get_current_user)
):
    """Verify RazorpayX payment and add funds to wallet"""
    try:
        razorpay_payment_id = payment_data.get("razorpay_payment_id")
        razorpay_order_id = payment_data.get("razorpay_order_id")
        razorpay_signature = payment_data.get("razorpay_signature")
        
        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing payment verification data"
            )
        
        # Get RazorpayX client
        razorpay_client = get_razorpay_client()
        
        # Verify payment signature
        try:
            razorpay_client.utility.verify_payment_signature({
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_order_id": razorpay_order_id,
                "razorpay_signature": razorpay_signature
            })
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        
        # Get payment details
        payment = razorpay_client.payment.fetch(razorpay_payment_id)
        
        # Ensure payment was successful
        if payment["status"] != "captured":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment not completed. Status: {payment['status']}"
            )
        
        # Get the amount in Rupees (RazorpayX uses paise)
        amount = payment["amount"] / 100
        
        # Create transaction record
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            "id": transaction_id,
            "user_id": current_user.id,
            "amount": amount,
            "type": "deposit",
            "status": "completed",
            "payment_id": razorpay_payment_id,
            "payment_method": "razorpay",
            "description": f"Wallet deposit of ₹{amount}",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        transaction_response = supabase.table("wallet_transactions").insert(transaction_data).execute()
        
        if not transaction_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create transaction record"
            )
        
        # Update user wallet balance
        profile_response = supabase.table("user_profiles").select("wallet_balance").eq("id", current_user.id).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        current_balance = profile_response.data[0]["wallet_balance"] or 0
        new_balance = current_balance + amount
        
        update_response = supabase.table("user_profiles").update({"wallet_balance": new_balance}).eq("id", current_user.id).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update wallet balance"
            )
        
        # Get user name for broadcast
        user_response = supabase.table("user_profiles").select("name, role").eq("id", current_user.id).execute()
        user_name = user_response.data[0]["name"] if user_response.data else "Unknown User"
        user_role = user_response.data[0]["role"] if user_response.data else "unknown"
        
        # Broadcast transaction notification to admin
        transaction_with_user = {
            **transaction_response.data[0],
            "user_name": user_name,
            "user_role": user_role
        }
        await broadcast_message("new_transaction", transaction_with_user)
        
        return {
            "status": "success",
            "balance": new_balance,
            "transaction": transaction_response.data[0]
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify payment: {str(e)}"
        )

@router.post("/withdraw", response_model=Dict[str, Any])
async def withdraw_funds(
    withdrawal_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Withdraw funds from wallet to bank account"""
    try:
        amount = withdrawal_data.get("amount")
        account_number = withdrawal_data.get("account_number")
        ifsc_code = withdrawal_data.get("ifsc_code")
        account_name = withdrawal_data.get("account_name")
        
        if not all([amount, account_number, ifsc_code, account_name]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing withdrawal details"
            )
        
        if amount < 100:  # Minimum withdrawal amount is ₹100
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Withdrawal amount must be at least ₹100"
            )
        
        # Get user profile
        profile_response = supabase.table("user_profiles").select("wallet_balance").eq("id", current_user.id).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        current_balance = profile_response.data[0]["wallet_balance"] or 0
        
        # Check if user has sufficient balance
        if current_balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient wallet balance"
            )
        
        # Create withdrawal transaction record
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            "id": transaction_id,
            "user_id": current_user.id,
            "amount": amount,
            "type": "withdrawal",
            "status": "pending",  # Start as pending until processed
            "payment_method": "bank_transfer",
            "description": f"Withdrawal of ₹{amount} to bank account",
            "reference": f"{account_number[-4:]} ({ifsc_code})",  # Store last 4 digits for reference
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        transaction_response = supabase.table("wallet_transactions").insert(transaction_data).execute()
        
        if not transaction_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create transaction record"
            )
        
        # Create bank transfer details
        bank_details_data = {
            "transaction_id": transaction_id,
            "account_number": account_number,
            "ifsc_code": ifsc_code,
            "account_name": account_name,
            "created_at": datetime.utcnow().isoformat()
        }
        
        bank_details_response = supabase.table("bank_transfer_details").insert(bank_details_data).execute()
        
        if not bank_details_response.data:
            # Rollback transaction if bank details insertion fails
            supabase.table("wallet_transactions").delete().eq("id", transaction_id).execute()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store bank details"
            )
        
        # Update user wallet balance
        new_balance = current_balance - amount
        update_response = supabase.table("user_profiles").update({"wallet_balance": new_balance}).eq("id", current_user.id).execute()
        
        if not update_response.data:
            # Rollback if balance update fails
            supabase.table("wallet_transactions").delete().eq("id", transaction_id).execute()
            supabase.table("bank_transfer_details").delete().eq("transaction_id", transaction_id).execute()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update wallet balance"
            )
        
        # Get user name for broadcast
        user_response = supabase.table("user_profiles").select("name, role").eq("id", current_user.id).execute()
        user_name = user_response.data[0]["name"] if user_response.data else "Unknown User"
        user_role = user_response.data[0]["role"] if user_response.data else "unknown"
        
        # Broadcast transaction notification to admin
        transaction_with_user = {
            **transaction_response.data[0],
            "user_name": user_name,
            "user_role": user_role
        }
        await broadcast_message("new_transaction", transaction_with_user)
        
        # In a real-world scenario, here we would initiate the bank transfer with RazorpayX
        # But for this implementation, we'll assume it's a manual process handled by admins
        
        return {
            "status": "success",
            "message": "Withdrawal request submitted successfully",
            "balance": new_balance,
            "transaction": transaction_response.data[0]
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process withdrawal: {str(e)}"
        )

@router.post("/escrow", response_model=Dict[str, Any])
async def create_escrow_payment(
    escrow_data: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Create an escrow payment for high-value RFQs"""
    try:
        rfq_id = escrow_data.get("rfq_id")
        amount = escrow_data.get("amount")
        
        if not rfq_id or not amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RFQ ID and amount are required"
            )
        
        if amount < 500000:  # Escrow is for deals ₹5 lakh+
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Escrow is only for deals of ₹5 lakh or more"
            )
        
        # Get RFQ details
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
                detail="You are not authorized to create escrow for this RFQ"
            )
        
        # Ensure RFQ is in progress
        if rfq["status"] != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Escrow can only be created for in-progress RFQs"
            )
        
        # Check if user has sufficient balance
        profile_response = supabase.table("user_profiles").select("wallet_balance").eq("id", current_user.id).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        current_balance = profile_response.data[0]["wallet_balance"] or 0
        
        if current_balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient wallet balance"
            )
        
        # Create escrow record
        escrow_id = str(uuid.uuid4())
        escrow_data = {
            "id": escrow_id,
            "rfq_id": rfq_id,
            "buyer_id": current_user.id,
            "supplier_id": rfq["selected_supplier_id"],
            "amount": amount,
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        escrow_response = supabase.table("escrow_payments").insert(escrow_data).execute()
        
        if not escrow_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create escrow record"
            )
        
        # Create transaction record
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            "id": transaction_id,
            "user_id": current_user.id,
            "amount": amount,
            "type": "escrow",
            "status": "completed",
            "payment_method": "wallet",
            "description": f"Escrow payment of ₹{amount} for RFQ #{rfq_id}",
            "reference": escrow_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        transaction_response = supabase.table("wallet_transactions").insert(transaction_data).execute()
        
        if not transaction_response.data:
            # Rollback escrow if transaction creation fails
            supabase.table("escrow_payments").delete().eq("id", escrow_id).execute()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create transaction record"
            )
        
        # Update user wallet balance
        new_balance = current_balance - amount
        update_response = supabase.table("user_profiles").update({"wallet_balance": new_balance}).eq("id", current_user.id).execute()
        
        if not update_response.data:
            # Rollback if balance update fails
            supabase.table("escrow_payments").delete().eq("id", escrow_id).execute()
            supabase.table("wallet_transactions").delete().eq("id", transaction_id).execute()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update wallet balance"
            )
        
        return {
            "status": "success",
            "message": "Escrow payment created successfully",
            "escrow_id": escrow_id,
            "balance": new_balance
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create escrow payment: {str(e)}"
        )

@router.post("/escrow/{escrow_id}/release", response_model=Dict[str, Any])
async def release_escrow_payment(
    escrow_id: str,
    current_user = Depends(get_current_user)
):
    """Release funds from escrow to supplier"""
    try:
        # Get escrow details
        escrow_response = supabase.table("escrow_payments").select("*").eq("id", escrow_id).execute()
        
        if not escrow_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Escrow payment not found"
            )
        
        escrow = escrow_response.data[0]
        
        # Ensure user is the buyer/escrow creator
        if escrow["buyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to release this escrow"
            )
        
        # Ensure escrow is active
        if escrow["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Escrow cannot be released (current status: {escrow['status']})"
            )
        
        # Update escrow status
        update_escrow_response = supabase.table("escrow_payments").update({
            "status": "released",
            "released_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", escrow_id).execute()
        
        if not update_escrow_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update escrow status"
            )
        
        # Create transaction record for supplier
        supplier_transaction_id = str(uuid.uuid4())
        supplier_transaction_data = {
            "id": supplier_transaction_id,
            "user_id": escrow["supplier_id"],
            "amount": escrow["amount"],
            "type": "payment",
            "status": "completed",
            "payment_method": "escrow",
            "description": f"Payment of ₹{escrow['amount']} received from escrow",
            "reference": escrow_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        supplier_transaction_response = supabase.table("wallet_transactions").insert(supplier_transaction_data).execute()
        
        if not supplier_transaction_response.data:
            # Rollback escrow update if transaction creation fails
            supabase.table("escrow_payments").update({
                "status": "active",
                "released_at": None,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", escrow_id).execute()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create supplier transaction record"
            )
        
        # Update supplier wallet balance
        supplier_profile_response = supabase.table("user_profiles").select("wallet_balance").eq("id", escrow["supplier_id"]).execute()
        
        if not supplier_profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier profile not found"
            )
        
        supplier_balance = supplier_profile_response.data[0]["wallet_balance"] or 0
        new_supplier_balance = supplier_balance + escrow["amount"]
        
        update_supplier_response = supabase.table("user_profiles").update({"wallet_balance": new_supplier_balance}).eq("id", escrow["supplier_id"]).execute()
        
        if not update_supplier_response.data:
            # Rollback if balance update fails
            supabase.table("escrow_payments").update({
                "status": "active",
                "released_at": None,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", escrow_id).execute()
            supabase.table("wallet_transactions").delete().eq("id", supplier_transaction_id).execute()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update supplier wallet balance"
            )
        
        return {
            "status": "success",
            "message": "Escrow funds released successfully"
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to release escrow: {str(e)}"
        )
