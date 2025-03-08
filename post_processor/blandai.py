import os
import json
import requests
import datetime
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

class BlandAIAnalyzeRequest(BaseModel):
    goal: str = Field(..., description="The goal for analyzing the call")
    questions: List[List[str]] = Field(..., description="List of questions for analyzing the call")

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

def save_call_data(call_response: Dict[str, Any], call_request: Dict[str, Any]) -> None:
    """
    Save call data to the JSON file
    """
    file_path = os.path.join(os.path.dirname(__file__), "call_data.json")

    # Load existing data if file exists and has content
    existing_data = {}
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        try:
            with open(file_path, "r") as f:
                existing_data = json.load(f)
        except json.JSONDecodeError:
            # If file exists but is not valid JSON, start with empty dict
            existing_data = {}

    # Combine request and response data
    call_info = {
        "request": call_request,
        "response": call_response,
        "status": call_response.get("status"),
        "error": call_response.get("error"),
        "timestamp": datetime.datetime.now().isoformat()
    }

    # Add to existing data with call_id as key, or use timestamp if no call_id
    call_id = call_response.get("call_id")
    if call_id:
        existing_data[call_id] = call_info
    else:
        # For error cases or when no call_id is returned, use timestamp as key
        timestamp_key = f"error_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        existing_data[timestamp_key] = call_info

    # Save back to file
    with open(file_path, "w") as f:
        json.dump(existing_data, f, indent=2)

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
        call_response = {"status": "success", "call_id": response.get("call_id")}

        # Save call data to JSON file
        save_call_data(call_response, call_data)

        return BlandAICallResponse(**call_response)
    except HTTPException as e:
        error_response = {"status": "error", "error": e.detail}

        # Save failed call data to JSON file
        save_call_data(error_response, call_data)

        return BlandAICallResponse(**error_response)

@router.get("/calls/{call_id}")
async def get_call_details(call_id: str):
    """
    Get details of a specific call

    First checks the local JSON file for call data, then falls back to the Bland AI API
    """
    # Check if we have the call data in our local file
    file_path = os.path.join(os.path.dirname(__file__), "call_data.json")
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        try:
            with open(file_path, "r") as f:
                call_data = json.load(f)
                if call_id in call_data:
                    # Return combined data from our local storage
                    return {
                        "local_data": call_data[call_id],
                        "api_data": call_bland_api(f"calls/{call_id}")
                    }
        except (json.JSONDecodeError, FileNotFoundError):
            # If there's an issue with the file, continue to API call
            pass

    # If we don't have local data, just return the API data
    return call_bland_api(f"calls/{call_id}")

@router.post("/calls/{call_id}/stop")
async def stop_call(call_id: str):
    """
    Stop an active call and update local call data
    """
    # Call the Bland AI API to stop the call
    response = call_bland_api(f"calls/{call_id}/stop", method="POST")

    # Update our local call data to reflect that the call was stopped
    file_path = os.path.join(os.path.dirname(__file__), "call_data.json")
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        try:
            with open(file_path, "r") as f:
                call_data = json.load(f)

            if call_id in call_data:
                # Update the call status to indicate it was stopped
                call_data[call_id]["status"] = "stopped"
                call_data[call_id]["stop_response"] = response

                # Save the updated data back to the file
                with open(file_path, "w") as f:
                    json.dump(call_data, f, indent=2)
        except (json.JSONDecodeError, FileNotFoundError):
            # If there's an issue with the file, just continue
            pass

    return response

@router.get("/calls")
async def get_all_calls():
    """
    Get all call data from the local JSON file
    """
    file_path = os.path.join(os.path.dirname(__file__), "call_data.json")
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        try:
            with open(file_path, "r") as f:
                call_data = json.load(f)
            return {"calls": call_data, "count": len(call_data)}
        except (json.JSONDecodeError, FileNotFoundError):
            return {"calls": {}, "count": 0, "error": "Error reading call data file"}
    else:
        return {"calls": {}, "count": 0, "message": "No call data available"}

@router.post("/calls/analyze")
async def analyze_call(request: BlandAIAnalyzeRequest):
    """
    Analyze the most recent call using Bland AI's analyze API
    """
    # Get the most recent call from the JSON file
    file_path = os.path.join(os.path.dirname(__file__), "call_data.json")
    if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        raise HTTPException(status_code=404, detail="No call data available")

    try:
        with open(file_path, "r") as f:
            call_data = json.load(f)

        if not call_data:
            raise HTTPException(status_code=404, detail="No call data available")

        # Find the most recent call by timestamp
        most_recent_call = None
        most_recent_timestamp = None

        for call_id, call_info in call_data.items():
            # Skip entries without a call_id (error entries)
            if call_id.startswith("error_"):
                continue

            timestamp = call_info.get("timestamp")
            if timestamp and (most_recent_timestamp is None or timestamp > most_recent_timestamp):
                most_recent_timestamp = timestamp
                most_recent_call = call_info
                most_recent_call_id = call_id

        if not most_recent_call or not most_recent_call_id:
            raise HTTPException(status_code=404, detail="No valid call found")

        # Prepare the analyze request
        analyze_data = {
            "goal": request.goal,
            "questions": request.questions
        }

        # Make API call to Bland AI analyze endpoint
        try:
            response = call_bland_api(f"calls/{most_recent_call_id}/analyze", method="POST", data=analyze_data)

            # Update the call data with analysis results
            call_data[most_recent_call_id]["analysis"] = {
                "request": analyze_data,
                "response": response,
                "timestamp": datetime.datetime.now().isoformat()
            }

            # Save the updated data back to the file
            with open(file_path, "w") as f:
                json.dump(call_data, f, indent=2)

            return {
                "call_id": most_recent_call_id,
                "analysis": response
            }

        except HTTPException as e:
            # If the API call fails, return the error
            return {
                "call_id": most_recent_call_id,
                "status": "error",
                "error": e.detail
            }

    except (json.JSONDecodeError, FileNotFoundError):
        raise HTTPException(status_code=500, detail="Error reading call data file")
