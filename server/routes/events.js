const express = require('express');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');
const { upload, handleUploadError, deleteFile, processUploadedFile } = require('../middleware/upload');
const { validateEvent, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

const parseSafe = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

// @route   GET /api/events
// @desc    Get all events with filtering and pagination
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }
    
    if (req.query.author) {
      filter.author = req.query.author;
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Date filtering
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) {
        filter.date.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.date.$lte = new Date(req.query.dateTo);
      }
    }

    // Get events with pagination
    const events = await Event.find(filter)
      .populate('author', 'name email')
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Event.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: events,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('author', 'name email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Admin only)
router.post('/', adminAuth, upload.single('image'), handleUploadError, validateEvent, async (req, res) => {
  try {
    let image = '';
    let images = [];

    if (req.body.images) {
      const parsed = parseSafe(req.body.images, []);
      images = Array.isArray(parsed) ? parsed.filter(Boolean) : (typeof parsed === 'string' ? [parsed] : []);
    }

    if (req.file) {
      image = processUploadedFile(req.file, 'events');
      if (!images.includes(image)) images.unshift(image);
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim() !== '') {
      image = req.body.image.trim();
      if (!images.includes(image)) images.unshift(image);
    } else if (images.length > 0) {
      image = images[0];
    }

    if (!image && images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one event image is required'
      });
    }

    const {
      title,
      description,
      content,
      date,
      time,
      endTime,
      location,
      venue,
      type,
      category,
      maxAttendees,
      currentAttendees,
      attendees,
      registrationLink,
      registrationDeadline,
      status,
      featured,
      tags,
      organizers,
      speakers,
      requirements,
      agenda,
      price,
      currency,
      imageAlt
    } = req.body;

    const count = currentAttendees !== undefined && !isNaN(parseInt(currentAttendees))
      ? parseInt(currentAttendees)
      : (attendees !== undefined && !isNaN(parseInt(attendees)) ? parseInt(attendees) : 0);

    const event = new Event({
      title: title ? title.trim() : '',
      description: description ? description.trim() : '',
      content: content ? content.trim() : '',
      image,
      images: images.length > 0 ? images : [image],
      imageAlt: imageAlt || title || '',
      date: date ? new Date(date) : new Date(),
      time: time || '10:00 AM',
      endTime: endTime || '',
      location: location ? location.trim() : '',
      venue: parseSafe(venue, undefined),
      type: type || 'workshop',
      category: category || 'technical',
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : 100,
      currentAttendees: count,
      attendees: count,
      registrationLink: registrationLink ? registrationLink.trim() : '',
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
      status: status || 'upcoming',
      featured: featured === true || featured === 'true',
      tags: parseSafe(tags, []),
      organizers: parseSafe(organizers, []),
      speakers: parseSafe(speakers, []),
      requirements: parseSafe(requirements, []),
      agenda: parseSafe(agenda, []),
      price: price ? parseFloat(price) : 0,
      currency: currency || 'INR',
      author: req.user ? (req.user._id || req.user.id) : undefined
    });

    await event.save();
    await event.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating event'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Admin only)
router.put('/:id', adminAuth, validateObjectId, upload.single('image'), handleUploadError, validateEvent, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const {
      title,
      description,
      content,
      date,
      time,
      endTime,
      location,
      venue,
      type,
      category,
      maxAttendees,
      currentAttendees,
      registrationLink,
      registrationDeadline,
      status,
      featured,
      tags,
      organizers,
      speakers,
      requirements,
      agenda,
      price,
      currency,
      imageAlt
    } = req.body;

    // Update fields safely
    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (content !== undefined) event.content = content.trim();
    if (date) event.date = new Date(date);
    if (time) event.time = time.trim();
    if (endTime !== undefined) event.endTime = endTime.trim();
    if (location) event.location = location.trim();
    if (venue !== undefined) event.venue = parseSafe(venue, event.venue);
    if (type) event.type = type.trim();
    if (category) event.category = category.trim();
    if (maxAttendees !== undefined && !isNaN(parseInt(maxAttendees))) event.maxAttendees = parseInt(maxAttendees);
    const updateCount = currentAttendees !== undefined && !isNaN(parseInt(currentAttendees))
      ? parseInt(currentAttendees)
      : (attendees !== undefined && !isNaN(parseInt(attendees)) ? parseInt(attendees) : undefined);
    if (updateCount !== undefined) {
      event.currentAttendees = updateCount;
      event.attendees = updateCount;
    }
    if (registrationLink !== undefined) event.registrationLink = registrationLink.trim();
    if (registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
    if (status) event.status = status;
    if (featured !== undefined) event.featured = featured === true || featured === 'true';
    if (tags !== undefined) event.tags = parseSafe(tags, event.tags);
    if (organizers !== undefined) event.organizers = parseSafe(organizers, event.organizers);
    if (speakers !== undefined) event.speakers = parseSafe(speakers, event.speakers);
    if (requirements !== undefined) event.requirements = parseSafe(requirements, event.requirements);
    if (agenda !== undefined) event.agenda = parseSafe(agenda, event.agenda);
    if (price !== undefined && !isNaN(parseFloat(price))) event.price = parseFloat(price);
    if (currency) event.currency = currency;
    if (imageAlt !== undefined) event.imageAlt = imageAlt;

    // Update image/images if new ones are uploaded or provided
    let updatedImages = undefined;
    if (req.body.images !== undefined) {
      const parsed = parseSafe(req.body.images, []);
      updatedImages = Array.isArray(parsed) ? parsed.filter(Boolean) : (typeof parsed === 'string' ? [parsed] : []);
    }

    if (req.file) {
      const newImg = processUploadedFile(req.file, 'events');
      event.image = newImg;
      if (updatedImages) {
        if (!updatedImages.includes(newImg)) updatedImages.unshift(newImg);
        event.images = updatedImages;
      } else {
        event.images = [newImg, ...(event.images || []).filter(img => img !== event.image)];
      }
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim() !== '') {
      event.image = req.body.image.trim();
      if (updatedImages) {
        event.images = updatedImages;
      } else if (!event.images || event.images.length === 0) {
        event.images = [event.image];
      }
    } else if (updatedImages !== undefined) {
      event.images = updatedImages;
      if (updatedImages.length > 0) {
        event.image = updatedImages[0];
      }
    }

    await event.save();
    await event.populate('author', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating event'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', adminAuth, validateObjectId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete associated image
    if (event.image && event.image.startsWith('/uploads/')) {
      deleteFile(event.image.substring(1)); // Remove leading slash
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
});

// @route   PUT /api/events/:id/register
// @desc    Register for event (increment attendees)
// @access  Public
router.put('/:id/register', validateObjectId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is open
    if (event.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not available for this event'
      });
    }

    // Check if event is full
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check registration deadline
    const now = new Date();
    const deadline = event.registrationDeadline || event.date;
    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    event.currentAttendees += 1;
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      currentAttendees: event.currentAttendees,
      spotsLeft: event.maxAttendees - event.currentAttendees
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering for event'
    });
  }
});

module.exports = router;