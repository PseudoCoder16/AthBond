const express = require('express');
const router = express.Router();
const leaderboardService = require('../services/leaderboardService');
const { requireAthleteAuth, requireCoachAuth } = require('../middleware/auth');

// Get leaderboard for specific sports
router.get('/api/leaderboard/:sports', requireAthleteAuth, async (req, res) => {
    try {
        const { sports } = req.params;
        const { limit = 50 } = req.query;
        
        const leaderboard = leaderboardService.getLeaderboardBySports(sports, parseInt(limit));
        
        res.json({
            success: true,
            leaderboard: leaderboard,
            sports: sports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load leaderboard'
        });
    }
});

// Get global leaderboard
router.get('/api/leaderboard', requireAthleteAuth, async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        
        const leaderboard = leaderboardService.getGlobalLeaderboard(parseInt(limit));
        
        res.json({
            success: true,
            leaderboard: leaderboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load global leaderboard'
        });
    }
});

// Get leaderboard statistics
router.get('/api/leaderboard/stats/:sports?', requireAthleteAuth, async (req, res) => {
    try {
        const { sports } = req.params;
        
        const stats = leaderboardService.getLeaderboardStats(sports);
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load leaderboard statistics'
        });
    }
});

// Get athlete performance trends
router.get('/api/athlete/trends', requireAthleteAuth, async (req, res) => {
    try {
        const athleteId = req.session.athleteId;
        const { days = 30 } = req.query;
        
        const trends = leaderboardService.getPerformanceTrends(athleteId, parseInt(days));
        
        res.json({
            success: true,
            trends: trends
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load performance trends'
        });
    }
});

// Get coach's athletes leaderboard
router.get('/api/coach/athletes/leaderboard', requireCoachAuth, async (req, res) => {
    try {
        const coachId = req.session.coachId;
        const { sports } = req.query;
        
        if (sports) {
            const leaderboard = leaderboardService.getLeaderboardBySports(sports, 50);
            res.json({
                success: true,
                leaderboard: leaderboard,
                sports: sports
            });
        } else {
            const leaderboard = leaderboardService.getGlobalLeaderboard(100);
            res.json({
                success: true,
                leaderboard: leaderboard
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load athletes leaderboard'
        });
    }
});

module.exports = router;

