const express = require('express');
const alumniController = require('../controllers/alumniController');
const { adminAuth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/alumni
// @desc    Get all active Alumni members
// @access  Public
router.get('/', alumniController.getAllAlumni);

// @route   GET /api/alumni/:id
// @desc    Get single Alumni member by ID
// @access  Public
router.get('/:id', alumniController.getAlumniById);

// @route   POST /api/alumni
// @desc    Create new Alumni member
// @access  Private (Admin)
router.post(
  '/',
  adminAuth,
  upload.single('image'),
  handleUploadError,
  alumniController.createAlumni
);

// @route   PUT /api/alumni/reorder
// @desc    Reorder Alumni members
// @access  Private (Admin)
router.put('/reorder', adminAuth, alumniController.reorderAlumni);

// @route   PUT /api/alumni/:id
// @desc    Update Alumni member
// @access  Private (Admin)
router.put(
  '/:id',
  adminAuth,
  upload.single('image'),
  handleUploadError,
  alumniController.updateAlumni
);

// @route   DELETE /api/alumni/:id
// @desc    Delete Alumni member
// @access  Private (Admin)
router.delete(
  '/:id',
  adminAuth,
  alumniController.deleteAlumni
);

module.exports = router;
