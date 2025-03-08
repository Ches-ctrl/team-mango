# Post Processor API

This is a FastAPI-based server that provides endpoints for hackathon data management and Bland AI phone call integration.

## Setup

### Prerequisites

- Python 3.7+
- MongoDB (local or remote)

### Installation

1. Clone the repository
2. Navigate to the `post_processor` directory
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on the provided `env_example`:

```bash
cp env_example .env
```

5. Update the `.env` file with your credentials:

```
MONGODB_URL=mongodb://localhost:27017/hackathon
OPENAIAPI_KEY=your_openai_api_key
BLAND_API_KEY=your_bland_ai_api_key
```

## Running the Server

Start the server with:

```bash
uvicorn main:app --reload
```

The server will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### Hackathon Endpoints

#### Create a Hackathon Entry
```
POST /hackathon/
```
Request body: JSON object with hackathon entry data

#### Update a Hackathon Entry
```
PUT /hackathon/{entry_id}
```
Path parameter: `entry_id` - ID of the entry to update
Request body: JSON object with updated data

#### Delete a Hackathon Entry
```
DELETE /hackathon/{entry_id}
```
Path parameter: `entry_id` - ID of the entry to delete

#### Get a Hackathon Entry
```
GET /hackathon/{entry_id}
```
Path parameter: `entry_id` - ID of the entry to retrieve

#### Get All Hackathon Entries
```
GET /hackathon/
```
Returns all hackathon entries

### Bland AI Endpoints

#### Send a Phone Call
```
POST /bland/calls
```
Request body example:
```json
{
  "phone_number": "+12223334444",
  "task": "Call this person and ask about their day. Be friendly and conversational."
}
```

Advanced options:
```json
{
  "phone_number": "+12223334444",
  "task": "Call this person and schedule an appointment for next week.",
  "voice": "Josh",
  "background_track": "office",
  "wait_for_greeting": true,
  "voicemail_message": "Hi, this is a message from Company X. Please call us back at 555-1234.",
  "max_duration": 5,
  "record": true,
  "from_number": "+15556667777",
  "webhook": "https://your-webhook-url.com/callback",
  "metadata": {
    "campaign_id": "1234",
    "user_id": "5678"
  }
}
```

Response:
```json
{
  "status": "success",
  "call_id": "9d404c1b-6a23-4426-953a-a52c392ff8f1"
}
```

#### Get Call Details
```
GET /bland/calls/{call_id}
```
Path parameter: `call_id` - ID of the call to retrieve

Returns detailed information about the call, including transcripts if available.

#### Stop an Active Call
```
POST /bland/calls/{call_id}/stop
```
Path parameter: `call_id` - ID of the call to stop

Immediately stops an active call.

## Examples

### Creating a Hackathon Entry

```bash
curl -X 'POST' \
  'http://localhost:8000/hackathon/' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "AI Hackathon 2023",
  "date": "2023-10-15",
  "participants": ["John Doe", "Jane Smith"],
  "description": "A hackathon focused on AI applications"
}'
```

### Sending a Bland AI Call

```bash
curl -X 'POST' \
  'http://localhost:8000/bland/calls' \
  -H 'Content-Type: application/json' \
  -d '{
  "phone_number": "+12223334444",
  "task": "You are a friendly assistant calling to confirm an appointment for tomorrow at 2pm. Ask if they can still make it, and if not, offer to reschedule.",
  "voice": "Josh",
  "wait_for_greeting": true
}'
```

### Getting Call Details

```bash
curl -X 'GET' \
  'http://localhost:8000/bland/calls/9d404c1b-6a23-4426-953a-a52c392ff8f1'
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400: Bad Request - Invalid input data
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side error

Error responses include a message explaining the error.
