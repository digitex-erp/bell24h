from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.wallet import Transaction
from app.models.dispute import Dispute
from app.models.escrow import Escrow
from datetime import datetime, timedelta
import pandas as pd
from io import BytesIO
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.get("/export/transactions")
async def export_transactions(
    start_date: datetime = None,
    end_date: datetime = None,
    type: str = None,
    format: str = "csv",
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Export transaction data in CSV or Excel format"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Build query
    query = db.query(Transaction)
    
    if start_date:
        query = query.filter(Transaction.created_at >= start_date)
    if end_date:
        query = query.filter(Transaction.created_at <= end_date)
    if type:
        query = query.filter(Transaction.type == type)
    
    transactions = query.all()
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {
            "Transaction ID": tx.id,
            "Type": tx.type,
            "Amount": tx.amount,
            "Status": tx.status,
            "Description": tx.description,
            "Created At": tx.created_at,
            "Reference ID": tx.reference_id,
            "Reference Type": tx.reference_type
        }
        for tx in transactions
    ])
    
    # Export based on format
    if format == "csv":
        output = BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=transactions_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
    else:  # Excel
        output = BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=transactions_{datetime.now().strftime('%Y%m%d')}.xlsx"
            }
        )

@router.get("/export/disputes")
async def export_disputes(
    status: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    format: str = "csv",
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Export dispute data in CSV or Excel format"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Build query
    query = db.query(Dispute)
    
    if status:
        query = query.filter(Dispute.status == status)
    if start_date:
        query = query.filter(Dispute.created_at >= start_date)
    if end_date:
        query = query.filter(Dispute.created_at <= end_date)
    
    disputes = query.all()
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {
            "Dispute ID": d.id,
            "Type": d.type,
            "Status": d.status,
            "Amount": d.amount_in_dispute,
            "Buyer": d.buyer.name,
            "Supplier": d.supplier.name,
            "Created At": d.created_at,
            "Resolved At": d.resolved_at,
            "Buyer Refund": d.buyer_refund,
            "Supplier Payment": d.supplier_payment,
            "Platform Fee": d.platform_fee
        }
        for d in disputes
    ])
    
    # Export based on format
    if format == "csv":
        output = BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=disputes_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
    else:  # Excel
        output = BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=disputes_{datetime.now().strftime('%Y%m%d')}.xlsx"
            }
        )

@router.get("/export/escrow")
async def export_escrow_transactions(
    status: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    format: str = "csv",
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Export escrow transaction data in CSV or Excel format"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Build query
    query = db.query(Escrow)
    
    if status:
        query = query.filter(Escrow.status == status)
    if start_date:
        query = query.filter(Escrow.created_at >= start_date)
    if end_date:
        query = query.filter(Escrow.created_at <= end_date)
    
    escrows = query.all()
    
    # Convert to DataFrame
    df = pd.DataFrame([
        {
            "Escrow ID": e.id,
            "RFQ ID": e.rfq_id,
            "Buyer": e.buyer.name,
            "Supplier": e.supplier.name,
            "Amount": e.amount,
            "Fee Percentage": e.fee_percentage,
            "Fee Amount": e.fee_amount,
            "Status": e.status,
            "Created At": e.created_at,
            "Updated At": e.updated_at
        }
        for e in escrows
    ])
    
    # Export based on format
    if format == "csv":
        output = BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=escrow_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
    else:  # Excel
        output = BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=escrow_{datetime.now().strftime('%Y%m%d')}.xlsx"
            }
        )
