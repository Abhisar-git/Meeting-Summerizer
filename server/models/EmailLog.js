const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  summaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Summary',
    required: true
  },
  recipients: [{
    type: String,
    required: true
  }],
  subject: {
    type: String,
    required: true
  },
  emailContent: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    required: true
  },
  errorMessage: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
