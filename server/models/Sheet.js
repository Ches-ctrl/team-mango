const mongoose = require('mongoose');

const SheetSchema = new mongoose.Schema({
  sheetId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: 'Sheet1'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  context: {
    type: String,
    default: ''
  },
  history: [{
    data: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sheet', SheetSchema); 