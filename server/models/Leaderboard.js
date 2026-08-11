const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  muid: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  karma: {
    type: Number,
    default: 0,
    index: true
  },
  rank: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  join_date: {
    type: Date,
    default: Date.now
  },
  last_karma_gained: {
    type: Number,
    default: 0
  },
  graduation_year: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: 'CSE',
    index: true
  },
  is_alumni: {
    type: Boolean,
    default: false
  },
  ig_count: {
    type: Number,
    default: 0
  },
  lc_count: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
