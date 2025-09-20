const mongoDB = require('./mongodb');
const Athlete = require('../models/Athlete');
const Coach = require('../models/Coach');
const VideoAnalysis = require('../models/VideoAnalysis');
const Leaderboard = require('../models/Leaderboard');

class MongoDBDatabaseService {
    constructor() {
        this.isConnected = false;
    }

    // Initialize database connection
    async initialize() {
        try {
            await mongoDB.connect();
            this.isConnected = true;
            console.log('✅ MongoDB Database Service initialized');
        } catch (error) {
            console.error('❌ MongoDB Database Service initialization failed:', error);
            throw error;
        }
    }

    // Get connection status
    getConnectionStatus() {
        return mongoDB.getConnectionStatus();
    }

    // Health check
    async healthCheck() {
        return await mongoDB.healthCheck();
    }

    // Athlete operations
    async createAthlete(athleteData) {
        try {
            const athlete = new Athlete(athleteData);
            return await athlete.save();
        } catch (error) {
            console.error('Error creating athlete:', error);
            throw error;
        }
    }

    async findAthleteByEmail(email) {
        try {
            return await Athlete.findByEmail(email);
        } catch (error) {
            console.error('Error finding athlete by email:', error);
            throw error;
        }
    }

    async findAthleteById(id) {
        try {
            return await Athlete.findById(id);
        } catch (error) {
            console.error('Error finding athlete by ID:', error);
            throw error;
        }
    }

    async updateAthlete(id, updateData) {
        try {
            return await Athlete.findByIdAndUpdate(id, updateData, { 
                new: true, 
                runValidators: true 
            });
        } catch (error) {
            console.error('Error updating athlete:', error);
            throw error;
        }
    }

    async deleteAthlete(id) {
        try {
            return await Athlete.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting athlete:', error);
            throw error;
        }
    }

    async getAthletesBySports(sports, limit = 50) {
        try {
            return await Athlete.findBySports(sports, limit);
        } catch (error) {
            console.error('Error getting athletes by sports:', error);
            throw error;
        }
    }

    async getAthleteLeaderboard(sports, level = null, limit = 50) {
        try {
            return await Athlete.getLeaderboard(sports, level, limit);
        } catch (error) {
            console.error('Error getting athlete leaderboard:', error);
            throw error;
        }
    }

    // Coach operations
    async createCoach(coachData) {
        try {
            const coach = new Coach(coachData);
            return await coach.save();
        } catch (error) {
            console.error('Error creating coach:', error);
            throw error;
        }
    }

    async findCoachByEmail(email) {
        try {
            return await Coach.findByEmail(email);
        } catch (error) {
            console.error('Error finding coach by email:', error);
            throw error;
        }
    }

    async findCoachById(id) {
        try {
            return await Coach.findById(id);
        } catch (error) {
            console.error('Error finding coach by ID:', error);
            throw error;
        }
    }

    async updateCoach(id, updateData) {
        try {
            return await Coach.findByIdAndUpdate(id, updateData, { 
                new: true, 
                runValidators: true 
            });
        } catch (error) {
            console.error('Error updating coach:', error);
            throw error;
        }
    }

    async deleteCoach(id) {
        try {
            return await Coach.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting coach:', error);
            throw error;
        }
    }

    async getCoachesBySports(sports, limit = 50) {
        try {
            return await Coach.findBySports(sports, limit);
        } catch (error) {
            console.error('Error getting coaches by sports:', error);
            throw error;
        }
    }

    // Video Analysis operations
    async createVideoAnalysis(analysisData) {
        try {
            const analysis = new VideoAnalysis(analysisData);
            return await analysis.save();
        } catch (error) {
            console.error('Error creating video analysis:', error);
            throw error;
        }
    }

    async findVideoAnalysisById(id) {
        try {
            return await VideoAnalysis.findById(id);
        } catch (error) {
            console.error('Error finding video analysis by ID:', error);
            throw error;
        }
    }

    async getVideoAnalysesByAthlete(athleteId, limit = 20) {
        try {
            return await VideoAnalysis.findByAthlete(athleteId, limit);
        } catch (error) {
            console.error('Error getting video analyses by athlete:', error);
            throw error;
        }
    }

    async getVideoAnalysesBySports(sports, limit = 50) {
        try {
            return await VideoAnalysis.findBySports(sports, limit);
        } catch (error) {
            console.error('Error getting video analyses by sports:', error);
            throw error;
        }
    }

    async getCheatDetectedAnalyses(limit = 20) {
        try {
            return await VideoAnalysis.getCheatDetected(limit);
        } catch (error) {
            console.error('Error getting cheat detected analyses:', error);
            throw error;
        }
    }

