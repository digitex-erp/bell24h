import os
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

from backend.database import get_db, initialize_db
from backend.routes import auth, rfq, supplier, payment, gst, websocket, supplier_performance
from backend.config import settings

# Setup lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database connection on startup
    await initialize_db()
    yield
    # Additional cleanup if needed

# Create FastAPI app
app = FastAPI(
    title="Bell24h API",
    description="API for Bell24h.com - AI-Powered RFQ Marketplace",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting Middleware
class RateLimiter:
    def __init__(self, app, requests_per_minute):
        self.app = app
        self.requests_per_minute = requests_per_minute

    async def __call__(self, request: Request, call_next):
        # (Simplified rate limiting - replace with a robust solution in production)
        #  This example uses a very basic in-memory check and lacks persistence.
        #  A real-world implementation would use Redis, Memcached, or a database.
        ip = request.client.host
        if ip not in self.limits:
            self.limits[ip] = 0
        if self.limits[ip] >= self.requests_per_minute:
            raise HTTPException(status_code=429, detail="Too Many Requests")
        self.limits[ip] +=1
        response = await call_next(request)
        return response

    limits = {} #In-memory storage for request counts - replace with a persistent store


# Request Logging Middleware
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    end_time = datetime.now()
    processing_time = (end_time - start_time).total_seconds()
    print(f"Request: {request.method} {request.url} - Processing Time: {processing_time:.4f}s")
    return response


app.middleware("http")(log_requests)
app.add_middleware(RateLimiter, requests_per_minute=60)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(rfq.router, prefix="/api/rfq", tags=["RFQ"])
app.include_router(supplier.router, prefix="/api/supplier", tags=["Supplier"])
app.include_router(payment.router, prefix="/api/wallet", tags=["Payments"])
app.include_router(gst.router, prefix="/api/gst", tags=["GST"])
app.include_router(supplier_performance.router, tags=["Supplier Performance"])

# Mount WebSocket handler
app.mount("/ws", websocket.app)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "Bell24h API"}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Bell24h API",
        "version": "1.0.0",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=5000,
        reload=settings.DEBUG
    )