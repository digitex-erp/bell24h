from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import boto3
from app.api import deps
from app.schemas.quotation import QuotationCreate, QuotationUpdate, Quotation
from app.models.quotation import Quotation as QuotationModel, QuotationStatus
from app.models.supplier import Supplier
from app.core.config import settings

router = APIRouter()

@router.post("/", response_model=Quotation)
async def create_quotation(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    quotation_in: QuotationCreate,
    files: List[UploadFile] = File(None)
):
    """
    Create a new quotation for an RFQ
    """
    # Check if user is a supplier
    supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
    if not supplier:
        raise HTTPException(
            status_code=400,
            detail="Only suppliers can create quotations"
        )
    
    # Create quotation
    quotation = QuotationModel(
        **quotation_in.dict(exclude={"attachments"}),
        supplier_id=supplier.id
    )
    db.add(quotation)
    db.commit()
    db.refresh(quotation)
    
    # Handle file uploads if any
    if files:
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_KEY
        )
        
        for file in files:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"quotation_{quotation.id}_{timestamp}_{file.filename}"
            
            # Upload to S3
            s3.upload_fileobj(
                file.file,
                settings.AWS_BUCKET_NAME,
                f"quotation_attachments/{filename}",
                ExtraArgs={'ACL': 'public-read'}
            )
            
            # Create attachment record
            file_url = f"https://{settings.AWS_BUCKET_NAME}.s3.amazonaws.com/quotation_attachments/{filename}"
            attachment = QuotationAttachment(
                quotation_id=quotation.id,
                file_name=file.filename,
                file_url=file_url,
                file_type=file.content_type
            )
            db.add(attachment)
    
    db.commit()
    db.refresh(quotation)
    return quotation

@router.put("/{quotation_id}", response_model=Quotation)
async def update_quotation(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    quotation_id: int,
    quotation_in: QuotationUpdate
):
    """
    Update a quotation
    """
    quotation = db.query(QuotationModel).filter(QuotationModel.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    # Check if user owns the quotation
    supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
    if not supplier or quotation.supplier_id != supplier.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Can only update draft quotations
    if quotation.status != QuotationStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail="Can only update draft quotations"
        )
    
    # Update quotation
    for field, value in quotation_in.dict(exclude_unset=True).items():
        setattr(quotation, field, value)
    
    db.commit()
    db.refresh(quotation)
    return quotation

@router.post("/{quotation_id}/submit", response_model=Quotation)
async def submit_quotation(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    quotation_id: int
):
    """
    Submit a quotation
    """
    quotation = db.query(QuotationModel).filter(QuotationModel.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    # Check if user owns the quotation
    supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
    if not supplier or quotation.supplier_id != supplier.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Can only submit draft quotations
    if quotation.status != QuotationStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail="Can only submit draft quotations"
        )
    
    quotation.status = QuotationStatus.SUBMITTED
    quotation.submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(quotation)
    return quotation

@router.post("/{quotation_id}/accept", response_model=Quotation)
async def accept_quotation(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    quotation_id: int
):
    """
    Accept a quotation
    """
    quotation = db.query(QuotationModel).filter(QuotationModel.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    # Check if user owns the RFQ
    if quotation.rfq.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Can only accept submitted quotations
    if quotation.status != QuotationStatus.SUBMITTED:
        raise HTTPException(
            status_code=400,
            detail="Can only accept submitted quotations"
        )
    
    quotation.status = QuotationStatus.ACCEPTED
    
    db.commit()
    db.refresh(quotation)
    return quotation

@router.post("/{quotation_id}/reject", response_model=Quotation)
async def reject_quotation(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    quotation_id: int
):
    """
    Reject a quotation
    """
    quotation = db.query(QuotationModel).filter(QuotationModel.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    # Check if user owns the RFQ
    if quotation.rfq.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Can only reject submitted quotations
    if quotation.status != QuotationStatus.SUBMITTED:
        raise HTTPException(
            status_code=400,
            detail="Can only reject submitted quotations"
        )
    
    quotation.status = QuotationStatus.REJECTED
    
    db.commit()
    db.refresh(quotation)
    return quotation

@router.get("/rfq/{rfq_id}", response_model=List[Quotation])
async def get_rfq_quotations(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    rfq_id: int
):
    """
    Get all quotations for an RFQ
    """
    # Check if user owns the RFQ or is a supplier who submitted a quote
    supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
    quotations = db.query(QuotationModel).filter(QuotationModel.rfq_id == rfq_id).all()
    
    if not quotations:
        return []
    
    # If user is not RFQ owner and not a supplier with a quote, deny access
    if (quotations[0].rfq.user_id != current_user.id and 
        not (supplier and any(q.supplier_id == supplier.id for q in quotations))):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return quotations

@router.get("/supplier", response_model=List[Quotation])
async def get_supplier_quotations(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all quotations for a supplier
    """
    supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
    if not supplier:
        raise HTTPException(
            status_code=400,
            detail="User is not a supplier"
        )
    
    quotations = db.query(QuotationModel).filter(
        QuotationModel.supplier_id == supplier.id
    ).offset(skip).limit(limit).all()
    
    return quotations
