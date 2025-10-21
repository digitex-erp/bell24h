from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.services.blockchain_service import BlockchainService
from typing import Dict, Any

router = APIRouter()
blockchain_service = BlockchainService()

@router.get("/rfq/{rfq_id}/verify")
async def verify_rfq_document(
    rfq_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Verify RFQ document authenticity using blockchain
    """
    # Get RFQ from database
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Convert RFQ to dictionary
    rfq_data = {
        "id": rfq.id,
        "title": rfq.title,
        "description": rfq.description,
        "categories": rfq.categories,
        "created_at": str(rfq.created_at),
        "user_id": rfq.user_id
    }
    
    result = await blockchain_service.verify_document(rfq_id, rfq_data)
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Blockchain verification failed: {result['error']}"
        )
    
    return result

@router.get("/rfq/{rfq_id}/history")
async def get_rfq_history(
    rfq_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get RFQ history from blockchain
    """
    result = await blockchain_service.get_rfq_history(rfq_id)
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get blockchain history: {result['error']}"
        )
    
    return result

@router.post("/rfq/{rfq_id}/store")
async def store_rfq_record(
    rfq_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Store RFQ record on blockchain
    """
    # Get RFQ from database
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Verify ownership
    if rfq.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to store this RFQ"
        )
    
    # Convert RFQ to dictionary
    rfq_data = {
        "id": rfq.id,
        "title": rfq.title,
        "description": rfq.description,
        "categories": rfq.categories,
        "created_at": str(rfq.created_at),
        "user_id": rfq.user_id
    }
    
    # Store on IPFS (assuming you have IPFS integration)
    ipfs_hash = "QmExample..."  # Replace with actual IPFS storage
    
    result = await blockchain_service.store_rfq(rfq_id, rfq_data, ipfs_hash)
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store on blockchain: {result['error']}"
        )
    
    # Update RFQ with blockchain info
    rfq.blockchain_tx_hash = result["transaction_hash"]
    rfq.blockchain_block = result["block_number"]
    db.commit()
    
    return result

@router.post("/quotation/{quotation_id}/store")
async def store_quotation_record(
    quotation_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Store quotation record on blockchain
    """
    # Get quotation from database
    quotation = db.query(Quotation).filter(
        Quotation.id == quotation_id
    ).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    # Verify ownership
    if quotation.supplier_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to store this quotation"
        )
    
    # Convert quotation to dictionary
    quotation_data = {
        "id": quotation.id,
        "rfq_id": quotation.rfq_id,
        "price": str(quotation.price),
        "delivery_time": str(quotation.delivery_time),
        "created_at": str(quotation.created_at),
        "supplier_id": quotation.supplier_id
    }
    
    # Store on IPFS (assuming you have IPFS integration)
    ipfs_hash = "QmExample..."  # Replace with actual IPFS storage
    
    result = await blockchain_service.store_quotation(
        quotation.rfq_id,
        quotation_data,
        ipfs_hash
    )
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to store on blockchain: {result['error']}"
        )
    
    # Update quotation with blockchain info
    quotation.blockchain_tx_hash = result["transaction_hash"]
    quotation.blockchain_block = result["block_number"]
    db.commit()
    
    return result
