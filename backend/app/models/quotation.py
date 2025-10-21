from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base

class QuotationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    
    # Price details
    unit_price = Column(Numeric(10, 2))  # Price per unit
    total_price = Column(Numeric(10, 2))  # Total price including all costs
    currency = Column(String, default="INR")
    
    # Delivery details
    delivery_time = Column(Integer)  # Number of days
    delivery_terms = Column(Text)
    warranty_period = Column(String)
    
    # Payment terms
    payment_terms = Column(Text)
    validity_period = Column(Integer)  # Number of days quote is valid
    
    # Additional information
    technical_specifications = Column(Text)
    terms_and_conditions = Column(Text)
    notes = Column(Text)
    
    status = Column(SQLEnum(QuotationStatus), default=QuotationStatus.DRAFT)
    
    # Blockchain fields
    blockchain_tx_hash = Column(String(66), nullable=True)
    blockchain_block = Column(Integer, nullable=True)
    ipfs_hash = Column(String(64), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    
    # Relationships
    rfq = relationship("RFQ", back_populates="quotations")
    supplier = relationship("Supplier", back_populates="quotations")
    attachments = relationship("QuotationAttachment", back_populates="quotation")

class QuotationAttachment(Base):
    __tablename__ = "quotation_attachments"

    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"))
    file_name = Column(String)
    file_url = Column(String)
    file_type = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    quotation = relationship("Quotation", back_populates="attachments")
