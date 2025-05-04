import razorpay
from backend.config import settings

def get_razorpay_client():
    """
    Initialize and return a RazorpayX client
    
    Returns:
        razorpay.Client instance
    """
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
