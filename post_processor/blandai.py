import os
import requests
from typing import Dict, Any, Optional, List, Union
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment variables
BLAND_API_KEY = os.getenv("BLAND_API_KEY")
BLAND_API_BASE_URL = "https://api.bland.ai/v1"

# Create router
router = APIRouter(prefix="/bland", tags=["bland"])

# Pydantic models for request validation
class BlandAICallRequest(BaseModel):
    phone_number: str = Field(..., description="The phone number to call in E.164 format (e.g., +12223334444)")
    task: Optional[str] = Field(None, description="Instructions for the AI agent")
    pathway_id: Optional[str] = Field(None, description="ID of a predefined conversation pathway")
    voice: Optional[str] = Field(None, description="Voice ID or preset name")
    background_track: Optional[str] = Field(None, description="Background audio track")
    first_sentence: Optional[str] = Field(None, description="First sentence for the AI to say")
    wait_for_greeting: Optional[bool] = Field(None, description="Wait for recipient to speak first")
    block_interruptions: Optional[bool] = Field(None, description="Prevent AI from processing interruptions")
    voicemail_message: Optional[str] = Field(None, description="Message to leave on voicemail")
    voicemail_action: Optional[str] = Field(None, description="Action to take on voicemail detection")
    max_duration: Optional[int] = Field(None, description="Maximum call duration in minutes")
    record: Optional[bool] = Field(None, description="Whether to record the call")
    from_number: Optional[str] = Field(None, description="Phone number to call from")
    webhook: Optional[str] = Field(None, description="Webhook URL for call events")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Custom metadata for the call")
    request_data: Optional[Dict[str, Any]] = Field(None, description="Data to be used in the conversation")

class BlandAICallResponse(BaseModel):
    status: str
    call_id: Optional[str] = None
    error: Optional[str] = None

# Helper function to make API calls to Bland AI
def call_bland_api(endpoint: str, method: str = "GET", data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Make API calls to Bland AI

    Args:
        endpoint: API endpoint path
        method: HTTP method (GET, POST, etc.)
        data: Request data for POST/PUT requests

    Returns:
        API response as dictionary
    """
    if not BLAND_API_KEY:
        raise HTTPException(status_code=500, detail="BLAND_API_KEY not configured")

    url = f"{BLAND_API_BASE_URL}/{endpoint.lstrip('/')}"
    headers = {"Authorization": BLAND_API_KEY}

    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_data = e.response.json()
                error_message = error_data.get('message', str(e))
            except:
                error_message = str(e)
        else:
            error_message = str(e)

        raise HTTPException(status_code=e.response.status_code if hasattr(e, 'response') and e.response else 500,
                           detail=f"Bland AI API error: {error_message}")

@router.post("/calls", response_model=BlandAICallResponse)
async def send_call(request: BlandAICallRequest):
    """
    Send a call using Bland AI
    """
    # Validate that either task or pathway_id is provided
    if not request.task and not request.pathway_id:
        raise HTTPException(status_code=400, detail="Either task or pathway_id must be provided")

    # Prepare request data
    call_data = request.dict(exclude_none=True)

    # Rename from_number to from if present
    if "from_number" in call_data:
        call_data["from"] = call_data.pop("from_number")

    # Make API call to Bland AI
    try:
        response = call_bland_api("calls", method="POST", data=call_data)
        return BlandAICallResponse(status="success", call_id=response.get("call_id"))
    except HTTPException as e:
        return BlandAICallResponse(status="error", error=e.detail)

@router.get("/calls/{call_id}")
async def get_call_details(call_id: str):
    """
    Get details of a specific call
    """
    return call_bland_api(f"calls/{call_id}")

@router.post("/calls/{call_id}/stop")
async def stop_call(call_id: str):
    """
    Stop an active call
    """
    return call_bland_api(f"calls/{call_id}/stop", method="POST")
