
import logging
import time
from fastapi import Request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"Method: {request.method} Path: {request.url.path} "
        f"Status: {response.status_code} Duration: {process_time:.2f}s"
    )
    
    return response
