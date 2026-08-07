const mongoose = require('mongoose');

const ExecomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position/Role is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['execom', 'ig_lead'],
    default: 'execom'
  },
  domain: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
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
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
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

module.exports = mongoose.model('Execom', ExecomSchema);
