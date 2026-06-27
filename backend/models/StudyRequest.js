const mongoose = require('mongoose');

const StudyRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Ensure uniqueness of requests between sender and receiver
StudyRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('StudyRequest', StudyRequestSchema);
