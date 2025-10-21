from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    ESCROW_LOCK = "ESCROW_LOCK"
    ESCROW_RELEASE = "ESCROW_RELEASE"
    RFQ_FEE = "RFQ_FEE"
    INVOICE_DISCOUNT = "INVOICE_DISCOUNT"

class TransactionStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class BankDetails(BaseModel):
    account_name: str = Field(..., description="Name of the account holder")
    account_number: str = Field(..., description="Bank account number")
    ifsc: str = Field(..., description="IFSC code of the bank branch")

    class Config:
        schema_extra = {
            "example": {
                "account_name": "John Doe",
                "account_number": "1234567890",
                "ifsc": "HDFC0001234"
            }
        }

class WalletBalance(BaseModel):
    balance: float = Field(..., description="Current wallet balance")
    kyc_verified: bool = Field(..., description="KYC verification status")
    recent_transactions: List[dict] = Field(
        ...,
        description="List of recent transactions",
        max_items=10
    )

    class Config:
        schema_extra = {
            "example": {
                "balance": 5000.00,
                "kyc_verified": True,
                "recent_transactions": [
                    {
                        "id": 1,
                        "type": "DEPOSIT",
                        "amount": 1000.00,
                        "status": "COMPLETED",
                        "description": "Wallet deposit",
                        "created_at": "2025-04-01T14:30:00Z"
                    }
                ]
            }
        }

class DepositRequest(BaseModel):
    amount: float = Field(
        ...,
        description="Amount to deposit",
        gt=0,
        example=1000.00
    )

class WithdrawalRequest(BaseModel):
    amount: float = Field(
        ...,
        description="Amount to withdraw",
        gt=0,
        example=500.00
    )

wallet_responses = {
    "400": {
        "description": "Bad Request",
        "content": {
            "application/json": {
                "example": {"detail": "Invalid amount specified"}
            }
        }
    },
    "401": {
        "description": "Unauthorized",
        "content": {
            "application/json": {
                "example": {"detail": "Not authenticated"}
            }
        }
    },
    "403": {
        "description": "Forbidden",
        "content": {
            "application/json": {
                "example": {"detail": "Insufficient funds"}
            }
        }
    },
    "404": {
        "description": "Not Found",
        "content": {
            "application/json": {
                "example": {"detail": "Wallet not found"}
            }
        }
    }
}
