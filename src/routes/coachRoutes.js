const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { requireCoachAuth } = require('../middleware/auth');

// Coach profile routes
router.get('/api/coach', requireCoachAuth, coachController.getProfile);
router.put('/api/coach', requireCoachAuth, coachController.updateProfile);

// Coach athletes and alerts
router.get('/api/coach/athletes', requireCoachAuth, coachController.getAthletes);
router.get('/api/coach/alerts', requireCoachAuth, coachController.getAlerts);

// Coach stats and leaderboard
router.get('/api/coach/stats', requireCoachAuth, coachController.getStats);
router.get('/api/coach/leaderboard', requireCoachAuth, coachController.getLeaderboard);

module.exports = router;
