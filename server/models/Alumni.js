const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  pastRole: {
    type: String,
    required: [true, 'Past role is required'],
    trim: true
  },
  graduationYear: {
    type: String,
    required: [true, 'Graduation year is required'],
    trim: true
  },
  currentCompany: {
    type: String,
    trim: true,
    default: ''
  },
  currentRole: {
    type: String,
    trim: true,
    default: ''
  },
  domain: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    trim: true,
    default: ''
  },
  github: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  instagram: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alumni', alumniSchema);
