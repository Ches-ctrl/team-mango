#!/bin/bash
# Setup script for Team Mango server

# Install dependencies
echo "Installing server dependencies..."
npm install

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed. Please install MongoDB before running the server."
    echo "For macOS: brew install mongodb-community"
    echo "For Ubuntu: sudo apt install -y mongodb"
    echo "For Windows: Download and install from https://www.mongodb.com/try/download/community"
    exit 1
fi

# Create data directory for MongoDB if it doesn't exist
mkdir -p data/db

echo "Setup complete! You can now run the server with 'npm run dev'"
echo "To use MongoDB locally, make sure the MongoDB service is running."
echo "For macOS: brew services start mongodb-community"
echo "For Ubuntu: sudo systemctl start mongodb" 