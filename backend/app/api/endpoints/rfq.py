from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.schemas.rfq import RFQCreate, RFQ
from app.models.rfq import RFQ as RFQModel
from app.core.config import settings
import boto3
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=RFQ)
async def create_rfq(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    rfq_in: RFQCreate,
    files: List[UploadFile] = File(None)
):
    """
    Create new RFQ with optional file attachments
    """
    # Create RFQ
    rfq = RFQModel(
        **rfq_in.dict(exclude={"attachments"}),
        user_id=current_user.id
    )
    db.add(rfq)
    db.commit()
    db.refresh(rfq)
    
    # Handle file uploads if any
    if files:
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_KEY
        )
        
        for file in files:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{rfq.id}_{timestamp}_{file.filename}"
            
            # Upload to S3
            s3.upload_fileobj(
                file.file,
                settings.AWS_BUCKET_NAME,
                f"rfq_attachments/{filename}",
                ExtraArgs={'ACL': 'public-read'}
            )
            
            # Create attachment record
            file_url = f"https://{settings.AWS_BUCKET_NAME}.s3.amazonaws.com/rfq_attachments/{filename}"
            attachment = RFQAttachment(
                rfq_id=rfq.id,
                file_name=file.filename,
                file_url=file_url,
                file_type=file.content_type
            )
            db.add(attachment)
    
    db.commit()
    db.refresh(rfq)
    return rfq

@router.get("/my-rfqs", response_model=List[RFQ])
def get_user_rfqs(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Get list of user's RFQs
    """
    rfqs = db.query(RFQModel).filter(
        RFQModel.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return rfqs

@router.get("/{rfq_id}", response_model=RFQ)
def get_rfq(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    rfq_id: int
):
    """
    Get RFQ by ID
    """
    rfq = db.query(RFQModel).filter(RFQModel.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    if rfq.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return rfq

@router.post("/{rfq_id}/send", response_model=dict)
async def send_rfq_to_suppliers(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    rfq_id: int,
    supplier_ids: List[int]
):
    """
    Send RFQ to specific suppliers
    """
    # Check if RFQ exists and user owns it
    rfq = db.query(RFQModel).filter(RFQModel.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    if rfq.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if suppliers exist
    suppliers = db.query(Supplier).filter(Supplier.id.in_(supplier_ids)).all()
    found_supplier_ids = {s.id for s in suppliers}
    missing_supplier_ids = set(supplier_ids) - found_supplier_ids
    if missing_supplier_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Suppliers not found: {missing_supplier_ids}"
        )
    
    # Create draft quotations for each supplier
    for supplier in suppliers:
        quotation = QuotationModel(
            rfq_id=rfq_id,
            supplier_id=supplier.id,
            status=QuotationStatus.DRAFT
        )
        db.add(quotation)
    
    db.commit()
    
    return {
        "status": "success",
        "message": f"RFQ sent to {len(suppliers)} suppliers",
        "supplier_ids": supplier_ids
    }
