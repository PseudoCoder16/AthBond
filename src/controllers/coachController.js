const coachService = require('../services/coachService');

class CoachController {
    // Get coach profile
    async getProfile(req, res) {
        try {
            const coach = coachService.getCoachByEmail(req.session.coachEmail);
            if (coach) {
                res.json({
                    success: true,
                    coach: {
                        id: coach.id,
                        name: coach.name,
                        age: coach.age,
                        gender: coach.gender,
                        email: coach.email,
                        sports: coach.sports,
                        phone: coach.phone,
                        sportsGovtId: coach.sportsGovtId,
                        createdAt: coach.createdAt
                    }
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Coach not found' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    // Update coach profile
    async updateProfile(req, res) {
        try {
            const coachId = req.session.coachId;
            const updateData = req.body;
            
            // Filter out undefined, null, empty string, and 'undefined' string values
            const filteredUpdateData = {};
            Object.keys(updateData).forEach(key => {
                const value = updateData[key];
                if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
                    filteredUpdateData[key] = value;
                }
            });
            
            // Don't allow updating password through this endpoint
            delete filteredUpdateData.password;
            
            const updatedCoach = await coachService.updateCoach(coachId, filteredUpdateData);
            
            res.json({ 
                success: true, 
                message: 'Profile updated successfully' 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    // Get coach's athletes
    async getAthletes(req, res) {
        try {
            const coachId = req.session.coachId;
            const athletes = coachService.getCoachAthletes(coachId);
            
            res.json({
                success: true,
                athletes: athletes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to load athletes'
            });
        }
    }

    // Get coach alerts
    async getAlerts(req, res) {
        try {
            const coachId = req.session.coachId;
            const alerts = coachService.getCoachAlerts(coachId);
            
            res.json({
                success: true,
                alerts: alerts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to load alerts'
            });
        }
    }

    // Get coach stats
    async getStats(req, res) {
        try {
            const coachId = req.session.coachId;
            const stats = coachService.getCoachStats(coachId);
            
            res.json({
                success: true,
                stats: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to load coach stats'
            });
        }
    }

    // Get coach leaderboard
    async getLeaderboard(req, res) {
        try {
            const coachId = req.session.coachId;
            const { athletes, stats } = coachService.getCoachLeaderboard(coachId);
            
            res.json({
                success: true,
                athletes: athletes,
                stats: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to load coach leaderboard'
            });
        }
    }
}

module.exports = new CoachController();
