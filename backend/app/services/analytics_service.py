from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.rfq import RFQ
from app.models.supplier import Supplier
from app.models.quotation import Quotation
from app.services.ai_services import AIServices

class AnalyticsService:
    @staticmethod
    async def get_dashboard_metrics(db: Session, timeframe: str) -> Dict[str, Any]:
        """Get all metrics for the analytics dashboard"""
        # Calculate date range
        end_date = datetime.utcnow()
        if timeframe == '7d':
            start_date = end_date - timedelta(days=7)
        elif timeframe == '30d':
            start_date = end_date - timedelta(days=30)
        elif timeframe == '90d':
            start_date = end_date - timedelta(days=90)
        else:  # 1y
            start_date = end_date - timedelta(days=365)

        return {
            "rfqMetrics": await AnalyticsService.get_rfq_metrics(db, start_date, end_date),
            "supplierMetrics": await AnalyticsService.get_supplier_metrics(db, start_date, end_date),
            "marketTrends": await AnalyticsService.get_market_trends(db, start_date, end_date),
            "categoryDistribution": await AnalyticsService.get_category_distribution(db, start_date, end_date)
        }

    @staticmethod
    async def get_rfq_metrics(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate RFQ-related metrics"""
        # Get total RFQs in timeframe
        total_rfqs = db.query(RFQ).filter(
            RFQ.created_at.between(start_date, end_date)
        ).count()

        # Get active RFQs
        active_rfqs = db.query(RFQ).filter(
            RFQ.status == "OPEN",
            RFQ.created_at.between(start_date, end_date)
        ).count()

        # Calculate success rate (RFQs with accepted quotations)
        successful_rfqs = db.query(RFQ).join(Quotation).filter(
            RFQ.created_at.between(start_date, end_date),
            Quotation.status == "ACCEPTED"
        ).distinct().count()

        success_rate = (successful_rfqs / total_rfqs * 100) if total_rfqs > 0 else 0

        # Calculate average response time
        response_times = db.query(
            func.avg(Quotation.created_at - RFQ.created_at)
        ).join(RFQ).filter(
            RFQ.created_at.between(start_date, end_date)
        ).scalar()

        avg_response_time = round(response_times.total_seconds() / 3600) if response_times else 0

        return {
            "total": total_rfqs,
            "success_rate": round(success_rate, 1),
            "avg_response_time": avg_response_time,
            "active": active_rfqs
        }

    @staticmethod
    async def get_supplier_metrics(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate supplier-related metrics"""
        # Get total suppliers
        total_suppliers = db.query(Supplier).count()

        # Calculate average risk score
        risk_scores = []
        suppliers = db.query(Supplier).all()
        for supplier in suppliers:
            # Get supplier performance data
            supplier_data = {
                "late_delivery_rate": 0.1,  # Example values - implement actual calculations
                "compliance_score": 0.9,
                "financial_stability": 0.85,
                "user_feedback": 0.95
            }
            risk_result = AIServices.calculate_supplier_risk(supplier_data)
            if risk_result["success"]:
                risk_scores.append(risk_result["risk_score"])

        avg_risk_score = sum(risk_scores) / len(risk_scores) if risk_scores else 0

        # Get top categories
        top_categories = db.query(
            Supplier.categories,
            func.count(Supplier.id).label('count')
        ).group_by(Supplier.categories).order_by(func.count(Supplier.id).desc()).limit(5).all()

        # Calculate supplier performance over time
        performance_data = []
        for month in range(6):
            month_start = end_date - timedelta(days=30 * (5 - month))
            month_end = end_date - timedelta(days=30 * (4 - month))
            
            # Calculate performance score for the month
            score = db.query(func.avg(Quotation.supplier_rating)).filter(
                Quotation.created_at.between(month_start, month_end)
            ).scalar() or 0
            
            performance_data.append(round(score, 2))

        return {
            "total": total_suppliers,
            "avg_risk_score": round(avg_risk_score, 2),
            "top_categories": [
                {"name": cat, "count": count}
                for cat, count in top_categories
            ],
            "performance": performance_data
        }

    @staticmethod
    async def get_market_trends(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get market trends data"""
        # Get industry data from most common category
        top_category = db.query(
            Supplier.categories,
            func.count(Supplier.id).label('count')
        ).group_by(Supplier.categories).order_by(func.count(Supplier.id).desc()).first()

        if not top_category:
            return {
                "dates": [],
                "values": [],
                "trend": "up"
            }

        industry = top_category[0]
        market_data = await AIServices.get_stock_trends(industry)

        if not market_data["success"]:
            return {
                "dates": [],
                "values": [],
                "trend": "up"
            }

        trend_data = market_data["data"]
        return {
            "dates": [
                (end_date - timedelta(days=x)).strftime('%Y-%m-%d')
                for x in range(30, -1, -1)
            ],
            "values": trend_data.get("prices", []),
            "trend": trend_data.get("trend", "up")
        }

    @staticmethod
    async def get_category_distribution(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get category distribution data"""
        categories = db.query(
            RFQ.category,
            func.count(RFQ.id).label('count')
        ).filter(
            RFQ.created_at.between(start_date, end_date)
        ).group_by(RFQ.category).all()

        return {
            "labels": [cat for cat, _ in categories],
            "data": [count for _, count in categories]
        }
