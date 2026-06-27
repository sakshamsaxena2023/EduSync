const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  challengerGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true,
  },
  targetGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true,
  },
  challengeType: {
    type: String,
    enum: ['Coding Sprint', 'Focus Hours', 'Leetcode Run'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending',
  },
  pointsBounty: {
    type: Number,
    default: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  winnerGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
