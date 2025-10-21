import razorpay
from typing import Dict, Any, Optional
from app.core.config import settings
from datetime import datetime

class RazorpayService:
    def __init__(self):
        self.client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        self.account_number = settings.RAZORPAY_ACCOUNT_NUMBER

    async def create_contact(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Create a RazorpayX contact for the user"""
        try:
            contact = self.client.contact.create({
                "name": user["name"],
                "email": user["email"],
                "contact": user["phone"],
                "type": "customer",
                "reference_id": str(user["id"]),
            })
            return {"success": True, "contact": contact}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def create_fund_account(
        self,
        contact_id: str,
        bank_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a RazorpayX fund account for bank transfers"""
        try:
            fund_account = self.client.fund_account.create({
                "contact_id": contact_id,
                "account_type": "bank_account",
                "bank_account": {
                    "name": bank_details["account_name"],
                    "ifsc": bank_details["ifsc"],
                    "account_number": bank_details["account_number"]
                }
            })
            return {"success": True, "fund_account": fund_account}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def create_payout(
        self,
        fund_account_id: str,
        amount: float,
        reference_id: str,
        purpose: str = "payout"
    ) -> Dict[str, Any]:
        """Create a payout (withdrawal) to user's bank account"""
        try:
            # Amount in paise
            amount_paise = int(amount * 100)
            
            payout = self.client.payout.create({
                "account_number": self.account_number,
                "fund_account_id": fund_account_id,
                "amount": amount_paise,
                "currency": "INR",
                "mode": "IMPS",
                "purpose": purpose,
                "queue_if_low_balance": True,
                "reference_id": reference_id,
            })
            return {"success": True, "payout": payout}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def create_payment_link(
        self,
        amount: float,
        purpose: str,
        user_id: int,
        reference_id: str
    ) -> Dict[str, Any]:
        """Create a payment link for wallet deposits"""
        try:
            # Amount in paise
            amount_paise = int(amount * 100)
            
            payment_link = self.client.payment_link.create({
                "amount": amount_paise,
                "currency": "INR",
                "accept_partial": False,
                "description": f"Wallet deposit for {purpose}",
                "customer": {
                    "name": user_id,  # We'll update this with actual user data
                    "contact": "+911234567890",  # Placeholder
                    "email": "user@example.com"  # Placeholder
                },
                "notify": {
                    "sms": True,
                    "email": True
                },
                "reminder_enable": True,
                "notes": {
                    "user_id": str(user_id),
                    "purpose": purpose,
                    "reference_id": reference_id
                }
            })
            return {"success": True, "payment_link": payment_link}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def create_escrow(
        self,
        amount: float,
        buyer_id: int,
        supplier_id: int,
        rfq_id: int
    ) -> Dict[str, Any]:
        """Create an escrow account for RFQ transaction"""
        try:
            # Amount in paise
            amount_paise = int(amount * 100)
            
            escrow = self.client.escrow.create({
                "amount": amount_paise,
                "currency": "INR",
                "notes": {
                    "buyer_id": str(buyer_id),
                    "supplier_id": str(supplier_id),
                    "rfq_id": str(rfq_id)
                }
            })
            return {"success": True, "escrow": escrow}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def release_escrow(
        self,
        escrow_id: str,
        amount: float,
        fund_account_id: str
    ) -> Dict[str, Any]:
        """Release funds from escrow to supplier"""
        try:
            # Amount in paise
            amount_paise = int(amount * 100)
            
            release = self.client.escrow.release({
                "id": escrow_id,
                "amount": amount_paise,
                "currency": "INR",
                "fund_account_id": fund_account_id
            })
            return {"success": True, "release": release}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def verify_payment(
        self,
        payment_id: str,
        payment_signature: str,
        order_id: str
    ) -> bool:
        """Verify Razorpay payment signature"""
        try:
            self.client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': payment_signature
            })
            return True
        except Exception:
            return False
