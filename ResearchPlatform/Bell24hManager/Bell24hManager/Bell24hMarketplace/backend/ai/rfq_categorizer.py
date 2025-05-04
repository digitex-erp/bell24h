import numpy as np
from typing import Optional, Dict, Any, List
import os
import re
import string
import asyncio
from collections import Counter

# Pre-defined categories
CATEGORIES = [
    "manufacturing",
    "electronics",
    "textiles",
    "chemicals",
    "automotive",
    "pharmaceuticals",
    "construction",
    "food_processing",
    "packaging",
    "other"
]

# Keywords associated with each category
CATEGORY_KEYWORDS = {
    "manufacturing": ["metal", "steel", "aluminum", "fabrication", "machining", "casting", "forging", "manufacturing", "production", "industrial", "machine", "parts", "equipment", "assembly", "factory"],
    "electronics": ["circuit", "electronic", "pcb", "semiconductor", "chip", "device", "component", "battery", "solar", "wiring", "electrical", "cable", "computer", "hardware"],
    "textiles": ["fabric", "textile", "clothing", "garment", "apparel", "cotton", "polyester", "silk", "wool", "fiber", "yarn", "sewing", "weaving", "knitting", "stitching"],
    "chemicals": ["chemical", "solvent", "acid", "base", "compound", "solution", "polymer", "resin", "catalyst", "adhesive", "coating", "paint", "pigment", "dye"],
    "automotive": ["automobile", "automotive", "vehicle", "car", "truck", "motor", "engine", "transmission", "brake", "chassis", "spare", "part", "oem", "aftermarket"],
    "pharmaceuticals": ["pharmaceutical", "medicine", "drug", "medical", "clinical", "healthcare", "biotech", "biotechnology", "therapeutic", "hospital", "pharmacy", "diagnostic", "patient"],
    "construction": ["construction", "building", "infrastructure", "civil", "architecture", "concrete", "cement", "brick", "stone", "lumber", "timber", "contractor", "project", "site"],
    "food_processing": ["food", "beverage", "processing", "packaging", "agricultural", "farming", "crop", "grain", "meat", "dairy", "fruit", "vegetable", "bakery"],
    "packaging": ["packaging", "container", "box", "carton", "bottle", "can", "pouch", "wrapper", "label", "printing", "sealing", "filling", "packing", "logistics"],
}

async def categorize_rfq(title: str, description: str) -> Optional[str]:
    """
    Categorize an RFQ based on its title and description using NLP techniques
    
    This is a simplified implementation using keyword matching.
    For a more sophisticated approach, you could use a pre-trained model from Hugging Face.
    
    Args:
        title: RFQ title
        description: RFQ description
        
    Returns:
        Category name or None if categorization failed
    """
    try:
        # Combine title and description, giving more weight to the title
        text = title + " " + title + " " + description
        
        # Preprocess text
        text = text.lower()
        # Remove punctuation
        text = text.translate(str.maketrans("", "", string.punctuation))
        # Split into words
        words = text.split()
        
        # Initialize category scores
        category_scores = {category: 0 for category in CATEGORIES}
        
        # Calculate score for each category based on keyword matches
        for category, keywords in CATEGORY_KEYWORDS.items():
            for keyword in keywords:
                # Count occurrences of keyword
                count = sum(1 for word in words if keyword in word)
                # Add to category score
                category_scores[category] += count
        
        # Get category with highest score
        max_score = max(category_scores.values())
        
        # If no significant matches, return "other"
        if max_score == 0:
            return "other"
        
        # Get categories with the highest score
        best_categories = [category for category, score in category_scores.items() if score == max_score]
        
        # Return the first best category
        return best_categories[0]
    
    except Exception as e:
        print(f"Error categorizing RFQ: {str(e)}")
        return "other"

async def categorize_rfq_huggingface(title: str, description: str) -> Optional[str]:
    """
    Categorize an RFQ using Hugging Face's zero-shot classification
    
    This is a placeholder for using a Hugging Face model.
    In a real implementation, you would use the Hugging Face API or a local model.
    
    Args:
        title: RFQ title
        description: RFQ description
        
    Returns:
        Category name or None if categorization failed
    """
    try:
        # In a real implementation, you would use the Hugging Face API:
        # from transformers import pipeline
        # classifier = pipeline("zero-shot-classification")
        # result = classifier(text, candidate_labels=CATEGORIES)
        # return result['labels'][0]
        
        # For now, fallback to keyword-based categorization
        return await categorize_rfq(title, description)
    
    except Exception as e:
        print(f"Error categorizing RFQ with Hugging Face: {str(e)}")
        return await categorize_rfq(title, description)  # Fallback to basic categorization
