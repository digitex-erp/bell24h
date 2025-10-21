from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.api_v1.api import api_router
from app.core.config import settings
from app.middleware.subscription import SubscriptionMiddleware

app = FastAPI(
    title="Bell24h API",
    description="""
    Bell24h RFQ Marketplace API provides a comprehensive suite of endpoints for managing:
    * Wallet operations and transactions
    * Escrow services
    * Dispute resolution
    * Invoice discounting via M1 Exchange
    * Data exports and analytics
    """,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(SubscriptionMiddleware)

# Include routers
app.include_router(api_router, prefix="/api/v1")

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Bell24h API",
        version="1.0.0",
        description="""
        Bell24h RFQ Marketplace API Documentation
        
        ## Features
        
        ### Wallet System
        - Deposit and withdrawal management
        - Transaction history
        - KYC verification
        
        ### Escrow Service
        - Secure payment holding
        - Milestone-based releases
        - Dispute resolution
        
        ### Invoice Discounting
        - M1 Exchange integration
        - Quote management
        - Disbursement tracking
        
        ### Data Export
        - Transaction reports
        - Dispute analytics
        - Escrow history
        
        ## Authentication
        All API endpoints require JWT authentication. Include the token in the Authorization header:
        ```
        Authorization: Bearer <your_jwt_token>
        ```
        
        ## Rate Limits
        - 100 requests per minute per IP
        - 1000 requests per hour per user
        - Export API: 10 requests per hour per user
        
        ## Support
        For API support, contact api@bell24h.com
        """,
        routes=app.routes,
    )
    
    # Custom extension
    openapi_schema["info"]["x-logo"] = {
        "url": "https://bell24h.com/logo.png"
    }
    
    # Security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
