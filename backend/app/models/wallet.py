from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class TransactionType(str, enum.Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"
    ESCROW_LOCK = "ESCROW_LOCK"
    ESCROW_RELEASE = "ESCROW_RELEASE"
    RFQ_FEE = "RFQ_FEE"
    INVOICE_DISCOUNT = "INVOICE_DISCOUNT"

class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    balance = Column(Float, default=0.0)
    razorpay_account_id = Column(String, unique=True)
    kyc_verified = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    type = Column(SQLEnum(TransactionType))
    amount = Column(Float)
    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.PENDING)
    
    # RazorpayX details
    razorpay_transaction_id = Column(String, unique=True)
    razorpay_payment_id = Column(String)
    
    # Reference details
    reference_id = Column(String)  # RFQ ID, Invoice ID, etc.
    reference_type = Column(String)  # "rfq", "invoice", "escrow", etc.
    
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    wallet = relationship("Wallet", back_populates="transactions")

class Escrow(Base):
    __tablename__ = "escrows"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    supplier_id = Column(Integer, ForeignKey("users.id"))
    
    amount = Column(Float)
    fee_percentage = Column(Float)
    fee_amount = Column(Float)
    
    status = Column(String)  # LOCKED, RELEASED, DISPUTED
    release_conditions = Column(JSON)  # Milestone conditions
    
    # RazorpayX details
    razorpay_escrow_id = Column(String, unique=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rfq = relationship("RFQ", back_populates="escrow")
    buyer = relationship("User", foreign_keys=[buyer_id])
    supplier = relationship("User", foreign_keys=[supplier_id])
