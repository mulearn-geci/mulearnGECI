const Post = require('../models/Post');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHandler');
const { deleteFile, processUploadedFile } = require('../middleware/upload');
const logger = require('../utils/logger');

const postController = {
  // Get all posts with filtering and pagination
  getAllPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter = {};
      
      if (req.query.status) {
        filter.status = req.query.status;
      } else if (!req.user || req.user.role !== 'admin') {
        // Only show published posts for public access
        filter.status = 'published';
      }
      
      if (req.query.category) filter.category = req.query.category;
      if (req.query.featured) filter.featured = req.query.featured === 'true';
      if (req.query.author) filter.author = req.query.author;
      
      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.search, 'i')] } }
        ];
      }

      // Get posts with pagination
      const posts = await Post.find(filter)
        .populate('author', 'name email')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
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

      // Only show published posts to public, unless user is admin
      if (post.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
        return sendError(res, 404, 'Post not found');
      }

      // Increment views
      post.views += 1;
      await post.save();

      return sendSuccess(res, 'Post retrieved successfully', post);
    } catch (error) {
      logger.error('Get post error', { error: error.message });
      return sendError(res, 500, 'Server error while fetching post');
    }
  },

  // Create new post
  createPost: async (req, res) => {
    try {
      if (!req.file) {
        return sendError(res, 400, 'Image is required');
      }

      const {
        title, tags, status,
        featured, registrationLink, imageAlt
      } = req.body;

      const post = new Post({
        title,
        image: processUploadedFile(req.file, 'posts'),
        imageAlt: imageAlt || title,
        tags: tags ? JSON.parse(tags) : [],
        status: status || 'draft',
        featured: featured === 'true',
        registrationLink,
        author: req.user.id
      });

      await post.save();
      await post.populate('author', 'name email');

      logger.info('Post created', { postId: post._id, title: post.title });

      return sendCreated(res, 'Post created successfully', post);
    } catch (error) {
      // Delete uploaded file if post creation fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      logger.error('Create post error', { error: error.message });
      return sendError(res, 500, 'Server error while creating post');
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
        title, tags, status,
        featured, registrationLink, imageAlt
      } = req.body;

      // Update fields
      if (title) post.title = title;
      if (tags) post.tags = JSON.parse(tags);
      if (status) post.status = status;
      if (featured !== undefined) post.featured = featured === 'true';
      if (registrationLink) post.registrationLink = registrationLink;
      if (imageAlt) post.imageAlt = imageAlt;

      // Update image if new one is uploaded
      if (req.file) {
        // Delete old image
        if (post.image) {
          deleteFile(post.image);
        }
        post.image = processUploadedFile(req.file, 'posts');
      }

      await post.save();
      await post.populate('author', 'name email');

      logger.info('Post updated', { postId: post._id, title: post.title });

      return sendSuccess(res, 'Post updated successfully', post);
    } catch (error) {
      // Delete uploaded file if update fails
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      logger.error('Update post error', { error: error.message });
      return sendError(res, 500, 'Server error while updating post');
    }
  },

  // Delete post
  deletePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return sendError(res, 404, 'Post not found');
      }

      // Delete associated image
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