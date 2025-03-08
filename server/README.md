# Team Mango Backend Server

This is the backend server for the Team Mango spreadsheet application. It provides API endpoints and WebSocket support for real-time collaboration on spreadsheets.

## Features

- REST API for CRUD operations on spreadsheets
- WebSocket support for real-time collaborative editing
- MongoDB integration for data persistence
- Version history tracking for spreadsheets

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure MongoDB:
   - For local development, you can use a local MongoDB instance (mongodb://localhost:27017/team_mango)
   - For production, create a MongoDB Atlas account and use your connection string

3. Create a `.env` file in the server directory with the following content:
   ```
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/team_mango
   # For production, use your MongoDB Atlas connection string:
   # MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/team_mango?retryWrites=true&w=majority

   # Server Configuration
   PORT=5001
   ```

## MongoDB Credentials

For local development, no credentials are required if MongoDB is running with default settings.

For production deployment using MongoDB Atlas:

1. Create a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient)
3. Create a database user with read/write permissions
4. Get your connection string from the Atlas dashboard
5. Replace `<username>`, `<password>`, and `<cluster>` in the connection string with your actual credentials
6. Update the `.env` file with your connection string

## Running the Server

For development:
```
npm run dev
```

For production:
```
npm start
```

## API Endpoints

- `GET /api/sheets/:sheetId` - Get a spreadsheet by ID
- `POST /api/sheets` - Create a new spreadsheet
- `PUT /api/sheets/:sheetId` - Update a spreadsheet
- `GET /api/sheets/:sheetId/history` - Get the version history of a spreadsheet

## WebSocket Events

- `join_sheet` - Join a spreadsheet room
- `sheet_update` - Send an update to a spreadsheet
- `sheet_updated` - Receive updates from other clients 