const athleteService = require('../services/athleteService');
const aiService = require('../services/aiService');

class AthleteController {
    // Get athlete profile
    async getProfile(req, res) {
        try {
            const athlete = athleteService.getAthleteByEmail(req.session.athleteEmail);
            if (athlete) {
                res.json({
                    success: true,
                    athlete: {
                        id: athlete.id,
                        name: athlete.name,
                        age: athlete.age,
                        gender: athlete.gender,
                        email: athlete.email,
                        sports: athlete.sports,
                        level: athlete.level,
                        phone: athlete.phone,
                        createdAt: athlete.createdAt
                    }
                });
            } else {
                res.status(404).json({ 
                    success: false, 
                    message: 'Athlete not found' 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    // Update athlete profile
    async updateProfile(req, res) {
        try {
            const athleteId = req.session.athleteId;
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
            
            const updatedAthlete = await athleteService.updateAthlete(athleteId, filteredUpdateData);
            
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

    // Get athlete stats
    async getStats(req, res) {
        try {
            const athleteId = req.session.athleteId;
            const stats = athleteService.getAthleteStats(athleteId);
            
            res.json({
                success: true,
                stats: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to load stats'
            });
        }
    }

    // Get leaderboard
    async getLeaderboard(req, res) {
        try {
            const athleteId = req.session.athleteId;
            const { leaderboard, stats } = athleteService.getLeaderboard(athleteId);
            
            res.json({
                success: true,
                leaderboard: leaderboard,
                stats: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to load leaderboard'
            });
        }
    }

    // Upload and process video
    async uploadVideo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No video file uploaded'
                });
            }

            const videoPath = req.file.path;
            const athleteId = req.session.athleteId;
            
            // Get athlete's sports category
            const athlete = athleteService.getAthleteById(athleteId);
            if (!athlete) {
                return res.status(404).json({
                    success: false,
                    message: 'Athlete not found'
                });
            }

            // Process video with AI using OpenCV, MediaPipe, and ML models
            const analysis = await aiService.processVideoWithAI(videoPath, athleteId, athlete.sports);

            // Save analysis results
            aiService.saveAnalysisResults(athleteId, videoPath, analysis);

            res.json({
                success: true,
                message: 'Video processed successfully with AI analysis',
                analysis: analysis
            });

        } catch (error) {
            console.error('Video upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process video'
            });
        }
    }
}

module.exports = new AthleteController();
