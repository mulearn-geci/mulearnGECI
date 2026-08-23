const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  content: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  imageAlt: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  endTime: {
    type: String
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  venue: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  type: {
    type: String,
    enum: ['workshop', 'seminar', 'competition', 'conference', 'bootcamp', 'hackathon', 'meetup', 'webinar'],
    required: [true, 'Event type is required']
  },
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'academic', 'social', 'career'],
    default: 'technical'
  },
  maxAttendees: {
    type: Number,
    required: [true, 'Maximum attendees is required'],
    min: [1, 'Maximum attendees must be at least 1']
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: 0
  },
  attendees: {
    type: Number,
    default: 0,
    min: 0
  },
  registrationLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Registration link must be a valid URL'
    }
  },
  registrationDeadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  organizers: [{
    name: String,
    email: String,
    phone: String,
    role: String
  }],
  speakers: [{
    name: String,
    bio: String,
    image: String,
    designation: String,
    company: String,
    social: {
      linkedin: String,
      twitter: String,
      website: String
    }
  }],
  requirements: [String],
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }],
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Create slug from title
eventSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  
  // Auto-update status based on date + time
  const now = new Date();
  let eventDateTime = new Date(this.date);
  if (this.time) {
    const [hours, minutes] = this.time.split(':').map(Number);
    eventDateTime.setHours(hours || 0, minutes || 0, 0, 0);
  }

  if (eventDateTime < now && this.status === 'upcoming') {
    this.status = 'completed';
  }
  
  next();
});

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const deadline = this.registrationDeadline || this.date;
  return this.status === 'upcoming' && now < deadline && this.currentAttendees < this.maxAttendees;
});

// Index for better performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ author: 1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ type: 1, category: 1 });
eventSchema.index({ featured: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);