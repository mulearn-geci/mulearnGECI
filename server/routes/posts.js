const express = require('express');
const Post = require('../models/Post');
const { auth, adminAuth } = require('../middleware/auth');
const { upload, handleUploadError, deleteFile, processUploadedFile } = require('../middleware/upload');
const { validatePost, validateObjectId, validatePagination } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts with filtering and pagination
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    
    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get posts sorted by eventDate / createdAt descending
    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .sort({ eventDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    logger.error('Get posts error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views safely
    post.views = (post.views || 0) + 1;
    await post.save().catch(() => {});

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error('Get post error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private (Admin only)
router.post('/', adminAuth, upload.single('image'), handleUploadError, validatePost, async (req, res) => {
  try {
    let image = '';
    
    // Support file upload or base64 Data URL sent in body
    if (req.file) {
      image = processUploadedFile(req.file, 'posts');
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim() !== '') {
      image = req.body.image.trim();
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Post image is required'
      });
    }

    const {
      title,
      description,
      content,
      category,
      eventDate,
      location,
      tags,
      status,
      featured,
      registrationLink,
      imageAlt
    } = req.body;

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : [tags]);
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      }
    }

    const post = new Post({
      title: title ? title.trim() : '',
      description: description ? description.trim() : '',
      content: content ? content.trim() : '',
      category: category ? category.trim() : 'event',
      eventDate: eventDate ? new Date(eventDate) : undefined,
      location: location ? location.trim() : '',
      image,
      imageAlt: imageAlt || title || '',
      tags: parsedTags,
      status: status || 'published',
      featured: featured === true || featured === 'true',
      registrationLink: registrationLink ? registrationLink.trim() : '',
      author: req.user ? req.user._id || req.user.id : undefined
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    logger.error('Create post error', { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (Admin only)
router.put('/:id', adminAuth, validateObjectId, upload.single('image'), handleUploadError, validatePost, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const {
      title,
      description,
      content,
      category,
      eventDate,
      location,
      tags,
      status,
      featured,
      registrationLink,
      imageAlt,
      image: bodyImage,
      removeImage
    } = req.body;

    // Update fields
    if (title !== undefined) post.title = title.trim();
    if (description !== undefined) post.description = description.trim();
    if (content !== undefined) post.content = content.trim();
    if (category !== undefined) post.category = category.trim();
    if (eventDate !== undefined) post.eventDate = eventDate ? new Date(eventDate) : undefined;
    if (location !== undefined) post.location = location.trim();
    if (status !== undefined) post.status = status;
    if (featured !== undefined) post.featured = featured === true || featured === 'true';
    if (registrationLink !== undefined) post.registrationLink = registrationLink ? registrationLink.trim() : '';
    if (imageAlt !== undefined) post.imageAlt = imageAlt;

    if (tags !== undefined) {
      try {
        post.tags = typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : [tags]);
      } catch (e) {
        post.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      }
    }

    // Update image
    if (req.file) {
      post.image = processUploadedFile(req.file, 'posts');
    } else if (bodyImage && typeof bodyImage === 'string' && bodyImage.trim() !== '') {
      post.image = bodyImage.trim();
    } else if (removeImage === 'true') {
      post.image = '';
    }

    await post.save();

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    logger.error('Update post error', { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (Admin only)
router.delete('/:id', adminAuth, validateObjectId, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Delete associated image if local file
    if (post.image && post.image.startsWith('/uploads/')) {
      deleteFile(post.image.substring(1));
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete post error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
});

module.exports = router;