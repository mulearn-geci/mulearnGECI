const express = require('express');
const Contact = require('../models/Contact');
const { adminAuth } = require('../middleware/auth');
const { validateContact, validateObjectId, validatePagination } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 contact form submissions per windowMs
  validate: { trustProxy: false },
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again later.'
  }
});

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', contactLimiter, validateContact, async (req, res) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;

    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      category: category || 'general',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        submittedAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting contact form'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact submissions (Admin only)
// @access  Private (Admin only)
router.get('/', adminAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .populate('response.respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Contact.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get status counts
    const statusCounts = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalContacts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact submission
// @access  Private (Admin only)
router.get('/:id', adminAuth, validateObjectId, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('response.respondedBy', 'name email');
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Mark as read if it's new
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact'
    });
  }
});

// @route   PUT /api/contact/:id/respond
// @desc    Respond to contact submission
// @access  Private (Admin only)
router.put('/:id/respond', adminAuth, validateObjectId, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    contact.response = {
      message: message.trim(),
      respondedBy: req.user.id,
      respondedAt: new Date()
    };
    contact.status = 'replied';

    await contact.save();
    await contact.populate('response.respondedBy', 'name email');

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: contact
    });
  } catch (error) {
    console.error('Respond to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to contact'
    });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact status
// @access  Private (Admin only)
router.put('/:id/status', adminAuth, validateObjectId, async (req, res) => {
  try {
    const { status, priority } = req.body;

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    if (status) {
      const validStatuses = ['new', 'read', 'replied', 'resolved', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      contact.status = status;
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority'
        });
      }
      contact.priority = priority;
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission
// @access  Private (Admin only)
router.delete('/:id', adminAuth, validateObjectId, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact'
    });
  }
});

module.exports = router;