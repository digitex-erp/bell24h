from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from pathlib import Path
from app.core.config import settings
from typing import List, Dict, Any
import jinja2

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=Path(__file__).parent.parent / 'templates' / 'email'
)

# Initialize FastMail
fastmail = FastMail(conf)

# Initialize Jinja2 environment
template_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(str(Path(__file__).parent.parent / 'templates' / 'email'))
)

async def send_email(
    recipients: List[EmailStr],
    template_name: str,
    subject: str,
    data: Dict[str, Any]
) -> None:
    """
    Send an email using a template
    """
    template = template_env.get_template(f"{template_name}.html")
    html_content = template.render(**data)
    
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=html_content,
        subtype="html"
    )
    
    await fastmail.send_message(message)

async def send_rfq_notification(
    supplier_email: EmailStr,
    rfq_data: Dict[str, Any]
) -> None:
    """
    Send notification to supplier about new RFQ
    """
    await send_email(
        recipients=[supplier_email],
        template_name="rfq_notification",
        subject="New RFQ Available",
        data={
            "company_name": rfq_data["company_name"],
            "rfq_title": rfq_data["title"],
            "rfq_id": rfq_data["id"],
            "categories": rfq_data["categories"],
            "deadline": rfq_data["deadline"]
        }
    )

async def send_quotation_submitted_notification(
    rfq_owner_email: EmailStr,
    quotation_data: Dict[str, Any]
) -> None:
    """
    Send notification to RFQ owner about new quotation
    """
    await send_email(
        recipients=[rfq_owner_email],
        template_name="quotation_submitted",
        subject="New Quotation Received",
        data={
            "supplier_name": quotation_data["supplier_name"],
            "rfq_title": quotation_data["rfq_title"],
            "quotation_id": quotation_data["id"],
            "total_price": quotation_data["total_price"],
            "currency": quotation_data["currency"]
        }
    )

async def send_quotation_status_notification(
    supplier_email: EmailStr,
    quotation_data: Dict[str, Any]
) -> None:
    """
    Send notification to supplier about quotation status change
    """
    status = quotation_data["status"].lower()
    await send_email(
        recipients=[supplier_email],
        template_name=f"quotation_{status}",
        subject=f"Quotation {status.capitalize()}",
        data={
            "rfq_title": quotation_data["rfq_title"],
            "quotation_id": quotation_data["id"],
            "status": quotation_data["status"],
            "message": quotation_data.get("message", "")
        }
    )
