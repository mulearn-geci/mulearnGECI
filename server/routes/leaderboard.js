const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { adminAuth } = require('../middleware/auth');

// Public route to get leaderboard data
router.get('/', leaderboardController.getAllLeaderboard);

// Protected route for automated bot or admin sync
router.post('/sync', leaderboardController.syncLeaderboard);

// Admin-only route to clear all leaderboard records
router.delete('/clear', adminAuth, leaderboardController.clearLeaderboard);

module.exports = router;
