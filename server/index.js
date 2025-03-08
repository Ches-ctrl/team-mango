require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Sheet = require('./models/Sheet');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join a sheet room
  socket.on('join_sheet', (sheetId) => {
    socket.join(sheetId);
    console.log(`Client ${socket.id} joined sheet: ${sheetId}`);
  });
  
  // Handle sheet updates
  socket.on('sheet_update', async (data) => {
    try {
      // Save to database
      await updateSheetInDb(data);
      
      // Broadcast to other users in the same room
      socket.to(data.sheetId).emit('sheet_updated', data);
      
      console.log(`Sheet ${data.sheetId} updated by ${socket.id}`);
    } catch (error) {
      console.error('Error updating sheet:', error);
      socket.emit('error', { message: 'Failed to update sheet' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Utility function to update sheet in database
async function updateSheetInDb(data) {
  const { sheetId, sheetData, context } = data;
  
  try {
    // Find and update the sheet, or create if it doesn't exist
    const sheet = await Sheet.findOneAndUpdate(
      { sheetId },
      { 
        data: sheetData,
        context: context || '',
        updatedAt: new Date()
      },
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    return sheet;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// API Routes
app.get('/api/sheets/:sheetId', async (req, res) => {
  try {
    const { sheetId } = req.params;
    const sheet = await Sheet.findOne({ sheetId });
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    res.json(sheet);
  } catch (error) {
    console.error('Error fetching sheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/sheets', async (req, res) => {
  try {
    const { sheetId, data, context } = req.body;
    
    if (!sheetId || !data) {
      return res.status(400).json({ message: 'Sheet ID and data are required' });
    }
    
    // Check if sheet already exists
    const existingSheet = await Sheet.findOne({ sheetId });
    
    if (existingSheet) {
      return res.status(409).json({ message: 'Sheet with this ID already exists' });
    }
    
    // Create new sheet
    const newSheet = new Sheet({
      sheetId,
      name: 'Sheet1',
      data,
      context: context || '',
    });
    
    await newSheet.save();
    
    res.status(201).json(newSheet);
  } catch (error) {
    console.error('Error creating sheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/sheets/:sheetId', async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { data, context } = req.body;
    
    if (!data) {
      return res.status(400).json({ message: 'Sheet data is required' });
    }
    
    const updatedSheet = await updateSheetInDb({ sheetId, sheetData: data, context });
    
    res.json(updatedSheet);
  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/sheets/:sheetId/history', async (req, res) => {
  try {
    const { sheetId } = req.params;
    const sheet = await Sheet.findOne({ sheetId });
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    res.json(sheet.history);
  } catch (error) {
    console.error('Error fetching sheet history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 