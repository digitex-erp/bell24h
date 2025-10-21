from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.wallet import Wallet, Transaction, TransactionType, TransactionStatus
from app.services.razorpay_service import RazorpayService
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()
razorpay_service = RazorpayService()

@router.post("/wallet/deposit")
async def create_deposit(
    amount: float,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a deposit link for wallet"""
    # Get or create wallet
    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()
    
    if not wallet:
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    
    # Create transaction record
    transaction = Transaction(
        wallet_id=wallet.id,
        type=TransactionType.DEPOSIT,
        amount=amount,
        status=TransactionStatus.PENDING,
        description="Wallet deposit"
    )
    db.add(transaction)
    db.commit()
    
    # Create payment link
    result = await razorpay_service.create_payment_link(
        amount=amount,
        purpose="wallet_deposit",
        user_id=current_user.id,
        reference_id=str(transaction.id)
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create payment link: {result['error']}"
        )
    
    return {
        "payment_link": result["payment_link"]["short_url"],
        "transaction_id": transaction.id
    }

@router.post("/wallet/withdraw")
async def withdraw_funds(
    amount: float,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Withdraw funds from wallet"""
    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    if wallet.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    # Check if user has verified KYC
    if not wallet.kyc_verified:
        raise HTTPException(
            status_code=400,
            detail="Please complete KYC verification first"
        )
    
    # Create withdrawal fee transaction (₹50)
    if amount >= 1000:  # Only charge fee for withdrawals ≥₹1000
        fee_transaction = Transaction(
            wallet_id=wallet.id,
            type=TransactionType.WITHDRAWAL,
            amount=50,
            status=TransactionStatus.COMPLETED,
            description="Withdrawal fee"
        )
        db.add(fee_transaction)
        wallet.balance -= 50
    
    # Create withdrawal transaction
    transaction = Transaction(
        wallet_id=wallet.id,
        type=TransactionType.WITHDRAWAL,
        amount=amount,
        status=TransactionStatus.PENDING,
        description="Wallet withdrawal"
    )
    db.add(transaction)
    
    # Update wallet balance
    wallet.balance -= amount
    db.commit()
    
    # Create payout
    result = await razorpay_service.create_payout(
        fund_account_id=wallet.razorpay_account_id,
        amount=amount,
        reference_id=str(transaction.id)
    )
    
    if not result["success"]:
        # Rollback transaction
        wallet.balance += amount
        if amount >= 1000:
            wallet.balance += 50
        transaction.status = TransactionStatus.FAILED
        db.commit()
        
        raise HTTPException(
            status_code=400,
            detail=f"Withdrawal failed: {result['error']}"
        )
    
    transaction.razorpay_transaction_id = result["payout"]["id"]
    transaction.status = TransactionStatus.COMPLETED
    db.commit()
    
    return {
        "transaction_id": transaction.id,
        "amount": amount,
        "status": "completed"
    }

@router.get("/wallet/balance")
async def get_wallet_balance(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get wallet balance and recent transactions"""
    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Get recent transactions
    recent_transactions = db.query(Transaction).filter(
        Transaction.wallet_id == wallet.id
    ).order_by(
        Transaction.created_at.desc()
    ).limit(10).all()
    
    return {
        "balance": wallet.balance,
        "kyc_verified": wallet.kyc_verified,
        "recent_transactions": [
            {
                "id": tx.id,
                "type": tx.type,
                "amount": tx.amount,
                "status": tx.status,
                "description": tx.description,
                "created_at": tx.created_at
            }
            for tx in recent_transactions
        ]
    }

@router.post("/wallet/verify-kyc")
async def verify_kyc(
    bank_details: dict,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Verify KYC and link bank account"""
    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id
    ).first()
    
    if not wallet:
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    
    # Create RazorpayX contact
    contact_result = await razorpay_service.create_contact({
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone
    })
    
    if not contact_result["success"]:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create contact: {contact_result['error']}"
        )
    
    # Create fund account
    fund_result = await razorpay_service.create_fund_account(
        contact_id=contact_result["contact"]["id"],
        bank_details=bank_details
    )
    
    if not fund_result["success"]:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to link bank account: {fund_result['error']}"
        )
    
    # Update wallet
    wallet.razorpay_account_id = fund_result["fund_account"]["id"]
    wallet.kyc_verified = True
    db.commit()
    
    return {
        "message": "KYC verified and bank account linked successfully",
        "wallet_id": wallet.id
    }
