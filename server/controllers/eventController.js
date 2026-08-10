const Event = require('../models/Event');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHandler');
const { deleteFile, processUploadedFile } = require('../middleware/upload');
const logger = require('../utils/logger');

const eventController = {
  // Get all events with filtering and pagination
  getAllEvents: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter = {};
      
      if (req.query.status) filter.status = req.query.status;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.category) filter.category = req.query.category;
      if (req.query.featured) filter.featured = req.query.featured === 'true';
      if (req.query.author) filter.author = req.query.author;
      
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
        if (req.query.dateFrom) filter.date.$gte = new Date(req.query.dateFrom);
        if (req.query.dateTo) filter.date.$lte = new Date(req.query.dateTo);
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

      return sendSuccess(res, 'Events retrieved successfully', events, {
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      logger.error('Get events error', { error: error.message });
      return sendError(res, 500, 'Server error while fetching events');
    }
  },

  // Get single event by ID
  getEventById: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).populate('author', 'name email');
      
      if (!event) {
        return sendError(res, 404, 'Event not found');
      }

      return sendSuccess(res, 'Event retrieved successfully', event);
    } catch (error) {
      logger.error('Get event error', { error: error.message });
      return sendError(res, 500, 'Server error while fetching event');
    }
  },

  // Create new event
  createEvent: async (req, res) => {
    try {
      if (!req.file) {
        return sendError(res, 400, 'Image is required');
      }

      const {
        title, description, content, date, time, endTime, location,
        venue, type, category, maxAttendees, registrationLink,
        registrationDeadline, status, featured, tags, organizers,
        speakers, requirements, agenda, price, currency, imageAlt
      } = req.body;

      const event = new Event({
        title,
        description,
        content,
        image: processUploadedFile(req.file, 'events'),
        imageAlt: imageAlt || title,
        date: new Date(date),
        time,
        endTime,
        location,
        venue: venue ? JSON.parse(venue) : undefined,
        type,
        category: category || 'technical',
        maxAttendees: parseInt(maxAttendees),
        registrationLink,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        status: status || 'upcoming',
        featured: featured === 'true',
        tags: tags ? JSON.parse(tags) : [],
        organizers: organizers ? JSON.parse(organizers) : [],
        speakers: speakers ? JSON.parse(speakers) : [],
        requirements: requirements ? JSON.parse(requirements) : [],
        agenda: agenda ? JSON.parse(agenda) : [],
        price: price ? parseFloat(price) : 0,
        currency: currency || 'INR',
        author: req.user.id
      });

      await event.save();
      await event.populate('author', 'name email');

      logger.info('Event created', { eventId: event._id, title: event.title });

      return sendCreated(res, 'Event created successfully', event);
    } catch (error) {
      // Delete uploaded file if event creation fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      logger.error('Create event error', { error: error.message });
      return sendError(res, 500, 'Server error while creating event');
    }
  },

  // Update event
  updateEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return sendError(res, 404, 'Event not found');
      }

      const {
        title, description, content, date, time, endTime, location,
        venue, type, category, maxAttendees, currentAttendees,
        registrationLink, registrationDeadline, status, featured,
        tags, organizers, speakers, requirements, agenda,
        price, currency, imageAlt
      } = req.body;

      // Update fields
      if (title) event.title = title;
      if (description) event.description = description;
      if (content) event.content = content;
      if (date) event.date = new Date(date);
      if (time) event.time = time;
      if (endTime) event.endTime = endTime;
      if (location) event.location = location;
      if (venue) event.venue = JSON.parse(venue);
      if (type) event.type = type;
      if (category) event.category = category;
      if (maxAttendees) event.maxAttendees = parseInt(maxAttendees);
      if (currentAttendees !== undefined) event.currentAttendees = parseInt(currentAttendees);
      if (registrationLink) event.registrationLink = registrationLink;
      if (registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
      if (status) event.status = status;
      if (featured !== undefined) event.featured = featured === 'true';
      if (tags) event.tags = JSON.parse(tags);
      if (organizers) event.organizers = JSON.parse(organizers);
      if (speakers) event.speakers = JSON.parse(speakers);
      if (requirements) event.requirements = JSON.parse(requirements);
      if (agenda) event.agenda = JSON.parse(agenda);
      if (price !== undefined) event.price = parseFloat(price);
      if (currency) event.currency = currency;
      if (imageAlt) event.imageAlt = imageAlt;

      // Update image if new one is uploaded
      if (req.file) {
        // Delete old image
        if (event.image) {
          deleteFile(event.image);
        }
        event.image = processUploadedFile(req.file, 'events');
      }

      await event.save();
      await event.populate('author', 'name email');

      logger.info('Event updated', { eventId: event._id, title: event.title });

      return sendSuccess(res, 'Event updated successfully', event);
    } catch (error) {
      // Delete uploaded file if update fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      logger.error('Update event error', { error: error.message });
      return sendError(res, 500, 'Server error while updating event');
    }
  },

  // Delete event
  deleteEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return sendError(res, 404, 'Event not found');
      }

      // Delete associated image
      if (event.image && event.image.startsWith('/uploads/')) {
        deleteFile(event.image.substring(1));
      }

      await Event.findByIdAndDelete(req.params.id);

      logger.info('Event deleted', { eventId: req.params.id });

      return sendSuccess(res, 'Event deleted successfully');
    } catch (error) {
      logger.error('Delete event error', { error: error.message });
      return sendError(res, 500, 'Server error while deleting event');
    }
  },

  // Register for event
  registerForEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return sendError(res, 404, 'Event not found');
      }

      // Check if registration is open
      if (event.status !== 'upcoming') {
        return sendError(res, 400, 'Registration is not available for this event');
      }

      // Check if event is full
      if (event.currentAttendees >= event.maxAttendees) {
        return sendError(res, 400, 'Event is full');
      }

      // Check registration deadline
      const now = new Date();
      const deadline = event.registrationDeadline || event.date;
      if (now > deadline) {
        return sendError(res, 400, 'Registration deadline has passed');
      }

      event.currentAttendees += 1;
      await event.save();

      logger.info('Event registration', { eventId: event._id, newTotal: event.currentAttendees });

      return sendSuccess(res, 'Successfully registered for event', {
        currentAttendees: event.currentAttendees,
        spotsLeft: event.maxAttendees - event.currentAttendees
      });
    } catch (error) {
      logger.error('Register for event error', { error: error.message });
      return sendError(res, 500, 'Server error while registering for event');
    }
  }
};

module.exports = eventController;