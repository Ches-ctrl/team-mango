const mongoose = require('mongoose');

const SheetSchema = new mongoose.Schema({
  sheetId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    default: 'Sheet1'
  },
  data: {
    type: Object,
    required: true
  },
  context: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    data: Object,
    timestamp: {
      type: Date,
      default: Date.now
    },
    version: Number
  }]
});

// Update the updatedAt field and increment version before saving
SheetSchema.pre('save', function(next) {
  if (this.isModified('data')) {
    // Add current data to history before updating
    this.history.push({
      data: this.data,
      timestamp: new Date(),
      version: this.version
    });
    
    // Update version and timestamp
    this.version += 1;
    this.updatedAt = new Date();
  }
  next();
});

// Explicitly set the collection name to 'sheets'
module.exports = mongoose.model('Sheet', SheetSchema, 'sheets'); 