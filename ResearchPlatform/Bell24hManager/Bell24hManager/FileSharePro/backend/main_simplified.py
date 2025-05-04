import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="Bell24h API",
    description="API for Bell24h.com - AI-Powered RFQ Marketplace",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    uvicorn.run(app, host="0.0.0.0", port=5000)
