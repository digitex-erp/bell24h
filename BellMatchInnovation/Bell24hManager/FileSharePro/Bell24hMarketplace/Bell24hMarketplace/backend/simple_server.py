from fastapi import FastAPI
import uvicorn

app = FastAPI(
    title="Bell24h API",
    description="API for Bell24h.com - AI-Powered RFQ Marketplace",
    version="1.0.0"
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
    print("Starting Bell24h API server...")
    uvicorn.run(app, host="0.0.0.0", port=5000)
else:
    print("This module is being imported...")
