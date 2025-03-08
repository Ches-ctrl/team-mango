from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Dict, List, Any
from mongo_db import db_manager
import uvicorn
from bson import ObjectId
import json
from blandai import router as bland_router

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

# Initialize FastAPI app
app = FastAPI(title="Hackathon API")

# Include the Bland AI router
app.include_router(bland_router)

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