    async getPerformanceStats(athleteId, days = 30) {
        try {
            return await VideoAnalysis.getPerformanceStats(athleteId, days);
        } catch (error) {
            console.error('Error getting performance stats:', error);
            throw error;
        }
    }

    async updateVideoAnalysisStatus(id, status, error = null) {
        try {
            const analysis = await VideoAnalysis.findById(id);
            if (!analysis) {
                throw new Error('Video analysis not found');
            }

            if (status === 'completed') {
                await analysis.markAsCompleted();
            } else if (status === 'failed') {
                await analysis.markAsFailed(error);
            }

            return analysis;
        } catch (error) {
            console.error('Error updating video analysis status:', error);
            throw error;
        }
    }

    // Leaderboard operations
    async createOrUpdateLeaderboard(sports, level, athleteData) {
        try {
            return await Leaderboard.createOrUpdate(sports, level, athleteData);
        } catch (error) {
            console.error('Error creating/updating leaderboard:', error);
            throw error;
        }
    }

    async getLeaderboardBySportsAndLevel(sports, level) {
        try {
            return await Leaderboard.findBySportsAndLevel(sports, level);
        } catch (error) {
            console.error('Error getting leaderboard by sports and level:', error);
            throw error;
        }
    }

    async getGlobalLeaderboard(limit = 100) {
        try {
            return await Leaderboard.getGlobalLeaderboard(limit);
        } catch (error) {
            console.error('Error getting global leaderboard:', error);
            throw error;
        }
    }

    async getLeaderboardStats(sports, level = null) {
        try {
            return await Leaderboard.getLeaderboardStats(sports, level);
        } catch (error) {
            console.error('Error getting leaderboard stats:', error);
            throw error;
        }
    }

    async updateAthleteScoreInLeaderboard(sports, level, athleteId, newScore, additionalData = {}) {
        try {
            const leaderboard = await Leaderboard.findBySportsAndLevel(sports, level);
            if (!leaderboard) {
                throw new Error('Leaderboard not found');
            }

            return await leaderboard.updateAthleteScore(athleteId, newScore, additionalData);
        } catch (error) {
            console.error('Error updating athlete score in leaderboard:', error);
            throw error;
        }
    }

    // Statistics and analytics
    async getAthleteStats(athleteId) {
        try {
            const athlete = await this.findAthleteById(athleteId);
            if (!athlete) {
                return null;
            }

            const performanceStats = await this.getPerformanceStats(athleteId, 30);
            const recentAnalyses = await this.getVideoAnalysesByAthlete(athleteId, 5);

            return {
                totalVideos: athlete.totalVideos,
                averageScore: athlete.averageScore,
                bestScore: athlete.bestScore,
                currentRank: athlete.currentRank,
                improvement: athlete.improvement,
                recentPerformance: performanceStats,
                lastVideoScore: recentAnalyses.length > 0 ? recentAnalyses[0].analysis.performanceScore : 0,
                lastVideoDate: recentAnalyses.length > 0 ? recentAnalyses[0].createdAt : null
            };
        } catch (error) {
            console.error('Error getting athlete stats:', error);
            throw error;
        }
    }

    async getCoachStats(coachId) {
        try {
            const coach = await this.findCoachById(coachId);
            if (!coach) {
                return null;
            }

            // Get athletes associated with this coach (you might need to implement this relationship)
            const totalAthletes = await Athlete.countDocuments({ isActive: true });
            const totalVideosAnalyzed = await VideoAnalysis.countDocuments({ status: 'completed' });

            return {
                totalAthletes: coach.totalAthletes,
                totalVideosAnalyzed: coach.totalVideosAnalyzed,
                averageAthleteScore: coach.averageAthleteScore,
                rating: coach.rating,
                experience: coach.experience
            };
        } catch (error) {
            console.error('Error getting coach stats:', error);
            throw error;
        }
    }

    // Cleanup operations
    async cleanupOldData(days = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            // Clean up old video analyses
            const deletedAnalyses = await VideoAnalysis.deleteMany({
                createdAt: { $lt: cutoffDate },
                status: 'failed'
            });

            console.log(`Cleaned up ${deletedAnalyses.deletedCount} old video analyses`);
            return deletedAnalyses.deletedCount;
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            throw error;
        }
    }

    // Close database connection
    async close() {
        try {
            await mongoDB.disconnect();
            this.isConnected = false;
            console.log('MongoDB Database Service closed');
        } catch (error) {
            console.error('Error closing database connection:', error);
            throw error;
        }
    }
}

// Create singleton instance
const mongoDBService = new MongoDBDatabaseService();

module.exports = mongoDBService;

