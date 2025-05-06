require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// In-memory store for sheets
const inMemorySheets = {};

// Configure CORS
app.use(cors());
app.use(express.json());

// API endpoint to update cells
app.post('/api/update-cells', (req, res) => {
  try {
    const { sheet_id, row, values } = req.body;
    
    if (!sheet_id || row === undefined || !values) {
      return res.status(400).json({ 
        message: 'Missing required fields: sheet_id, row, and values are required' 
      });
    }
    
    // Initialize sheet if it doesn't exist
    if (!inMemorySheets[sheet_id]) {
      inMemorySheets[sheet_id] = {
        id: sheet_id,
        data: []
      };
    }
    
    const sheet = inMemorySheets[sheet_id];
    
    // Update each cell
    Object.entries(values).forEach(([col, value]) => {
      if (value === "none") return;
      
      const colIndex = parseInt(col, 10);
      
      // Find existing cell or create new one
      const existingCellIndex = sheet.data.findIndex(
        cell => cell.r === row && cell.c === colIndex
      );
      
      if (existingCellIndex >= 0) {
        // Update existing cell
        sheet.data[existingCellIndex] = {
          ...sheet.data[existingCellIndex],
          v: value
        };
      } else {
        // Add new cell
        sheet.data.push({
          r: row,
          c: colIndex,
          v: value
        });
      }
      
      console.log(`Updated cell at row ${row}, col ${colIndex} to: ${value}`);
    });
    
    // Return success
    res.json({ 
      message: 'Cells updated successfully',
      updatedSheet: sheet
    });
  } catch (error) {
    console.error('Error updating cells:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API endpoint to get sheet data
app.get('/api/sheets/:sheetId', (req, res) => {
  const { sheetId } = req.params;
  const sheet = inMemorySheets[sheetId];
  
  if (!sheet) {
    return res.status(404).json({ message: 'Sheet not found' });
  }
  
  res.json(sheet);
});

// Start the server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 