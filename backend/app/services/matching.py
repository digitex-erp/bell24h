from typing import List, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from app.models.supplier import Supplier
from app.models.rfq import RFQ

class SupplierMatcher:
    def __init__(self):
        # Load the model - using a multilingual model for Indian languages support
        self.model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        
    def _create_rfq_text(self, rfq: RFQ) -> str:
        """Create a text representation of the RFQ for embedding"""
        return f"{rfq.title} {rfq.description} {rfq.category} {rfq.subcategory}"
    
    def _create_supplier_text(self, supplier: Supplier) -> str:
        """Create a text representation of the supplier for embedding"""
        categories = " ".join(supplier.categories)
        subcategories = " ".join(supplier.subcategories)
        return f"{supplier.company_name} {supplier.description} {categories} {subcategories} {supplier.specialties}"
    
    def compute_supplier_embedding(self, supplier: Supplier) -> List[float]:
        """Compute embedding for a supplier"""
        text = self._create_supplier_text(supplier)
        embedding = self.model.encode(text)
        return embedding.tolist()
    
    def find_matching_suppliers(
        self, 
        db: Session, 
        rfq: RFQ, 
        limit: int = 10,
        min_score: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Find suppliers matching the RFQ using semantic similarity"""
        # Get RFQ embedding
        rfq_text = self._create_rfq_text(rfq)
        rfq_embedding = self.model.encode(rfq_text)
        
        # Get all suppliers
        suppliers = db.query(Supplier).all()
        
        # Calculate similarities and store results
        matches = []
        for supplier in suppliers:
            if supplier.embedding:
                similarity = np.dot(rfq_embedding, supplier.embedding) / (
                    np.linalg.norm(rfq_embedding) * np.linalg.norm(supplier.embedding)
                )
                
                # Check if categories match
                category_match = rfq.category in supplier.categories
                subcategory_match = rfq.subcategory in supplier.subcategories
                
                # Boost score if categories match
                if category_match:
                    similarity *= 1.2
                if subcategory_match:
                    similarity *= 1.1
                
                if similarity >= min_score:
                    matches.append({
                        'supplier': supplier,
                        'score': float(similarity),
                        'category_match': category_match,
                        'subcategory_match': subcategory_match
                    })
        
        # Sort by score and return top matches
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:limit]

# Create a singleton instance
matcher = SupplierMatcher()
