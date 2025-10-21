from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base

class RFQStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String, index=True)
    subcategory = Column(String, index=True)
    quantity = Column(Integer)
    unit = Column(String)
    budget = Column(Numeric(10, 2))  # Max 99,999,999.99
    deadline = Column(DateTime)
    delivery_location = Column(String)
    status = Column(SQLEnum(RFQStatus), default=RFQStatus.DRAFT)
    blockchain_tx_hash = Column(String(66), nullable=True)
    blockchain_block = Column(Integer, nullable=True)
    ipfs_hash = Column(String(64), nullable=True)
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="rfqs")
    quotations = relationship("Quotation", back_populates="rfq")
    attachments = relationship("RFQAttachment", back_populates="rfq")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RFQAttachment(Base):
    __tablename__ = "rfq_attachments"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    file_name = Column(String)
    file_url = Column(String)
    file_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    rfq = relationship("RFQ", back_populates="attachments")
