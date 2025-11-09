"""
Bug Tracking and Hotfix Prioritization System
Tracks user-reported bugs and prioritizes hotfixes based on impact
"""
import os
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum
from supabase import create_client, Client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class BugSeverity(Enum):
    CRITICAL = "critical"  # Blocks core functionality
    HIGH = "high"  # Major feature broken
    MEDIUM = "medium"  # Minor feature issue
    LOW = "low"  # UI/UX polish

class BugStatus(Enum):
    REPORTED = "reported"
    TRIAGED = "triaged"
    IN_PROGRESS = "in_progress"
    FIXED = "fixed"
    VERIFIED = "verified"
    CLOSED = "closed"

class BugPrioritizer:
    """Bug tracking and prioritization system"""
    
    def __init__(self):
        self.severity_weights = {
            BugSeverity.CRITICAL: 10,
            BugSeverity.HIGH: 5,
            BugSeverity.MEDIUM: 2,
            BugSeverity.LOW: 1
        }
        self.user_impact_weights = {
            "all_users": 10,
            "paying_users": 8,
            "top_100": 5,
            "new_users": 3
        }
    
    def report_bug(self, title: str, description: str, severity: BugSeverity, 
                   user_impact: str, reported_by: Optional[str] = None) -> str:
        """Report a new bug"""
        try:
            # Calculate priority score
            priority_score = (
                self.severity_weights[severity] * 
                self.user_impact_weights.get(user_impact, 1)
            )
            
            # Insert into database
            response = supabase.table("bugs").insert({
                "title": title,
                "description": description,
                "severity": severity.value,
                "user_impact": user_impact,
                "priority_score": priority_score,
                "status": BugStatus.REPORTED.value,
                "reported_by": reported_by,
                "reported_at": datetime.utcnow().isoformat()
            }).execute()
            
            bug_id = response.data[0].get("id") if response.data else None
            
            logger.info(f"🐛 Bug reported: {title} (Priority: {priority_score}, Severity: {severity.value})")
            
            # Alert if critical
            if severity == BugSeverity.CRITICAL:
                self.send_critical_alert(bug_id, title)
            
            return bug_id
        except Exception as e:
            logger.error(f"Error reporting bug: {e}")
            return None
    
    def get_priority_bugs(self, limit: int = 10) -> List[Dict]:
        """Get highest priority bugs for hotfix"""
        try:
            response = supabase.table("bugs").select(
                "id, title, description, severity, user_impact, priority_score, status, reported_at"
            ).eq("status", BugStatus.REPORTED.value).order("priority_score", desc=True).limit(limit).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting priority bugs: {e}")
            return []
    
    def mark_in_progress(self, bug_id: str, assigned_to: str):
        """Mark bug as in progress"""
        try:
            supabase.table("bugs").update({
                "status": BugStatus.IN_PROGRESS.value,
                "assigned_to": assigned_to,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", bug_id).execute()
            
            logger.info(f"🔧 Bug {bug_id} marked as in progress")
        except Exception as e:
            logger.error(f"Error updating bug: {e}")
    
    def mark_fixed(self, bug_id: str, fix_description: str):
        """Mark bug as fixed"""
        try:
            supabase.table("bugs").update({
                "status": BugStatus.FIXED.value,
                "fix_description": fix_description,
                "fixed_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", bug_id).execute()
            
            logger.info(f"✅ Bug {bug_id} marked as fixed")
        except Exception as e:
            logger.error(f"Error updating bug: {e}")
    
    def send_critical_alert(self, bug_id: str, title: str):
        """Send alert for critical bugs"""
        try:
            import requests
            telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
            telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
            
            if telegram_bot_token and telegram_chat_id:
                message = f"🚨 CRITICAL BUG REPORTED\n\nID: {bug_id}\nTitle: {title}\n\nImmediate action required!"
                requests.post(
                    f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                    json={"chat_id": telegram_chat_id, "text": message}
                )
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
    
    def auto_triage(self):
        """Automatically triage reported bugs"""
        try:
            # Get all reported bugs
            response = supabase.table("bugs").select(
                "id, title, severity, user_impact, priority_score"
            ).eq("status", BugStatus.REPORTED.value).execute()
            
            for bug in response.data:
                # Auto-triage based on keywords
                title_lower = bug.get("title", "").lower()
                description_lower = bug.get("description", "").lower()
                
                # Check for critical keywords
                if any(keyword in title_lower or keyword in description_lower 
                       for keyword in ["wallet", "payment", "claim", "credit", "airdrop", "leaderboard"]):
                    # Mark as triaged and high priority
                    supabase.table("bugs").update({
                        "status": BugStatus.TRIAGED.value,
                        "updated_at": datetime.utcnow().isoformat()
                    }).eq("id", bug.get("id")).execute()
                    
                    logger.info(f"✅ Auto-triaged bug: {bug.get('title')}")
        except Exception as e:
            logger.error(f"Error auto-triaging: {e}")

# Common bugs to report automatically
COMMON_BUGS = [
    {
        "title": "Wallet receipt not showing ₹5,000 credit",
        "description": "Users report wallet credit not visible after claim verification",
        "severity": BugSeverity.HIGH,
        "user_impact": "all_users"
    },
    {
        "title": "Leaderboard jumpiness (real-time updates)",
        "description": "Leaderboard rankings jump around due to real-time updates without debounce",
        "severity": BugSeverity.MEDIUM,
        "user_impact": "paying_users"
    },
    {
        "title": "Claim credit allocation delay",
        "description": "Credit airdrop not instant after claim verification",
        "severity": BugSeverity.HIGH,
        "user_impact": "new_users"
    }
]

def initialize_common_bugs():
    """Initialize common bugs from user feedback"""
    prioritizer = BugPrioritizer()
    for bug in COMMON_BUGS:
        prioritizer.report_bug(
            bug["title"],
            bug["description"],
            bug["severity"],
            bug["user_impact"]
        )

if __name__ == "__main__":
    prioritizer = BugPrioritizer()
    prioritizer.auto_triage()
    
    # Get priority bugs
    priority_bugs = prioritizer.get_priority_bugs(limit=5)
    print(f"🐛 Top {len(priority_bugs)} priority bugs:")
    for bug in priority_bugs:
        print(f"  - {bug['title']} (Priority: {bug['priority_score']}, Severity: {bug['severity']})")

