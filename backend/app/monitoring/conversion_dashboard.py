"""
Real-time Conversion Dashboard for A/B Tests
Provides live metrics and graphs for admin dashboard
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import Dict, List
from supabase import create_client, Client
import os

router = APIRouter(prefix="/api/admin/ab-test", tags=["A/B Testing"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.get("/stats")
async def get_ab_test_stats(hours: int = 24):
    """Get A/B test statistics for last N hours"""
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        # Fetch conversion data
        response = supabase.table("invites_ab_test").select(
            "variant, conversion_rate, total_sent, total_converted, created_at"
        ).gte("created_at", cutoff_time.isoformat()).order("created_at", desc=True).execute()
        
        # Aggregate by variant
        stats = {}
        for row in response.data:
            variant = row.get("variant")
            if variant not in stats:
                stats[variant] = {
                    "variant": variant,
                    "total_sent": 0,
                    "total_converted": 0,
                    "conversion_rate": 0.0,
                    "data_points": []
                }
            
            stats[variant]["total_sent"] += int(row.get("total_sent", 0))
            stats[variant]["total_converted"] += int(row.get("total_converted", 0))
            stats[variant]["data_points"].append({
                "time": row.get("created_at"),
                "conversion_rate": float(row.get("conversion_rate", 0)),
                "sent": int(row.get("total_sent", 0)),
                "converted": int(row.get("total_converted", 0))
            })
        
        # Calculate overall conversion rates
        for variant in stats.values():
            if variant["total_sent"] > 0:
                variant["conversion_rate"] = variant["total_converted"] / variant["total_sent"]
        
        # Get active variant
        config = supabase.table("ab_test_config").select("active_variant").eq("id", "invite_message").execute()
        active_variant = config.data[0].get("active_variant") if config.data else None
        
        return {
            "stats": list(stats.values()),
            "active_variant": active_variant,
            "period_hours": hours,
            "winner": max(stats.values(), key=lambda x: x["conversion_rate"])["variant"] if stats else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph")
async def get_conversion_graph(hours: int = 24, interval_minutes: int = 60):
    """Get time-series conversion graph data"""
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        # Fetch time-series data
        response = supabase.table("invites_ab_test").select(
            "variant, conversion_rate, total_sent, total_converted, created_at"
        ).gte("created_at", cutoff_time.isoformat()).order("created_at").execute()
        
        # Group by time intervals
        intervals = {}
        for row in response.data:
            timestamp = datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
            interval_key = timestamp.replace(minute=0, second=0, microsecond=0).isoformat()
            
            if interval_key not in intervals:
                intervals[interval_key] = {}
            
            variant = row.get("variant")
            if variant not in intervals[interval_key]:
                intervals[interval_key][variant] = {
                    "sent": 0,
                    "converted": 0
                }
            
            intervals[interval_key][variant]["sent"] += int(row.get("total_sent", 0))
            intervals[interval_key][variant]["converted"] += int(row.get("total_converted", 0))
        
        # Format for graph
        graph_data = []
        for time_key, variants in sorted(intervals.items()):
            point = {"time": time_key}
            for variant, data in variants.items():
                conversion_rate = data["converted"] / data["sent"] if data["sent"] > 0 else 0
                point[f"{variant}_rate"] = conversion_rate
                point[f"{variant}_sent"] = data["sent"]
                point[f"{variant}_converted"] = data["converted"]
            graph_data.append(point)
        
        return {"graph_data": graph_data, "interval_minutes": interval_minutes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

