from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional, Dict, Any
import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr

from backend.database import get_db, supabase
from backend.config import settings
from backend.models.user import UserCreate, UserLogin, UserProfile, UserResponse

router = APIRouter()

class AuthToken(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Helper function to create JWT tokens - mainly for internal use
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

# Dependency to get current user from token
async def get_current_user(authorization: Optional[str] = Header(None)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not authorization:
        raise credentials_exception
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise credentials_exception
    
    token = parts[1]
    
    try:
        # Validate token directly with Supabase
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if user is None:
            raise credentials_exception
        return user
    except Exception as e:
        raise credentials_exception

@router.post("/register", response_model=AuthToken)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Register user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "name": user_data.name,
                    "role": user_data.role,
                    "company": user_data.company
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        # Create profile record
        profile_data = {
            "id": auth_response.user.id,
            "name": user_data.name,
            "email": user_data.email,
            "role": user_data.role,
            "company": user_data.company,
            "gstin": user_data.gstin if user_data.role == "supplier" else None,
            "is_verified": False,
            "wallet_balance": 0
        }
        
        profile_response = supabase.table("user_profiles").insert(profile_data).execute()
        
        if not profile_response.data:
            # If profile creation fails, we should ideally delete the auth user
            # but Supabase doesn't provide a direct way to do this from the client
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user profile"
            )
        
        # Return token and user data
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": user_data.name,
                "role": user_data.role,
                "company": user_data.company
            }
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=AuthToken)
async def login(login_data: UserLogin):
    """Login with email and password"""
    try:
        # Login with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Get profile data
        profile_response = supabase.table("user_profiles").select("*").eq("id", auth_response.user.id).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        profile = profile_response.data[0]
        
        # Return token and user data
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": profile["name"],
                "role": profile["role"],
                "company": profile["company"]
            }
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    """Get current user information"""
    try:
        # Get user profile
        profile_response = supabase.table("user_profiles").select("*").eq("id", current_user.id).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        profile = profile_response.data[0]
        
        return {
            "id": current_user.id,
            "email": current_user.email,
            "name": profile["name"],
            "role": profile["role"],
            "company": profile["company"]
        }
    
    except Exception as e:
        if hasattr(e, "detail"):
            # Pass through FastAPI exceptions
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user data: {str(e)}"
        )

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """Logout the user"""
    try:
        # With Supabase, we don't need to explicitly invalidate the token
        # The client should remove the token from storage
        return {"detail": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )
