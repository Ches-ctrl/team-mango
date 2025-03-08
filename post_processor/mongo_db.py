from motor.motor_asyncio import AsyncIOMotorClient
from typing import Dict, List, Optional
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId
import os

load_dotenv()

class HackathonDBManager:
    def __init__(self):
        self.client = None
        self.db = None
        
    async def connect(self):
        mongodb_url = os.getenv("MONGODB_URL")
        if not mongodb_url:
            raise ValueError("MongoDB connection URL not found in environment variables")
        self.client = AsyncIOMotorClient(
            mongodb_url,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000
        )
        self.db = self.client.hackathon_db  # Using a separate database
        
    async def close(self):
        if self.client:
            self.client.close()

    # Helper method to handle ObjectId conversion
    def _process_document(self, document):
        if document is None:
            return None
        
        # Convert ObjectId to string
        if "_id" in document:
            document["id"] = str(document["_id"])
            del document["_id"]
        
        return document

    async def create_hackathon_entry(self, data: Dict) -> dict:
        """Create a new entry in hackathon collection"""
        # Extract id from data if it exists, otherwise let MongoDB generate one
        document_id = data.pop("id", None)
        
        # Create the document with data at the top level
        document = {
            **data,  # Spread the data directly into the top level
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # If an ID was provided in the data, use it
        if document_id:
            document["_id"] = document_id
        
        result = await self.db.hackathon.insert_one(document)
        return {"id": str(result.inserted_id), "success": True, "message": "Entry created successfully"}

    async def update_hackathon_entry(self, entry_id: str, data: Dict) -> dict:
        """Update an existing entry in hackathon collection"""
        try:
            result = await self.db.hackathon.update_one(
                {"_id": ObjectId(entry_id)},
                {
                    "$set": {
                        "data": data,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            if result.modified_count == 0:
                return {"success": False, "message": "Entry not found"}
            return {"success": True, "message": "Entry updated successfully"}
        except Exception:
            return {"success": False, "message": "Invalid ID format"}

    async def delete_hackathon_entry(self, entry_id: str) -> dict:
        """Delete an entry from hackathon collection"""
        try:
            result = await self.db.hackathon.delete_one({"_id": ObjectId(entry_id)})
            if result.deleted_count == 0:
                return {"success": False, "message": "Entry not found"}
            return {"success": True, "message": "Entry deleted successfully"}
        except Exception:
            return {"success": False, "message": "Invalid ID format"}

    async def get_hackathon_entry(self, entry_id: str) -> Optional[dict]:
        """Get a single entry from hackathon collection"""
        try:
            result = await self.db.hackathon.find_one({"_id": ObjectId(entry_id)})
            return self._process_document(result)
        except Exception:
            return None

    async def get_all_hackathon_entries(self) -> List[dict]:
        """Get all entries from hackathon collection"""
        entries = []
        async for entry in self.db.hackathon.find():
            entries.append(self._process_document(entry))
        return entries

    async def create_transcript_result(self, data):
        """Create a new transcript processing result"""
        # Add timestamp if not present
        if "created_at" not in data:
            data["created_at"] = datetime.datetime.utcnow()
            
        result = await self.db.transcript_results.insert_one(data)
        return {
            "success": True,
            "id": str(result.inserted_id),
            "message": "Transcript result created successfully"
        }
    
    async def get_transcript_result(self, result_id):
        """Get a transcript result by ID"""
        try:
            result_id_obj = ObjectId(result_id)
        except:
            return None
            
        result = await self.db.transcript_results.find_one({"_id": result_id_obj})
        return result
    
    async def get_transcript_results_by_query(self, query=None, limit=100, skip=0):
        """Get transcript results with optional filtering"""
        if query is None:
            query = {}
            
        cursor = self.db.transcript_results.find(query).sort("created_at", -1).skip(skip).limit(limit)
        results = await cursor.to_list(length=limit)
        return results
# Create a single instance to be imported
db_manager = HackathonDBManager()