"""
A/B Testing Engine with Auto-Switch to Winner
Monitors conversion rates and automatically switches to winning variant every 2 hours
"""
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from supabase import create_client, Client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class ABTestEngine:
    """A/B Testing Engine for invite messages"""
    
    def __init__(self):
        self.variants = {
            "variant_a": {
                "message": "Your company is LIVE on Bell24h.com — India's #1 AI B2B platform!\n\nClaim FREE → Get ₹5,000 credit + 50+ inquiries in 7 days\n\nLink: https://bell24h.com/claim/{{slug}}\n\n102 suppliers claimed today. You're next.",
                "name": "₹5,000 Credit Airdrop"
            },
            "variant_b": {
                "message": "Your company is LIVE on Bell24h.com — India's #1 AI B2B platform!\n\nClaim FREE → Get 50+ inquiries in 7 days → ₹999 one-time\n\nLink: https://bell24h.com/claim/{{slug}}\n\n102 suppliers claimed today. You're next.",
                "name": "50 Inquiries Focus"
            }
        }
        self.check_interval_hours = 2
        self.min_samples = 100  # Minimum samples before switching
        
    def get_conversion_stats(self, hours: int = 2) -> Dict[str, float]:
        """Get conversion rates for each variant in last N hours"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            # Fetch A/B test results from Supabase
            response = supabase.table("invites_ab_test").select(
                "variant, conversion_rate, total_sent, total_converted"
            ).gte("created_at", cutoff_time.isoformat()).execute()
            
            stats = {}
            for row in response.data:
                variant = row.get("variant")
                if variant:
                    stats[variant] = {
                        "conversion_rate": float(row.get("conversion_rate", 0)),
                        "total_sent": int(row.get("total_sent", 0)),
                        "total_converted": int(row.get("total_converted", 0))
                    }
            
            return stats
        except Exception as e:
            logger.error(f"Error fetching conversion stats: {e}")
            return {}
    
    def determine_winner(self, stats: Dict[str, float]) -> Optional[str]:
        """Determine winning variant based on conversion rates"""
        if not stats:
            return None
        
        # Find variant with highest conversion rate and sufficient samples
        winner = None
        max_conversion = 0
        
        for variant, data in stats.items():
            conversion_rate = data.get("conversion_rate", 0)
            total_sent = data.get("total_sent", 0)
            
            # Only consider variants with sufficient samples
            if total_sent >= self.min_samples and conversion_rate > max_conversion:
                max_conversion = conversion_rate
                winner = variant
        
        return winner
    
    def get_current_active_variant(self) -> Optional[str]:
        """Get current active variant from database"""
        try:
            response = supabase.table("ab_test_config").select("active_variant").eq("id", "invite_message").execute()
            if response.data:
                return response.data[0].get("active_variant")
            return None
        except Exception as e:
            logger.error(f"Error getting active variant: {e}")
            return None
    
    def update_active_variant(self, variant: str):
        """Update active variant in database and n8n workflow"""
        try:
            # Update Supabase config
            supabase.table("ab_test_config").update({
                "active_variant": variant,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", "invite_message").execute()
            
            # Trigger n8n webhook to update workflow
            import requests
            n8n_webhook_url = os.getenv("N8N_WEBHOOK_AB_UPDATE")
            if n8n_webhook_url:
                requests.post(n8n_webhook_url, json={
                    "variant": variant,
                    "message": self.variants[variant]["message"]
                })
            
            logger.info(f"✅ Active variant updated to: {variant} ({self.variants[variant]['name']})")
        except Exception as e:
            logger.error(f"Error updating active variant: {e}")
    
    def run_monitoring_loop(self):
        """Continuous monitoring loop - runs every 2 hours"""
        logger.info("🚀 A/B Test Engine started - monitoring every 2 hours")
        
        while True:
            try:
                # Get conversion stats
                stats = self.get_conversion_stats(hours=self.check_interval_hours)
                
                if stats:
                    # Determine winner
                    winner = self.determine_winner(stats)
                    
                    if winner:
                        # Get current active variant
                        current = supabase.table("ab_test_config").select("active_variant").eq("id", "invite_message").execute()
                        current_variant = current.data[0].get("active_variant") if current.data else None
                        
                        # Switch if winner is different
                        if winner != current_variant:
                            logger.info(f"🔄 Switching to winner: {winner} (conversion: {stats[winner]['conversion_rate']:.2%})")
                            self.update_active_variant(winner)
                        else:
                            logger.info(f"✅ Winner unchanged: {winner} (conversion: {stats[winner]['conversion_rate']:.2%})")
                    else:
                        logger.info("⏳ Insufficient samples to determine winner")
                else:
                    logger.info("⏳ No conversion data available yet")
                
                # Wait for next check (2 hours)
                time.sleep(self.check_interval_hours * 3600)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(300)  # Retry in 5 minutes on error

if __name__ == "__main__":
    engine = ABTestEngine()
    engine.run_monitoring_loop()

