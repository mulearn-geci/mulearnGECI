const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [250, 'Title cannot exceed 250 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    trim: true,
    default: 'event'
  },
  eventDate: {
    type: Date
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  imageAlt: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  },
  registrationLink: {
    type: String,
    trim: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  slug: {
    type: String
  }
}, {
  timestamps: true
});

// Create slug from title
postSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = (this.title || 'post')
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for better performance
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ slug: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ eventDate: -1 });

module.exports = mongoose.model('Post', postSchema);