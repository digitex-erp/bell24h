from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class WalletBalance(BaseModel):
    """Model for wallet balance"""
    balance: float = 0.0

class WalletTransaction(BaseModel):
    """Model for wallet transaction"""
    id: str
    user_id: str
    amount: float
    type: str  # deposit, withdrawal, payment, refund, escrow
    status: str  # pending, completed, failed
    payment_id: Optional[str] = None
    payment_method: str  # razorpay, bank_transfer, wallet, escrow
    description: str
    reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class WalletTopUp(BaseModel):
    """Model for adding funds to wallet"""
    amount: float = Field(..., gt=0)

class WithdrawalRequest(BaseModel):
    """Model for withdrawing funds from wallet"""
    amount: float = Field(..., gt=0)
    account_number: str
    ifsc_code: str
    account_name: str

class EscrowPayment(BaseModel):
    """Model for escrow payment"""
    id: str
    rfq_id: str
    buyer_id: str
    supplier_id: str
    amount: float
    status: str  # active, released, cancelled
    created_at: datetime
    updated_at: datetime
    released_at: Optional[datetime] = None

class TransactionWithUser(WalletTransaction):
    """Transaction with user details (for admin view)"""
    user_name: str
    user_role: str
