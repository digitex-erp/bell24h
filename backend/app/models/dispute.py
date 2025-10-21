from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class DisputeStatus(str, enum.Enum):
    OPENED = "OPENED"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED_BUYER = "RESOLVED_BUYER"
    RESOLVED_SUPPLIER = "RESOLVED_SUPPLIER"
    RESOLVED_SPLIT = "RESOLVED_SPLIT"
    CLOSED = "CLOSED"

class DisputeType(str, enum.Enum):
    QUALITY = "QUALITY"
    DELIVERY = "DELIVERY"
    SPECIFICATION = "SPECIFICATION"
    PAYMENT = "PAYMENT"
    OTHER = "OTHER"

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    escrow_id = Column(Integer, ForeignKey("escrows.id"))
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    
    # Parties involved
    buyer_id = Column(Integer, ForeignKey("users.id"))
    supplier_id = Column(Integer, ForeignKey("users.id"))
    
    # Dispute details
    type = Column(SQLEnum(DisputeType))
    status = Column(SQLEnum(DisputeStatus), default=DisputeStatus.OPENED)
    amount_in_dispute = Column(Float)
    
    # Evidence and communication
    description = Column(String)
    evidence = Column(JSON)  # List of document/image URLs
    resolution_notes = Column(String)
    
    # Resolution details
    buyer_refund = Column(Float, default=0.0)
    supplier_payment = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    # Relationships
    escrow = relationship("Escrow", back_populates="disputes")
    rfq = relationship("RFQ")
    buyer = relationship("User", foreign_keys=[buyer_id])
    supplier = relationship("User", foreign_keys=[supplier_id])
    messages = relationship("DisputeMessage", back_populates="dispute")

class DisputeMessage(Base):
    __tablename__ = "dispute_messages"

    id = Column(Integer, primary_key=True, index=True)
    dispute_id = Column(Integer, ForeignKey("disputes.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    message = Column(String)
    attachments = Column(JSON)  # List of file URLs
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    dispute = relationship("Dispute", back_populates="messages")
    user = relationship("User")
