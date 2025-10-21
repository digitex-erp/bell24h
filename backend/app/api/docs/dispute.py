from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class DisputeType(str, Enum):
    QUALITY = "QUALITY"
    DELIVERY = "DELIVERY"
    SPECIFICATION = "SPECIFICATION"
    PAYMENT = "PAYMENT"
    OTHER = "OTHER"

class DisputeStatus(str, Enum):
    OPENED = "OPENED"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED_BUYER = "RESOLVED_BUYER"
    RESOLVED_SUPPLIER = "RESOLVED_SUPPLIER"
    RESOLVED_SPLIT = "RESOLVED_SPLIT"
    CLOSED = "CLOSED"

class DisputeCreate(BaseModel):
    escrow_id: int = Field(..., description="ID of the escrow transaction")
    type: DisputeType = Field(..., description="Type of dispute")
    amount: float = Field(
        ...,
        description="Amount in dispute",
        gt=0
    )
    description: str = Field(
        ...,
        description="Detailed description of the dispute",
        min_length=10,
        max_length=1000
    )

    class Config:
        schema_extra = {
            "example": {
                "escrow_id": 1,
                "type": "QUALITY",
                "amount": 5000.00,
                "description": "Product received does not match specifications"
            }
        }

class DisputeMessage(BaseModel):
    message: str = Field(
        ...,
        description="Message content",
        min_length=1,
        max_length=1000
    )

    class Config:
        schema_extra = {
            "example": {
                "message": "We have reviewed the product and found quality issues"
            }
        }

class DisputeResolution(BaseModel):
    buyer_refund: float = Field(
        ...,
        description="Amount to refund to buyer",
        ge=0
    )
    supplier_payment: float = Field(
        ...,
        description="Amount to release to supplier",
        ge=0
    )
    notes: str = Field(
        ...,
        description="Resolution notes",
        min_length=10,
        max_length=1000
    )

    class Config:
        schema_extra = {
            "example": {
                "buyer_refund": 3000.00,
                "supplier_payment": 1800.00,
                "notes": "Split resolution based on product quality assessment"
            }
        }

dispute_responses = {
    "400": {
        "description": "Bad Request",
        "content": {
            "application/json": {
                "example": {"detail": "Invalid dispute details"}
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
                "example": {"detail": "Not authorized to access this dispute"}
            }
        }
    },
    "404": {
        "description": "Not Found",
        "content": {
            "application/json": {
                "example": {"detail": "Dispute not found"}
            }
        }
    },
    "409": {
        "description": "Conflict",
        "content": {
            "application/json": {
                "example": {"detail": "Dispute already resolved"}
            }
        }
    }
}
