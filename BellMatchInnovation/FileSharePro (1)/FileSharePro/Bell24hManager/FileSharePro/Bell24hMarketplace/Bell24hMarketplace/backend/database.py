import os
from typing import AsyncGenerator, Optional
from supabase import create_client, Client
from postgrest.base_request_builder import APIResponse
from postgrest.exceptions import APIError
import json

from backend.config import settings

# Initialize Supabase client
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

# Admin client for privileged operations
supabase_admin: Optional[Client] = None
if settings.SUPABASE_SERVICE_KEY:
    supabase_admin = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_KEY
    )

async def initialize_db():
    """Initialize database connection and perform any setup tasks"""
    # Example: make a simple request to ensure connection is working
    try:
        response = supabase.table("user_profiles").select("count", count="exact").execute()
        print(f"Database connected successfully. User count: {response.count}")
        return True
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        return False

async def get_db() -> Client:
    """Dependency for database access"""
    return supabase

async def get_admin_db() -> Client:
    """Dependency for admin database access"""
    if not supabase_admin:
        raise ValueError("Admin database client not configured")
    return supabase_admin

# Helper functions for common database operations
async def fetch_one(table: str, query=None, **filters) -> Optional[dict]:
    """Fetch a single record from the database"""
    q = supabase.table(table).select("*")
    
    # Apply query if provided
    if query:
        q = query(q)
    
    # Apply filters
    for field, value in filters.items():
        if value is not None:
            q = q.eq(field, value)
    
    try:
        response: APIResponse = q.limit(1).execute()
        data = response.data
        
        if not data:
            return None
            
        return data[0]
    except APIError as e:
        print(f"Database error in fetch_one: {str(e)}")
        return None

async def fetch_many(table: str, query=None, limit=100, **filters) -> list:
    """Fetch multiple records from the database"""
    q = supabase.table(table).select("*")
    
    # Apply query if provided
    if query:
        q = query(q)
    
    # Apply filters
    for field, value in filters.items():
        if value is not None:
            q = q.eq(field, value)
    
    try:
        response: APIResponse = q.limit(limit).execute()
        return response.data or []
    except APIError as e:
        print(f"Database error in fetch_many: {str(e)}")
        return []

async def insert(table: str, data: dict) -> Optional[dict]:
    """Insert a record into the database"""
    try:
        response: APIResponse = supabase.table(table).insert(data).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except APIError as e:
        print(f"Database error in insert: {str(e)}")
        return None

async def update(table: str, id_field: str, id_value, data: dict) -> Optional[dict]:
    """Update a record in the database"""
    try:
        response: APIResponse = (
            supabase.table(table)
            .update(data)
            .eq(id_field, id_value)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except APIError as e:
        print(f"Database error in update: {str(e)}")
        return None

async def delete(table: str, id_field: str, id_value) -> bool:
    """Delete a record from the database"""
    try:
        response: APIResponse = (
            supabase.table(table)
            .delete()
            .eq(id_field, id_value)
            .execute()
        )
        return True
    except APIError as e:
        print(f"Database error in delete: {str(e)}")
        return False
