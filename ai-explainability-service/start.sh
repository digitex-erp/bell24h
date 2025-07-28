#!/bin/bash

echo "Starting Bell24H AI Explainability Service..."

# Install dependencies if not installed
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start the service
echo "Starting FastAPI server on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo "AI Explainability Service is running at http://localhost:8000"
echo "Health check: http://localhost:8000/health"
echo "API docs: http://localhost:8000/docs" 