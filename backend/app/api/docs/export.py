from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ExportFormat(str, Enum):
    CSV = "csv"
    EXCEL = "excel"

class DateRange(BaseModel):
    start_date: Optional[datetime] = Field(
        None,
        description="Start date for filtering (ISO format)"
    )
    end_date: Optional[datetime] = Field(
        None,
        description="End date for filtering (ISO format)"
    )

    class Config:
        schema_extra = {
            "example": {
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z"
            }
        }

class TransactionExportParams(DateRange):
    type: Optional[str] = Field(
        None,
        description="Filter by transaction type"
    )
    format: ExportFormat = Field(
        default=ExportFormat.CSV,
        description="Export file format"
    )

    class Config:
        schema_extra = {
            "example": {
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "type": "DEPOSIT",
                "format": "csv"
            }
        }

class DisputeExportParams(DateRange):
    status: Optional[str] = Field(
        None,
        description="Filter by dispute status"
    )
    format: ExportFormat = Field(
        default=ExportFormat.CSV,
        description="Export file format"
    )

    class Config:
        schema_extra = {
            "example": {
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "status": "CLOSED",
                "format": "excel"
            }
        }

class EscrowExportParams(DateRange):
    status: Optional[str] = Field(
        None,
        description="Filter by escrow status"
    )
    format: ExportFormat = Field(
        default=ExportFormat.CSV,
        description="Export file format"
    )

    class Config:
        schema_extra = {
            "example": {
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-12-31T23:59:59Z",
                "status": "COMPLETED",
                "format": "csv"
            }
        }

export_responses = {
    "400": {
        "description": "Bad Request",
        "content": {
            "application/json": {
                "example": {"detail": "Invalid date range"}
            }
        }
    },
    "401": {
        "description": "Unauthorized",
        "content": {
            "application/json": {
                "example": {"detail": "Not authenticated"}
            }
        }
    },
    "403": {
        "description": "Forbidden",
        "content": {
            "application/json": {
                "example": {"detail": "Not authorized to export data"}
            }
        }
    }
}
