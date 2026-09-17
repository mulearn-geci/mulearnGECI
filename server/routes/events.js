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

const calculatePinAndExpiry = ({ isPinned, pinDuration, pinnedUntil, disappearAfter, expiresAt, date, time }) => {
  const now = new Date();

  // 1. Calculate Pinning
  let finalIsPinned = isPinned === true || isPinned === 'true';
  let finalPinDuration = pinDuration || 'none';
  let finalPinnedUntil = null;

  if (finalPinDuration === 'none') {
    finalIsPinned = false;
    finalPinnedUntil = null;
  } else if (finalPinDuration === 'always') {
    finalIsPinned = true;
    finalPinnedUntil = null;
  } else if (finalPinDuration === '1day') {
    finalIsPinned = true;
    finalPinnedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (finalPinDuration === '1week') {
    finalIsPinned = true;
    finalPinnedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (finalPinDuration === '1month') {
    finalIsPinned = true;
    finalPinnedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (pinnedUntil) {
    finalPinnedUntil = new Date(pinnedUntil);
    finalIsPinned = finalPinnedUntil > now;
  }

  // 2. Calculate Disappear / Expiry
  let finalDisappearAfter = disappearAfter || 'never';
  let finalExpiresAt = null;

  if (finalDisappearAfter === '1day') {
    finalExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (finalDisappearAfter === '1week') {
    finalExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (finalDisappearAfter === '1month') {
    finalExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (finalDisappearAfter === '1day_after_event' || finalDisappearAfter === '1week_after_event') {
    let baseDate = date ? new Date(date) : new Date();
    if (isNaN(baseDate.getTime())) baseDate = new Date();
    if (time && typeof time === 'string') {
      const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const meridiem = match[3] ? match[3].toUpperCase() : null;
        if (meridiem === 'PM' && h < 12) h += 12;
        if (meridiem === 'AM' && h === 12) h = 0;
        baseDate.setHours(h, m, 0, 0);
      }
    }
    const daysToAdd = finalDisappearAfter === '1day_after_event' ? 1 : 7;
    finalExpiresAt = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  } else if (expiresAt) {
    finalExpiresAt = new Date(expiresAt);
  }

  return {
    isPinned: finalIsPinned,
    pinDuration: finalPinDuration,
    pinnedUntil: finalPinnedUntil,
    disappearAfter: finalDisappearAfter,
    expiresAt: finalExpiresAt
  };
};

// @route   GET /api/events
// @desc    Get all events with filtering and pagination
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Auto-unpin expired pinned events dynamically
    try {
      await Event.updateMany(
        { isPinned: true, pinnedUntil: { $ne: null, $lte: new Date() } },
        { $set: { isPinned: false } }
      );
    } catch (e) {
      console.error('Error auto-unpinning expired events:', e.message);
    }

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

    const conditions = [];

    // Filter out expired/disappeared events for public users
    if (req.query.includeExpired !== 'true') {
      conditions.push({
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      });
    }

    if (req.query.search) {
      conditions.push({
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { location: { $regex: req.query.search, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.search, 'i')] } }
        ]
      });
    }

    if (conditions.length > 0) {
      filter.$and = conditions;
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

    // Get events with pagination (Pinned first, then date, then createdAt)
    const events = await Event.find(filter)
      .populate('author', 'name email')
      .sort({ isPinned: -1, date: 1, createdAt: -1 })
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
      isPinned,
      pinDuration,
      pinnedUntil,
      disappearAfter,
      expiresAt,
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

    const pinAndExpiry = calculatePinAndExpiry({
      isPinned,
      pinDuration,
      pinnedUntil,
      disappearAfter,
      expiresAt,
      date,
      time
    });

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
      isPinned: pinAndExpiry.isPinned,
      pinDuration: pinAndExpiry.pinDuration,
      pinnedUntil: pinAndExpiry.pinnedUntil,
      disappearAfter: pinAndExpiry.disappearAfter,
      expiresAt: pinAndExpiry.expiresAt,
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
      isPinned,
      pinDuration,
      pinnedUntil,
      disappearAfter,
      expiresAt,
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

    // Update pin and expiry settings if provided
    if (isPinned !== undefined || pinDuration !== undefined || pinnedUntil !== undefined || disappearAfter !== undefined || expiresAt !== undefined) {
      const pinAndExpiry = calculatePinAndExpiry({
        isPinned: isPinned !== undefined ? isPinned : event.isPinned,
        pinDuration: pinDuration !== undefined ? pinDuration : event.pinDuration,
        pinnedUntil: pinnedUntil !== undefined ? pinnedUntil : event.pinnedUntil,
        disappearAfter: disappearAfter !== undefined ? disappearAfter : event.disappearAfter,
        expiresAt: expiresAt !== undefined ? expiresAt : event.expiresAt,
        date: date || event.date,
        time: time || event.time
      });
      event.isPinned = pinAndExpiry.isPinned;
      event.pinDuration = pinAndExpiry.pinDuration;
      event.pinnedUntil = pinAndExpiry.pinnedUntil;
      event.disappearAfter = pinAndExpiry.disappearAfter;
      event.expiresAt = pinAndExpiry.expiresAt;
    }
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