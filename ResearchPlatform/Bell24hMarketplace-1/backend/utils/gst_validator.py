import re
import requests
from typing import Dict, Any

class GSTValidator:
    def __init__(self):
        self.gstin_pattern = re.compile(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')

    async def validate_gstin(self, gstin: str) -> Dict[str, bool | str]:
        """Validate GSTIN format and check status"""
        if not self.gstin_pattern.match(gstin):
            return {"valid": False, "message": "Invalid GSTIN format"}

        # In production, integrate with GST API
        state_code = gstin[:2]
        pan = gstin[2:12]

        return {
            "valid": True,
            "state_code": state_code,
            "pan": pan,
            "message": "GSTIN is valid"
        }

    async def get_business_details(self, gstin: str) -> Optional[Dict]:
        """Get business details from GSTIN"""
        try:
            # Simulate API call - replace with actual GST API in production
            return {
                "trade_name": "Sample Business",
                "registration_date": "2021-01-01",
                "business_type": "Regular",
                "status": "Active"
            }
        except Exception as e:
            print(f"Error fetching business details: {str(e)}")
            return None

import asyncio

async def validate_gstin(gstin: str, detailed: bool = False) -> Dict[str, Any]:
    validator = GSTValidator()
    result = await validator.validate_gstin(gstin)
    if detailed and result["valid"]:
        business_details = await validator.get_business_details(gstin)
        if business_details:
            result.update(business_details)
        else:
            result["message"] = "GSTIN valid, but business details unavailable."
    return result

#Example usage
async def main():
    gst_number = "07AAABC1234Z1Z5"
    result = await validate_gstin(gst_number, detailed=True)
    print(result)


if __name__ == "__main__":
    asyncio.run(main())