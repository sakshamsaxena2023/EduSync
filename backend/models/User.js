const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  // Profile metrics for matchmaking & K-Means
  leetcodeUsername: {
    type: String,
    default: '',
  },
  codeforcesUsername: {
    type: String,
    default: '',
  },
  techStack: {
    type: [String],
    default: [],
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  availability: {
    type: Number, // hours per week
    default: 5,
  },
  preferredSchedule: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    default: 'evening',
  },
  learningGoals: {
    type: [String],
    default: [],
  },
  clusterId: {
    type: Number,
    default: -1, // -1 means unclustered
  },
  connectedPeers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
