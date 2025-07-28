@echo off

echo Starting Bell24H AI Explainability Service...

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

REM Start the service
echo Starting FastAPI server on port 8000...
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo AI Explainability Service is running at http://localhost:8000
echo Health check: http://localhost:8000/health
echo API docs: http://localhost:8000/docs
pause 