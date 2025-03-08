import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5001/api';
let socket;

// Initialize Socket.io connection
export const initSocket = (sheetId, onUpdate) => {
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }

  // Create new connection
  socket = io('http://localhost:5001');
  
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    
    // Join specific sheet room
    if (sheetId) {
      socket.emit('join_sheet', sheetId);
    }
  });
  
  // Listen for sheet updates from other clients
  socket.on('sheet_updated', (data) => {
    console.log('Received sheet update:', data);
    if (onUpdate && typeof onUpdate === 'function') {
      onUpdate(data);
    }
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  return socket;
};

// Close socket connection
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Send sheet update via socket
export const emitSheetUpdate = (sheetId, sheetData, context) => {
  if (socket && socket.connected) {
    socket.emit('sheet_update', {
      sheetId,
      sheetData,
      context
    });
    return true;
  }
  return false;
};

// API methods
export const getSheet = async (sheetId) => {
  try {
    const response = await axios.get(`${API_URL}/sheets/${sheetId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sheet:', error);
    throw error;
  }
};

export const createSheet = async (sheetId, data, context) => {
  try {
    const response = await axios.post(`${API_URL}/sheets`, {
      sheetId,
      data,
      context
    });
    return response.data;
  } catch (error) {
    console.error('Error creating sheet:', error);
    throw error;
  }
};

export const updateSheet = async (sheetId, data, context) => {
  try {
    const response = await axios.put(`${API_URL}/sheets/${sheetId}`, {
      data,
      context
    });
    return response.data;
  } catch (error) {
    console.error('Error updating sheet:', error);
    throw error;
  }
};

export const getSheetHistory = async (sheetId) => {
  try {
    const response = await axios.get(`${API_URL}/sheets/${sheetId}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sheet history:', error);
    throw error;
  }
}; 