const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  fileSize: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Transcript', transcriptSchema);
