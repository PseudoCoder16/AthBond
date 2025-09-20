const express = require('express');
const router = express.Router();
const athleteController = require('../controllers/athleteController');
const { requireAthleteAuth } = require('../middleware/auth');
const { upload } = require('../config/upload');

// Athlete profile routes
router.get('/api/athlete', requireAthleteAuth, athleteController.getProfile);
router.put('/api/athlete', requireAthleteAuth, athleteController.updateProfile);

// Athlete stats and leaderboard
router.get('/api/athlete/stats', requireAthleteAuth, athleteController.getStats);
router.get('/api/athlete/leaderboard', requireAthleteAuth, athleteController.getLeaderboard);

// Video upload and AI processing
router.post('/api/athlete/upload-video', requireAthleteAuth, upload.single('video'), athleteController.uploadVideo);

module.exports = router;
