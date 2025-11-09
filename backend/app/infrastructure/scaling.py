"""
Infrastructure Scaling Automation
Automatically scales n8n, SMS, and WhatsApp capacity based on demand
"""
import os
import logging
from datetime import datetime
from typing import Dict
from supabase import create_client, Client
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class InfrastructureScaler:
    """Automated infrastructure scaling based on demand"""
    
    def __init__(self):
        self.current_capacity = {
            "sms_per_day": 20000,
            "whatsapp_per_day": 20000,
            "n8n_batch_size": 500,
            "total_invites_per_day": 40000
        }
        self.max_capacity = {
            "sms_per_day": 100000,
            "whatsapp_per_day": 100000,
            "n8n_batch_size": 5000,
            "total_invites_per_day": 200000
        }
        self.scale_threshold = 0.8  # Scale up when 80% capacity used
        
    def get_current_usage(self) -> Dict[str, float]:
        """Get current infrastructure usage"""
        try:
            # Get today's invite count
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            response = supabase.table("invites_sent").select("count").gte("sent_at", today_start.isoformat()).execute()
            today_count = len(response.data) if response.data else 0
            
            # Calculate usage percentages
            usage = {
                "sms_usage": min(today_count / self.current_capacity["sms_per_day"], 1.0),
                "whatsapp_usage": min(today_count / self.current_capacity["whatsapp_per_day"], 1.0),
                "total_usage": min(today_count / self.current_capacity["total_invites_per_day"], 1.0),
                "today_count": today_count
            }
            
            return usage
        except Exception as e:
            logger.error(f"Error getting usage: {e}")
            return {"sms_usage": 0, "whatsapp_usage": 0, "total_usage": 0, "today_count": 0}
    
    def calculate_cost(self, invites_per_day: int) -> Dict[str, float]:
        """Calculate daily cost for given invite volume"""
        # SMS: ₹0.18 per SMS (MSG91)
        # WhatsApp: ₹0.18 per message (Meta Business API)
        sms_cost_per_message = 0.18
        whatsapp_cost_per_message = 0.18
        
        # Split 50/50 between SMS and WhatsApp
        sms_count = invites_per_day // 2
        whatsapp_count = invites_per_day // 2
        
        daily_cost = (sms_count * sms_cost_per_message) + (whatsapp_count * whatsapp_cost_per_message)
        
        return {
            "daily_cost": daily_cost,
            "monthly_cost": daily_cost * 30,
            "sms_count": sms_count,
            "whatsapp_count": whatsapp_count,
            "cost_per_invite": daily_cost / invites_per_day if invites_per_day > 0 else 0
        }
    
    def should_scale_up(self, usage: Dict[str, float]) -> bool:
        """Determine if scaling is needed"""
        return usage["total_usage"] >= self.scale_threshold
    
    def scale_up(self, target_capacity: int):
        """Scale up infrastructure to target capacity"""
        try:
            # Update n8n workflow batch size
            n8n_webhook = os.getenv("N8N_WEBHOOK_SCALE")
            if n8n_webhook:
                requests.post(n8n_webhook, json={
                    "batch_size": min(target_capacity // 100, self.max_capacity["n8n_batch_size"]),
                    "sms_per_day": target_capacity // 2,
                    "whatsapp_per_day": target_capacity // 2
                })
            
            # Update capacity in database
            supabase.table("infrastructure_config").update({
                "sms_per_day": target_capacity // 2,
                "whatsapp_per_day": target_capacity // 2,
                "total_invites_per_day": target_capacity,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", "invite_capacity").execute()
            
            # Update local capacity
            self.current_capacity["total_invites_per_day"] = target_capacity
            self.current_capacity["sms_per_day"] = target_capacity // 2
            self.current_capacity["whatsapp_per_day"] = target_capacity // 2
            
            cost = self.calculate_cost(target_capacity)
            
            logger.info(f"✅ Scaled up to {target_capacity} invites/day (Cost: ₹{cost['daily_cost']:.2f}/day)")
            
            # Alert if cost exceeds threshold
            if cost["daily_cost"] > 10000:
                self.send_alert(f"⚠️ High daily cost: ₹{cost['daily_cost']:.2f}/day ({target_capacity} invites/day)")
            
            return True
        except Exception as e:
            logger.error(f"Error scaling up: {e}")
            return False
    
    def send_alert(self, message: str):
        """Send alert via Telegram/Slack"""
        try:
            telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
            telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
            
            if telegram_bot_token and telegram_chat_id:
                requests.post(
                    f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                    json={"chat_id": telegram_chat_id, "text": message}
                )
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
    
    def auto_scale(self):
        """Automated scaling check and execution"""
        usage = self.get_current_usage()
        
        logger.info(f"📊 Current usage: {usage['today_count']}/{self.current_capacity['total_invites_per_day']} ({usage['total_usage']:.1%})")
        
        if self.should_scale_up(usage):
            # Calculate new capacity (scale up by 50%)
            new_capacity = min(
                int(self.current_capacity["total_invites_per_day"] * 1.5),
                self.max_capacity["total_invites_per_day"]
            )
            
            if new_capacity > self.current_capacity["total_invites_per_day"]:
                logger.info(f"🚀 Scaling up to {new_capacity} invites/day")
                self.scale_up(new_capacity)
            else:
                logger.info("⚠️ At maximum capacity")
        else:
            logger.info("✅ Capacity sufficient")

if __name__ == "__main__":
    scaler = InfrastructureScaler()
    scaler.auto_scale()

