from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api import deps
from app.models.dispute import Dispute, DisputeMessage, DisputeStatus, DisputeType
from app.models.escrow import Escrow
from app.models.wallet import Transaction, TransactionType, Wallet
from typing import List, Dict, Any
from datetime import datetime
import json

router = APIRouter()

@router.post("/disputes/")
async def create_dispute(
    escrow_id: int,
    type: DisputeType,
    amount: float,
    description: str,
    evidence_files: List[UploadFile] = File([]),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Create a new dispute for an escrow transaction"""
    escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")
    
    # Verify user is involved in the transaction
    if current_user.id not in [escrow.buyer_id, escrow.supplier_id]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Upload evidence files to storage
    evidence_urls = []  # Implement file upload logic
    
    dispute = Dispute(
        escrow_id=escrow_id,
        rfq_id=escrow.rfq_id,
        buyer_id=escrow.buyer_id,
        supplier_id=escrow.supplier_id,
        type=type,
        amount_in_dispute=amount,
        description=description,
        evidence=evidence_urls
    )
    
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    
    return {
        "message": "Dispute created successfully",
        "dispute_id": dispute.id
    }

@router.post("/disputes/{dispute_id}/messages")
async def add_dispute_message(
    dispute_id: int,
    message: str,
    attachments: List[UploadFile] = File([]),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Add a message to a dispute thread"""
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Verify user is involved in the dispute
    if current_user.id not in [dispute.buyer_id, dispute.supplier_id]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Upload attachments
    attachment_urls = []  # Implement file upload logic
    
    dispute_message = DisputeMessage(
        dispute_id=dispute_id,
        user_id=current_user.id,
        message=message,
        attachments=attachment_urls
    )
    
    db.add(dispute_message)
    db.commit()
    
    return {
        "message": "Message added successfully",
        "message_id": dispute_message.id
    }

@router.post("/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: int,
    resolution_data: Dict[str, Any],
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Resolve a dispute with specified outcome"""
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Only admin can resolve disputes
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Calculate refunds and payments
    total_amount = dispute.amount_in_dispute
    buyer_refund = resolution_data.get("buyer_refund", 0.0)
    supplier_payment = resolution_data.get("supplier_payment", 0.0)
    platform_fee = total_amount - (buyer_refund + supplier_payment)
    
    # Update dispute
    dispute.status = DisputeStatus.CLOSED
    dispute.buyer_refund = buyer_refund
    dispute.supplier_payment = supplier_payment
    dispute.platform_fee = platform_fee
    dispute.resolution_notes = resolution_data.get("notes")
    dispute.resolved_at = datetime.utcnow()
    
    # Process refunds and payments
    if buyer_refund > 0:
        buyer_wallet = db.query(Wallet).filter(
            Wallet.user_id == dispute.buyer_id
        ).first()
        
        buyer_transaction = Transaction(
            wallet_id=buyer_wallet.id,
            type=TransactionType.ESCROW_RELEASE,
            amount=buyer_refund,
            status="COMPLETED",
            description=f"Dispute resolution refund for dispute {dispute_id}",
            reference_id=str(dispute_id),
            reference_type="dispute"
        )
        db.add(buyer_transaction)
        buyer_wallet.balance += buyer_refund
    
    if supplier_payment > 0:
        supplier_wallet = db.query(Wallet).filter(
            Wallet.user_id == dispute.supplier_id
        ).first()
        
        supplier_transaction = Transaction(
            wallet_id=supplier_wallet.id,
            type=TransactionType.ESCROW_RELEASE,
            amount=supplier_payment,
            status="COMPLETED",
            description=f"Dispute resolution payment for dispute {dispute_id}",
            reference_id=str(dispute_id),
            reference_type="dispute"
        )
        db.add(supplier_transaction)
        supplier_wallet.balance += supplier_payment
    
    db.commit()
    
    return {
        "message": "Dispute resolved successfully",
        "resolution": {
            "buyer_refund": buyer_refund,
            "supplier_payment": supplier_payment,
            "platform_fee": platform_fee
        }
    }

@router.get("/disputes/")
async def list_disputes(
    status: DisputeStatus = None,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """List disputes for current user"""
    query = db.query(Dispute)
    
    # Filter by user
    if not current_user.is_admin:
        query = query.filter(
            (Dispute.buyer_id == current_user.id) |
            (Dispute.supplier_id == current_user.id)
        )
    
    # Filter by status
    if status:
        query = query.filter(Dispute.status == status)
    
    disputes = query.order_by(Dispute.created_at.desc()).all()
    
    return [
        {
            "id": d.id,
            "type": d.type,
            "status": d.status,
            "amount": d.amount_in_dispute,
            "description": d.description,
            "created_at": d.created_at,
            "resolved_at": d.resolved_at,
            "buyer": {
                "id": d.buyer_id,
                "name": d.buyer.name
            },
            "supplier": {
                "id": d.supplier_id,
                "name": d.supplier.name
            }
        }
        for d in disputes
    ]

@router.get("/disputes/{dispute_id}")
async def get_dispute_details(
    dispute_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get detailed information about a dispute"""
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Verify access
    if not current_user.is_admin and current_user.id not in [
        dispute.buyer_id,
        dispute.supplier_id
    ]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = db.query(DisputeMessage).filter(
        DisputeMessage.dispute_id == dispute_id
    ).order_by(DisputeMessage.created_at).all()
    
    return {
        "id": dispute.id,
        "type": dispute.type,
        "status": dispute.status,
        "amount": dispute.amount_in_dispute,
        "description": dispute.description,
        "evidence": dispute.evidence,
        "created_at": dispute.created_at,
        "resolved_at": dispute.resolved_at,
        "resolution": {
            "buyer_refund": dispute.buyer_refund,
            "supplier_payment": dispute.supplier_payment,
            "platform_fee": dispute.platform_fee,
            "notes": dispute.resolution_notes
        } if dispute.resolved_at else None,
        "buyer": {
            "id": dispute.buyer_id,
            "name": dispute.buyer.name
        },
        "supplier": {
            "id": dispute.supplier_id,
            "name": dispute.supplier.name
        },
        "messages": [
            {
                "id": m.id,
                "user_id": m.user_id,
                "user_name": m.user.name,
                "message": m.message,
                "attachments": m.attachments,
                "created_at": m.created_at
            }
            for m in messages
        ]
    }
