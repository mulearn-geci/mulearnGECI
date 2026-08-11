const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// Public route to get leaderboard data
router.get('/', leaderboardController.getAllLeaderboard);

// Protected route for automated bot or admin sync
router.post('/sync', leaderboardController.syncLeaderboard);

module.exports = router;
