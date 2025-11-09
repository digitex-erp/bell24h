"""
Enhancement Task Queue and Migration System
Tracks pending enhancements and migrates them to task list
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

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class EnhancementQueue:
    """Enhancement task queue management"""
    
    def __init__(self):
        self.priority_weights = {
            TaskPriority.CRITICAL: 10,
            TaskPriority.HIGH: 5,
            TaskPriority.MEDIUM: 2,
            TaskPriority.LOW: 1
        }
    
    def add_enhancement(self, title: str, description: str, priority: TaskPriority,
                       category: str, estimated_hours: Optional[int] = None) -> str:
        """Add enhancement to queue"""
        try:
            response = supabase.table("enhancement_tasks").insert({
                "title": title,
                "description": description,
                "priority": priority.value,
                "category": category,
                "status": TaskStatus.PENDING.value,
                "estimated_hours": estimated_hours,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            
            task_id = response.data[0].get("id") if response.data else None
            
            logger.info(f"📋 Enhancement added: {title} (Priority: {priority.value})")
            return task_id
        except Exception as e:
            logger.error(f"Error adding enhancement: {e}")
            return None
    
    def get_pending_tasks(self, limit: int = 50) -> List[Dict]:
        """Get all pending enhancement tasks"""
        try:
            response = supabase.table("enhancement_tasks").select(
                "id, title, description, priority, category, status, estimated_hours, created_at"
            ).eq("status", TaskStatus.PENDING.value).order("priority", desc=True).limit(limit).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting pending tasks: {e}")
            return []
    
    def get_tasks_by_category(self, category: str) -> List[Dict]:
        """Get tasks by category"""
        try:
            response = supabase.table("enhancement_tasks").select(
                "id, title, description, priority, category, status"
            ).eq("category", category).eq("status", TaskStatus.PENDING.value).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting tasks by category: {e}")
            return []
    
    def mark_in_progress(self, task_id: str, assigned_to: str):
        """Mark task as in progress"""
        try:
            supabase.table("enhancement_tasks").update({
                "status": TaskStatus.IN_PROGRESS.value,
                "assigned_to": assigned_to,
                "started_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", task_id).execute()
            
            logger.info(f"🔧 Task {task_id} marked as in progress")
        except Exception as e:
            logger.error(f"Error updating task: {e}")
    
    def mark_completed(self, task_id: str, completion_notes: Optional[str] = None):
        """Mark task as completed"""
        try:
            supabase.table("enhancement_tasks").update({
                "status": TaskStatus.COMPLETED.value,
                "completion_notes": completion_notes,
                "completed_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", task_id).execute()
            
            logger.info(f"✅ Task {task_id} marked as completed")
        except Exception as e:
            logger.error(f"Error updating task: {e}")
    
    def get_pending_count(self) -> int:
        """Get count of pending tasks"""
        try:
            response = supabase.table("enhancement_tasks").select("id", count="exact").eq("status", TaskStatus.PENDING.value).execute()
            return response.count if hasattr(response, "count") else 0
        except Exception as e:
            logger.error(f"Error getting pending count: {e}")
            return 0
    
    def migrate_from_audit(self, audit_findings: List[Dict]):
        """Migrate audit findings to enhancement tasks"""
        for finding in audit_findings:
            self.add_enhancement(
                title=finding.get("title"),
                description=finding.get("description"),
                priority=TaskPriority(finding.get("priority", "medium")),
                category=finding.get("category", "general"),
                estimated_hours=finding.get("estimated_hours")
            )

# Common enhancements from post-audit protocol
POST_AUDIT_ENHANCEMENTS = [
    {
        "title": "Mobile PWA + Push Notifications",
        "description": "Implement PWA with service worker and Firebase push notifications",
        "priority": TaskPriority.HIGH,
        "category": "mobile",
        "estimated_hours": 8
    },
    {
        "title": "Dynamic Gamification - Supplier Olympics",
        "description": "Weekly prizes, streak badges, leaderboard competitions",
        "priority": TaskPriority.MEDIUM,
        "category": "gamification",
        "estimated_hours": 12
    },
    {
        "title": "Deeper Data Science Cohorts",
        "description": "Conversion analysis by state/city/product, best time to submit RFQ",
        "priority": TaskPriority.MEDIUM,
        "category": "analytics",
        "estimated_hours": 6
    },
    {
        "title": "Governance Dashboard",
        "description": "BELL token holders vote on pricing changes and platform decisions",
        "priority": TaskPriority.LOW,
        "category": "governance",
        "estimated_hours": 10
    },
    {
        "title": "API Docs + Affiliate System",
        "description": "OpenAPI docs and affiliate referral system with ₹500 per paid claim",
        "priority": TaskPriority.HIGH,
        "category": "api",
        "estimated_hours": 8
    },
    {
        "title": "Concierge Support + AI Chatbot",
        "description": "WhatsApp Business API with Groq + Llama3 for AI replies, top 100 get personal manager",
        "priority": TaskPriority.MEDIUM,
        "category": "support",
        "estimated_hours": 12
    }
]

def initialize_post_audit_enhancements():
    """Initialize post-audit enhancements"""
    queue = EnhancementQueue()
    for enhancement in POST_AUDIT_ENHANCEMENTS:
        queue.add_enhancement(
            enhancement["title"],
            enhancement["description"],
            enhancement["priority"],
            enhancement["category"],
            enhancement["estimated_hours"]
        )

if __name__ == "__main__":
    queue = EnhancementQueue()
    
    # Get pending count
    pending_count = queue.get_pending_count()
    print(f"📋 Pending enhancements: {pending_count}")
    
    # Get pending tasks
    pending_tasks = queue.get_pending_tasks(limit=10)
    print(f"\n🔍 Top {len(pending_tasks)} pending tasks:")
    for task in pending_tasks:
        print(f"  - {task['title']} (Priority: {task['priority']}, Category: {task['category']})")

