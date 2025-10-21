from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api import deps
from app.services.m1_exchange_service import M1ExchangeService
from app.models.wallet import Transaction, TransactionType, Wallet
from typing import Dict, Any
from datetime import datetime
import base64

router = APIRouter()
m1_service = M1ExchangeService()

@router.post("/invoice-discounting/register")
async def register_for_discounting(
    supplier_data: Dict[str, Any],
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Register supplier for invoice discounting"""
    result = await m1_service.register_supplier({
        **supplier_data,
        "email": current_user.email,
        "contact_name": current_user.name
    })
    
    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=f"Failed to register: {result.get('error')}"
        )
    
    return {
        "message": "Successfully registered for invoice discounting",
        "supplier_id": result["supplier_id"]
    }

@router.post("/invoice-discounting/upload")
async def upload_invoice_for_discounting(
    invoice_number: str,
    amount: float,
    due_date: datetime,
    buyer_gstin: str,
    invoice_file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Upload invoice for discounting"""
    # Read and encode invoice file
    invoice_content = await invoice_file.read()
    invoice_base64 = base64.b64encode(invoice_content).decode()
    
    result = await m1_service.upload_invoice({
        "supplier_id": current_user.m1_supplier_id,
        "invoice_number": invoice_number,
        "amount": amount,
        "due_date": due_date.isoformat(),
        "buyer_gstin": buyer_gstin,
        "invoice_file": invoice_base64
    })
    
    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=f"Failed to upload invoice: {result.get('error')}"
        )
    
    return {
        "message": "Invoice uploaded successfully",
        "invoice_id": result["invoice_id"]
    }

@router.get("/invoice-discounting/{invoice_id}/quote")
async def get_invoice_quote(
    invoice_id: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get discounting quote for invoice"""
    result = await m1_service.get_discount_quote(invoice_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get quote: {result.get('error')}"
        )
    
    return {
        "quote_id": result["quote_id"],
        "discount_rate": result["discount_rate"],
        "discounted_amount": result["discounted_amount"],
        "processing_fee": result["processing_fee"],
        "net_disbursement": result["net_disbursement"],
        "validity": result["validity"]
    }

@router.post("/invoice-discounting/{invoice_id}/quotes/{quote_id}/accept")
async def accept_discounting_quote(
    invoice_id: str,
    quote_id: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Accept invoice discounting quote"""
    result = await m1_service.accept_quote(invoice_id, quote_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=f"Failed to accept quote: {result.get('error')}"
        )
    
    # Create transaction record for invoice discounting fee
    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    fee_amount = float(result["processing_fee"]) * 0.005  # 0.5% platform fee
    
    transaction = Transaction(
        wallet_id=wallet.id,
        type=TransactionType.INVOICE_DISCOUNT,
        amount=fee_amount,
        status="COMPLETED",
        description=f"Invoice discounting fee for invoice {invoice_id}",
        reference_id=invoice_id,
        reference_type="invoice_discount"
    )
    
    db.add(transaction)
    wallet.balance -= fee_amount
    db.commit()
    
    return {
        "message": "Quote accepted successfully",
        "disbursement_id": result["disbursement_id"],
        "expected_disbursement_date": result["expected_disbursement_date"]
    }

@router.get("/invoice-discounting/analytics")
async def get_discounting_analytics(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get supplier's invoice discounting analytics"""
    result = await m1_service.get_supplier_analytics(
        current_user.m1_supplier_id
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get analytics: {result.get('error')}"
        )
    
    return {
        "total_invoices_discounted": result["total_invoices"],
        "total_value_discounted": result["total_value"],
        "average_discount_rate": result["avg_discount_rate"],
        "total_savings": result["total_savings"],
        "monthly_trends": result["monthly_trends"],
        "buyer_wise_analysis": result["buyer_analysis"]
    }
