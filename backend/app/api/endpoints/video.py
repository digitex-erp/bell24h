from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.api import deps
from app.services.video_service import VideoService
from app.models.rfq import RFQ
from app.models.supplier import Supplier
import json

router = APIRouter()
video_service = VideoService()

@router.post("/rfq-video")
async def upload_rfq_video(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    video: UploadFile = File(...),
    rfq_data: str = Form(...),
    mask_identity: bool = Form(True)
):
    """
    Upload and process RFQ video with identity protection
    """
    try:
        # Process video
        result = await video_service.process_rfq_video(
            await video.read(),
            mask_identity
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Create RFQ with video
        rfq_dict = json.loads(rfq_data)
        rfq = RFQ(
            **rfq_dict,
            user_id=current_user.id,
            video_url=result["video_url"],
            video_public_id=result["public_id"]
        )
        
        db.add(rfq)
        db.commit()
        db.refresh(rfq)
        
        return {
            "success": True,
            "rfq_id": rfq.id,
            "video_url": result["video_url"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/product-video/{supplier_id}")
async def upload_product_video(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    supplier_id: int,
    video: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None)
):
    """
    Upload supplier product showcase video
    """
    # Verify supplier ownership
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier or supplier.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload for this supplier")
    
    try:
        # Process video
        result = await video_service.process_product_video(
            await video.read(),
            supplier_id
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Update supplier's video showcase
        supplier.product_videos.append({
            "title": title,
            "description": description,
            "video_url": result["video_url"],
            "thumbnail_url": result["thumbnail_url"],
            "public_id": result["public_id"]
        })
        
        db.commit()
        
        return {
            "success": True,
            "video_url": result["video_url"],
            "thumbnail_url": result["thumbnail_url"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/product-video/{supplier_id}/{video_public_id}")
async def delete_product_video(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    supplier_id: int,
    video_public_id: str
):
    """
    Delete a product showcase video
    """
    # Verify supplier ownership
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier or supplier.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this video")
    
    try:
        # Delete from Cloudinary
        cloudinary.uploader.destroy(video_public_id, resource_type="video")
        
        # Remove from supplier's video showcase
        supplier.product_videos = [
            video for video in supplier.product_videos
            if video["public_id"] != video_public_id
        ]
        
        db.commit()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
