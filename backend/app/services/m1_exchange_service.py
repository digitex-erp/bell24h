import httpx
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

class M1ExchangeService:
    def __init__(self):
        self.base_url = settings.M1_EXCHANGE_API_URL
        self.api_key = settings.M1_EXCHANGE_API_KEY
        self.client_id = settings.M1_EXCHANGE_CLIENT_ID

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make authenticated request to M1 Exchange API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Client-ID": self.client_id,
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method,
                f"{self.base_url}{endpoint}",
                json=data,
                headers=headers
            )
            response.raise_for_status()
            return response.json()

    async def register_supplier(
        self,
        supplier_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Register a supplier on M1 Exchange"""
        try:
            return await self._make_request(
                "POST",
                "/suppliers/register",
                data={
                    "business_name": supplier_data["business_name"],
                    "gstin": supplier_data["gstin"],
                    "pan": supplier_data["pan"],
                    "annual_turnover": supplier_data["annual_turnover"],
                    "bank_account": {
                        "account_number": supplier_data["bank_account"]["account_number"],
                        "ifsc": supplier_data["bank_account"]["ifsc"],
                        "account_name": supplier_data["bank_account"]["account_name"]
                    },
                    "contact_details": {
                        "name": supplier_data["contact_name"],
                        "email": supplier_data["email"],
                        "phone": supplier_data["phone"]
                    }
                }
            )
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def upload_invoice(
        self,
        invoice_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Upload an invoice for discounting"""
        try:
            return await self._make_request(
                "POST",
                "/invoices/upload",
                data={
                    "supplier_id": invoice_data["supplier_id"],
                    "invoice_number": invoice_data["invoice_number"],
                    "amount": invoice_data["amount"],
                    "due_date": invoice_data["due_date"],
                    "buyer_gstin": invoice_data["buyer_gstin"],
                    "invoice_file": invoice_data["invoice_file"],  # Base64 encoded
                    "additional_documents": invoice_data.get("additional_documents", [])
                }
            )
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_discount_quote(
        self,
        invoice_id: str
    ) -> Dict[str, Any]:
        """Get discounting quote for an invoice"""
        try:
            return await self._make_request(
                "GET",
                f"/invoices/{invoice_id}/quote"
            )
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def accept_quote(
        self,
        invoice_id: str,
        quote_id: str
    ) -> Dict[str, Any]:
        """Accept a discounting quote"""
        try:
            return await self._make_request(
                "POST",
                f"/invoices/{invoice_id}/quotes/{quote_id}/accept"
            )
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_disbursement_status(
        self,
        invoice_id: str
    ) -> Dict[str, Any]:
        """Check disbursement status of a discounted invoice"""
        try:
            return await self._make_request(
                "GET",
                f"/invoices/{invoice_id}/disbursement"
            )
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_supplier_analytics(
        self,
        supplier_id: str
    ) -> Dict[str, Any]:
        """Get supplier's invoice discounting analytics"""
        try:
            return await self._make_request(
                "GET",
                f"/suppliers/{supplier_id}/analytics"
            )
        except Exception as e:
            return {"success": False, "error": str(e)}
