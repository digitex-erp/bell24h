
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from backend.config import settings

security = HTTPBearer()

async def verify_token(request: Request):
    try:
        auth = await security(request)
        payload = jwt.decode(auth.credentials, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
