const { athletes } = require('../routes/simpleAuthRoutes');

// In-memory leaderboard storage
let leaderboardData = new Map();
let leaderboardIdCounter = 1;

class LeaderboardService {
    // Update athlete score in leaderboard
    async updateAthleteScore(athleteId, videoAnalysis, sports) {
        try {
            console.log('Updating leaderboard for athlete:', athleteId);
            
            // Get athlete data
            let athlete = null;
            for (let ath of athletes.values()) {
                if (ath.id === athleteId || ath._id === athleteId) {
                    athlete = ath;
                    break;
                }
            }
            
            if (!athlete) {
                console.log('Athlete not found for leaderboard update');
                return { success: false, message: 'Athlete not found' };
            }
            
            // Calculate new score
            const newScore = videoAnalysis.overallScore || 0;
            const previousScore = leaderboardData.get(athleteId)?.averageScore || 0;
            const totalVideos = (leaderboardData.get(athleteId)?.totalVideos || 0) + 1;
            
            // Calculate average score
            const averageScore = ((previousScore * (totalVideos - 1)) + newScore) / totalVideos;
            
            // Update leaderboard data
            const leaderboardEntry = {
                athleteId: athleteId,
                athleteName: athlete.name,
                athleteEmail: athlete.email,
                sports: sports || athlete.sports,
                level: athlete.level,
                averageScore: Math.round(averageScore * 100) / 100,
                bestScore: Math.max(previousScore, newScore),
                totalVideos: totalVideos,
                lastVideoScore: newScore,
                lastVideoDate: new Date(),
                improvement: newScore - previousScore,
                rank: 0 // Will be calculated when getting leaderboard
            };
            
            leaderboardData.set(athleteId, leaderboardEntry);
            
            console.log('Leaderboard updated:', leaderboardEntry);
            
            return {
                success: true,
                athleteId: athleteId,
                averageScore: averageScore,
                improvement: newScore - previousScore,
                rank: await this.calculateRank(athleteId, sports || athlete.sports),
                message: 'Leaderboard updated successfully'
            };
            
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            return { success: false, message: 'Failed to update leaderboard' };
        }
    }
    
    // Calculate athlete's rank
    async calculateRank(athleteId, sports) {
        try {
            const athleteEntry = leaderboardData.get(athleteId);
            if (!athleteEntry) return 0;
            
            // Get all athletes in the same sport
            const sportAthletes = Array.from(leaderboardData.values())
                .filter(entry => entry.sports === sports)
                .sort((a, b) => b.averageScore - a.averageScore);
            
            const rank = sportAthletes.findIndex(entry => entry.athleteId === athleteId) + 1;
            return rank || 0;
            
        } catch (error) {
            console.error('Error calculating rank:', error);
            return 0;
        }
    }
    
    // Get leaderboard for a specific sport
    async getLeaderboard(sports, level = null, limit = 50) {
        try {
            console.log('Getting leaderboard for sports:', sports, 'level:', level);
            
            // Filter by sport and optionally by level
            let filteredAthletes = Array.from(leaderboardData.values())
                .filter(entry => entry.sports === sports);
            
            if (level) {
                filteredAthletes = filteredAthletes.filter(entry => entry.level === level);
            }
            
            // Sort by average score (descending)
            const sortedAthletes = filteredAthletes
                .sort((a, b) => b.averageScore - a.averageScore)
                .slice(0, limit);
            
            // Add rank to each entry
            const leaderboard = sortedAthletes.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));
            
            console.log('Leaderboard generated with', leaderboard.length, 'athletes');
            
            return leaderboard;
            
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    }
    
    // Get athlete's leaderboard position
    async getAthleteLeaderboardPosition(athleteId, sports) {
        try {
            const leaderboard = await this.getLeaderboard(sports);
            const athletePosition = leaderboard.find(entry => entry.athleteId === athleteId);
            
            if (athletePosition) {
                return {
                    rank: athletePosition.rank,
                    averageScore: athletePosition.averageScore,
                    totalAthletes: leaderboard.length,
                    improvement: athletePosition.improvement
                };
            }
            
            return {
                rank: 0,
                averageScore: 0,
                totalAthletes: leaderboard.length,
                improvement: 0
            };
            
        } catch (error) {
            console.error('Error getting athlete position:', error);
            return {
                rank: 0,
                averageScore: 0,
                totalAthletes: 0,
                improvement: 0
            };
        }
    }
    
    // Get all sports available in leaderboard
    async getAvailableSports() {
        try {
            const sports = new Set();
            for (let entry of leaderboardData.values()) {
                sports.add(entry.sports);
            }
            return Array.from(sports);
        } catch (error) {
            console.error('Error getting available sports:', error);
            return [];
        }
    }
    
    // Get leaderboard statistics
    async getLeaderboardStats(sports) {
        try {
            const leaderboard = await this.getLeaderboard(sports);
            
            if (leaderboard.length === 0) {
                return {
                    totalAthletes: 0,
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0
                };
            }
            
            const scores = leaderboard.map(entry => entry.averageScore);
            const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            const highestScore = Math.max(...scores);
            const lowestScore = Math.min(...scores);
            
            return {
                totalAthletes: leaderboard.length,
                averageScore: Math.round(averageScore * 100) / 100,
                highestScore: Math.round(highestScore * 100) / 100,
                lowestScore: Math.round(lowestScore * 100) / 100
            };
            
        } catch (error) {
            console.error('Error getting leaderboard stats:', error);
            return {
                totalAthletes: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0
            };
        }
    }
    
    // Clear leaderboard data (for testing)
    clearLeaderboard() {
        leaderboardData.clear();
        console.log('Leaderboard data cleared');
    }
    
    // Get all leaderboard data (for debugging)
    getAllLeaderboardData() {
        return Array.from(leaderboardData.values());
    }
}

module.exports = new LeaderboardService();