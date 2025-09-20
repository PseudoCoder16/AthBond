const bcrypt = require('bcryptjs');
const mongoDBService = require('../config/mongodbDatabase');
const leaderboardService = require('./leaderboardService');

class AthleteService {
    // Create new athlete
    async createAthlete(athleteData) {
        try {
            const { name, age, gender, email, sports, level, phone, password } = athleteData;
            
            // Check if athlete already exists
            const existingAthlete = await mongoDBService.findAthleteByEmail(email);
            if (existingAthlete) {
                throw new Error('Athlete with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create new athlete data
            const newAthleteData = {
                name,
                age: parseInt(age),
                gender,
                email,
                sports,
                level,
                phone,
                password: hashedPassword
            };

            // Save to MongoDB
            const newAthlete = await mongoDBService.createAthlete(newAthleteData);
            return newAthlete;
        } catch (error) {
            throw error;
        }
    }

    // Authenticate athlete
    async authenticateAthlete(email, password) {
        try {
            const athlete = await mongoDBService.findAthleteByEmail(email);
            if (!athlete) {
                throw new Error('Invalid email or password');
            }

            const isValidPassword = await bcrypt.compare(password, athlete.password);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }

            return athlete;
        } catch (error) {
            throw error;
        }
    }

    // Get athlete by ID
    async getAthleteById(id) {
        return await mongoDBService.findAthleteById(id);
    }

    // Get athlete by email
    async getAthleteByEmail(email) {
        return await mongoDBService.findAthleteByEmail(email);
    }

    // Update athlete profile
    async updateAthlete(id, updateData) {
        try {
            const updatedAthlete = await mongoDBService.updateAthlete(id, updateData);
            if (!updatedAthlete) {
                throw new Error('Athlete not found');
            }

            return updatedAthlete;
        } catch (error) {
            throw error;
        }
    }

    // Get athlete stats
    async getAthleteStats(athleteId) {
        try {
            const stats = await mongoDBService.getAthleteStats(athleteId);
            if (!stats) {
                return {
                    totalVideos: 0,
                    avgScore: 0,
                    improvement: 0,
                    rank: null
                };
            }
            
            return {
                totalVideos: stats.totalVideos,
                avgScore: stats.averageScore,
                improvement: stats.improvement,
                rank: stats.currentRank,
                lastVideoScore: stats.lastVideoScore,
                lastVideoDate: stats.lastVideoDate
            };
        } catch (error) {
            console.error('Error getting athlete stats:', error);
            return {
                totalVideos: 0,
                avgScore: 0,
                improvement: 0,
                rank: null
            };
        }
    }

    // Get leaderboard
    async getLeaderboard(athleteId) {
        try {
            const athlete = await this.getAthleteById(athleteId);
            if (!athlete) {
                return { leaderboard: [], stats: {} };
            }

            // Get leaderboard for athlete's sports
            const leaderboard = await mongoDBService.getAthleteLeaderboard(athlete.sports, athlete.level, 50);
            
            // Mark current user
            const leaderboardWithCurrentUser = leaderboard.map(entry => ({
                ...entry,
                isCurrentUser: entry.athlete._id.toString() === athleteId
            }));

            // Get athlete's stats
            const stats = await this.getAthleteStats(athleteId);

            return { 
                leaderboard: leaderboardWithCurrentUser, 
                stats: {
                    yourRank: stats.rank,
                    yourScore: stats.avgScore,
                    totalAthletes: leaderboard.length,
                    improvement: stats.improvement
                }
            };
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return { leaderboard: [], stats: {} };
        }
    }
}

module.exports = new AthleteService();
