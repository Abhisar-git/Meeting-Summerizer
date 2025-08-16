const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  transcriptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transcript',
    required: false
  },
  originalTranscript: {
    type: String,
    required: true
  },
  customPrompt: {
    type: String,
    required: true
  },
  aiSummary: {
    type: String,
    required: true
  },
  editedSummary: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Summary', summarySchema);
