from sqlalchemy import Column, Integer, String, Text, ARRAY, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String, index=True)
    description = Column(Text)
    categories = Column(ARRAY(String))  # Main categories
    subcategories = Column(ARRAY(String))  # Subcategories
    specialties = Column(Text)  # Detailed text about specialties
    certifications = Column(ARRAY(String))
    location = Column(String)
    embedding = Column(ARRAY(Float))  # Store pre-computed embeddings
    
    # Relationships
    user = relationship("User", back_populates="supplier_profile")
    quotations = relationship("Quotation", back_populates="supplier")
