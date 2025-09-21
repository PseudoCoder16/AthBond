const bcrypt = require('bcryptjs');
const mongoDBService = require('../config/mongodbDatabase');
const leaderboardService = require('./leaderboardService');

// In-memory storage as fallback
let inMemoryAthletes = new Map();
let athleteIdCounter = 1;

class AthleteService {
    // Create new athlete
    async createAthlete(athleteData) {
        try {
            const { name, age, gender, email, sports, level, phone, password } = athleteData;
            
            // Check if athlete already exists (try MongoDB first, then in-memory)
            let existingAthlete = null;
            try {
                existingAthlete = await mongoDBService.findAthleteByEmail(email);
            } catch (error) {
                // MongoDB not available, check in-memory storage
                existingAthlete = inMemoryAthletes.get(email);
            }
            
            if (existingAthlete) {
                throw new Error('Athlete with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create new athlete data
            const newAthleteData = {
                _id: `athlete_${athleteIdCounter++}`,
                name,
                age: parseInt(age),
                gender,
                email,
                sports,
                level,
                phone,
                password: hashedPassword,
                createdAt: new Date(),
                totalVideos: 0,
                averageScore: 0,
                bestScore: 0,
                currentRank: null,
                improvement: 0
            };

            // Try to save to MongoDB first
            try {
                const newAthlete = await mongoDBService.createAthlete(newAthleteData);
                return newAthlete;
            } catch (error) {
                // MongoDB not available, use in-memory storage
                console.log('MongoDB not available, using in-memory storage');
                inMemoryAthletes.set(email, newAthleteData);
                return newAthleteData;
            }
        } catch (error) {
            throw error;
        }
    }

    // Authenticate athlete
    async authenticateAthlete(email, password) {
        try {
            let athlete = null;
            try {
                athlete = await mongoDBService.findAthleteByEmail(email);
            } catch (error) {
                // MongoDB not available, check in-memory storage
                athlete = inMemoryAthletes.get(email);
            }
            
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
        try {
            // Check if it's a valid MongoDB ObjectId format (24 hex characters)
            if (id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
                return await mongoDBService.findAthleteById(id);
            } else {
                // Not a valid ObjectId, check in-memory storage
                for (let ath of inMemoryAthletes.values()) {
                    if (ath._id === id || ath.id === id) {
                        return ath;
                    }
                }
                return null;
            }
        } catch (error) {
            // MongoDB not available, check in-memory storage
            for (let ath of inMemoryAthletes.values()) {
                if (ath._id === id || ath.id === id) {
                    return ath;
                }
            }
            return null;
        }
    }

    // Get athlete by email
    async getAthleteByEmail(email) {
        try {
            return await mongoDBService.findAthleteByEmail(email);
        } catch (error) {
            // MongoDB not available, check in-memory storage
            return inMemoryAthletes.get(email);
        }
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
