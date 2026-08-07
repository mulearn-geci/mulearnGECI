const express = require('express');
const execomController = require('../controllers/execomController');
const { adminAuth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/execom
// @desc    Get all active Execom members
// @access  Public
router.get('/', execomController.getAllExecom);

// @route   GET /api/execom/:id
// @desc    Get single Execom member by ID
// @access  Public
router.get('/:id', execomController.getExecomById);

// @route   POST /api/execom
// @desc    Create new Execom member
// @access  Private (Admin)
router.post(
  '/',
  adminAuth,
  upload.single('image'),
  handleUploadError,
  execomController.createExecom
);

// @route   PUT /api/execom/reorder
// @desc    Reorder Execom members
// @access  Private (Admin)
router.put('/reorder', adminAuth, execomController.reorderExecom);

// @route   PUT /api/execom/:id
// @desc    Update Execom member
// @access  Private (Admin)
router.put(
  '/:id',
  adminAuth,
  upload.single('image'),
  handleUploadError,
  execomController.updateExecom
);

// @route   DELETE /api/execom/:id
// @desc    Delete Execom member
// @access  Private (Admin)
router.delete(
  '/:id',
  adminAuth,
  execomController.deleteExecom
);

module.exports = router;
