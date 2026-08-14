const Post = require('../models/Post');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHandler');
const { deleteFile, processUploadedFile } = require('../middleware/upload');
const logger = require('../utils/logger');

const postController = {
  // Get all posts with filtering and pagination
  getAllPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      const filter = {};
      
      if (req.query.status && req.query.status !== 'all') {
        filter.status = req.query.status;
      }
      
      if (req.query.category && req.query.category !== 'all') {
        filter.category = req.query.category;
      }
      
      if (req.query.featured) filter.featured = req.query.featured === 'true';
      if (req.query.author) filter.author = req.query.author;
      
      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { location: { $regex: req.query.search, $options: 'i' } },
          { category: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const posts = await Post.find(filter)
        .populate('author', 'name email')
        .sort({ eventDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      return sendSuccess(res, 'Posts retrieved successfully', posts, {
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      logger.error('Get posts error', { error: error.message });
      return sendError(res, 500, 'Server error while fetching posts');
    }
  },

  // Get single post by ID
  getPostById: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate('author', 'name email');
      
      if (!post) {
        return sendError(res, 404, 'Post not found');
      }

      post.views = (post.views || 0) + 1;
      await post.save().catch(() => {});

      return sendSuccess(res, 'Post retrieved successfully', post);
    } catch (error) {
      logger.error('Get post error', { error: error.message });
      return sendError(res, 500, 'Server error while fetching post');
    }
  },

  // Create new post
  createPost: async (req, res) => {
    try {
      let image = '';
      if (req.file) {
        image = processUploadedFile(req.file, 'posts');
      } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim() !== '') {
        image = req.body.image.trim();
      }

      if (!image) {
        return sendError(res, 400, 'Image is required');
      }

      const {
        title, description, content, category,
        eventDate, location, tags, status,
        featured, registrationLink, imageAlt
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

      logger.info('Post created', { postId: post._id, title: post.title });

      return sendCreated(res, 'Post created successfully', post);
    } catch (error) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      logger.error('Create post error', { error: error.message });
      return sendError(res, 500, error.message || 'Server error while creating post');
    }
  },

  // Update post
  updatePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return sendError(res, 404, 'Post not found');
      }

      const {
        title, description, content, category,
        eventDate, location, tags, status,
        featured, registrationLink, imageAlt,
        image: bodyImage, removeImage
      } = req.body;

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

      if (req.file) {
        post.image = processUploadedFile(req.file, 'posts');
      } else if (bodyImage && typeof bodyImage === 'string' && bodyImage.trim() !== '') {
        post.image = bodyImage.trim();
      } else if (removeImage === 'true') {
        post.image = '';
      }

      await post.save();

      logger.info('Post updated', { postId: post._id, title: post.title });

      return sendSuccess(res, 'Post updated successfully', post);
    } catch (error) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      logger.error('Update post error', { error: error.message });
      return sendError(res, 500, error.message || 'Server error while updating post');
    }
  },

  // Delete post
  deletePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return sendError(res, 404, 'Post not found');
      }

      if (post.image && post.image.startsWith('/uploads/')) {
        deleteFile(post.image.substring(1));
      }

      await Post.findByIdAndDelete(req.params.id);

      logger.info('Post deleted', { postId: req.params.id });

      return sendSuccess(res, 'Post deleted successfully');
    } catch (error) {
      logger.error('Delete post error', { error: error.message });
      return sendError(res, 500, 'Server error while deleting post');
    }
  }
};

module.exports = postController;