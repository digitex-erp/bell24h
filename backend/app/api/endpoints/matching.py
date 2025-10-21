from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.services.matching import matcher
from app.models.rfq import RFQ
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierMatch, SupplierCreate, SupplierUpdate

router = APIRouter()

@router.post("/suppliers/{supplier_id}/compute-embedding", response_model=dict)
async def compute_supplier_embedding(
    supplier_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Compute and store embedding for a supplier
    """
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Check permissions
    if supplier.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Compute embedding
    embedding = matcher.compute_supplier_embedding(supplier)
    
    # Update supplier
    supplier.embedding = embedding
    db.commit()
    
    return {"status": "success", "message": "Embedding computed and stored"}

@router.get("/rfq/{rfq_id}/matches", response_model=List[SupplierMatch])
async def get_matching_suppliers(
    rfq_id: int,
    limit: int = 10,
    min_score: float = 0.5,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get matching suppliers for an RFQ
    """
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Check permissions
    if rfq.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Find matches
    matches = matcher.find_matching_suppliers(db, rfq, limit, min_score)
    return matches

@router.post("/suppliers", response_model=dict)
async def create_supplier_profile(
    supplier_in: SupplierCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Create a supplier profile
    """
    # Check if user already has a supplier profile
    existing_supplier = db.query(Supplier).filter(
        Supplier.user_id == current_user.id
    ).first()
    if existing_supplier:
        raise HTTPException(
            status_code=400,
            detail="User already has a supplier profile"
        )
    
    # Create supplier
    supplier = Supplier(
        user_id=current_user.id,
        **supplier_in.dict()
    )
    
    # Compute embedding
    supplier.embedding = matcher.compute_supplier_embedding(supplier)
    
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    
    return {"status": "success", "supplier_id": supplier.id}

@router.put("/suppliers/{supplier_id}", response_model=dict)
async def update_supplier_profile(
    supplier_id: int,
    supplier_in: SupplierUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Update a supplier profile
    """
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Check permissions
    if supplier.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update supplier
    for field, value in supplier_in.dict(exclude_unset=True).items():
        setattr(supplier, field, value)
    
    # Recompute embedding
    supplier.embedding = matcher.compute_supplier_embedding(supplier)
    
    db.commit()
    db.refresh(supplier)
    
    return {"status": "success", "message": "Supplier profile updated"}
