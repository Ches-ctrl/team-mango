from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
from mongo_db import db_manager
import uvicorn
from bson import ObjectId
import json
from blandai import router as bland_router
import os
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Custom JSON encoder for MongoDB ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if hasattr(obj, "isoformat"):  # Handle datetime objects
            return obj.isoformat()
        return super().default(obj)

# Custom middleware to handle BSON ObjectId
class CustomJSONResponse(JSONResponse):
    def render(self, content: Any) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
            cls=MongoJSONEncoder,
        ).encode("utf-8")

# Input model for the new endpoint
class TranscriptRequest(BaseModel):
    transcript: str
    prompt: str

# Initialize FastAPI app
app = FastAPI(title="Hackathon API")

# Add CORS middleware to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include the Bland AI router
app.include_router(bland_router)

#openai.api_key = os.getenv("OPENAIAPI_KEY")
api_key = os.getenv("OPENAIAPI_KEY")
client = openai.OpenAI(api_key=api_key)

# Add a middleware to handle MongoDB ObjectId
@app.middleware("http")
async def add_custom_header(request: Request, call_next):
    response = await call_next(request)
    return response

# Startup and shutdown events
@app.on_event("startup")
async def startup_db_client():
    await db_manager.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db_manager.close()

# Hackathon endpoints
@app.post("/hackathon/")
async def create_hackathon_entry(data: Dict[str, Any]):
    """Create a new hackathon entry"""
    result = await db_manager.create_hackathon_entry(data)
    return CustomJSONResponse(content=result)

@app.put("/hackathon/{entry_id}")
async def update_hackathon_entry(entry_id: str, data: Dict[str, Any]):
    """Update an existing hackathon entry"""
    result = await db_manager.update_hackathon_entry(entry_id, data)
    if not result.get("success", False):
        raise HTTPException(
            status_code=400 if "Invalid" in result.get("message", "") else 404,
            detail=result.get("message", "Error updating entry")
        )
    return CustomJSONResponse(content=result)


@app.delete("/hackathon/{entry_id}")
async def delete_hackathon_entry(entry_id: str):
    """Delete a hackathon entry"""
    result = await db_manager.delete_hackathon_entry(entry_id)
    if not result.get("success", False):
        raise HTTPException(
            status_code=400 if "Invalid" in result.get("message", "") else 404,
            detail=result.get("message", "Error deleting entry")
        )
    return CustomJSONResponse(content=result)

@app.get("/hackathon/{entry_id}")
async def get_hackathon_entry(entry_id: str):
    """Get a single hackathon entry"""
    result = await db_manager.get_hackathon_entry(entry_id)
    if not result:
        raise HTTPException(status_code=404, detail="Entry not found")
    return CustomJSONResponse(content=result)

@app.get("/hackathon/")
async def get_all_hackathon_entries():
    """Get all hackathon entries"""
    results = await db_manager.get_all_hackathon_entries()
    return CustomJSONResponse(content=results)

# Transcript processing endpoint
@app.post("/process-transcript")
async def process_transcript(request: TranscriptRequest):
    """
    Process a phone transcript with a specific prompt using OpenAI API
    and return structured data
    """
    try:
        # Create the OpenAI API request
        response = client.chat.completions.create(
            model= "gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts structured data from phone call transcripts. Return only valid JSON."},
                {"role": "user", "content": f"Here is a phone transcript:\n\n{request.transcript}\n\nExtract the following information based on this prompt: {request.prompt}"}
            ]
        )

        # Parse the JSON response
        structured_data = json.loads(response.choices[0].message.content)
        print(structured_data)
        # Store the result in the database
        result = await db_manager.create_transcript_result({
            "transcript": request.transcript,
            "prompt": request.prompt,
            "result": structured_data,
            "created_at": datetime.utcnow()
        })

        # Return both the structured data and the database entry ID
        return CustomJSONResponse(content={
            "success": True,
            "data": structured_data,
            "result_id": result.get("id")
        })

    except openai.OpenAIError as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse OpenAI response as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing transcript: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
