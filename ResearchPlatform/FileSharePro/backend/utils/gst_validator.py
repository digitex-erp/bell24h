import re
import httpx
from typing import Dict, Any
from backend.config import settings

async def validate_gstin(gstin: str) -> Dict[str, Any]:
    """
    Validate a GSTIN against the India GST API
    
    This is a simplified implementation. In a real application,
    you would integrate with the official GST API or a third-party service.
    
    Args:
        gstin: GSTIN to validate
        
    Returns:
        Dictionary with validation results
    """
    # Basic format validation (15 characters)
    if not re.match(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", gstin):
        return {
            "valid": False,
            "message": "Invalid GSTIN format"
        }
    
    # In a real implementation, you would make a call to the GST API:
    # try:
    #     async with httpx.AsyncClient() as client:
    #         response = await client.get(
    #             f"{settings.GST_API_URL}/validate/{gstin}",
    #             headers={"x-api-key": settings.GST_API_KEY}
    #         )
    #         data = response.json()
    #         return {
    #             "valid": data.get("valid", False),
    #             "legal_name": data.get("legal_name"),
    #             "address": data.get("address"),
    #             "message": data.get("message", "Validation successful")
    #         }
    # except Exception as e:
    #     return {
    #         "valid": False,
    #         "message": f"Validation error: {str(e)}"
    #     }
    
    # For demo purposes, simulate successful validation
    state_code = gstin[:2]
    pan = gstin[2:12]
    
    # Map state codes to names (simplified)
    state_map = {
        "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
        "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana", "07": "Delhi",
        "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim",
        "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
        "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
        "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh",
        "24": "Gujarat", "25": "Daman and Diu", "26": "Dadra and Nagar Haveli",
        "27": "Maharashtra", "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
        "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
        "35": "Andaman and Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh"
    }
    
    state_name = state_map.get(state_code, "Unknown State")
    
    return {
        "valid": True,
        "gstin": gstin,
        "legal_name": f"Sample Company {pan}",
        "address": f"123 Business Street, {state_name}",
        "message": "GSTIN validated successfully"
    }
