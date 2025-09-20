const bcrypt = require('bcryptjs');
const mongoDBService = require('../config/mongodbDatabase');

class CoachService {
    // Create new coach
    async createCoach(coachData) {
        try {
            const { name, age, gender, email, sports, phone, sportsGovtId, password } = coachData;
            
            // Check if coach already exists
            const existingCoach = await mongoDBService.findCoachByEmail(email);
            if (existingCoach) {
                throw new Error('Coach with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create new coach data
            const newCoachData = {
                name,
                age: parseInt(age),
                gender,
                email,
                sports,
                phone,
                sportsGovtId,
                password: hashedPassword
            };

            // Save to MongoDB
            const newCoach = await mongoDBService.createCoach(newCoachData);
            return newCoach;
        } catch (error) {
            throw error;
        }
    }

    // Authenticate coach
    async authenticateCoach(email, password) {
        try {
            const coach = await mongoDBService.findCoachByEmail(email);
            if (!coach) {
                throw new Error('Invalid email or password');
            }

            const isValidPassword = await bcrypt.compare(password, coach.password);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }

            return coach;
        } catch (error) {
            throw error;
        }
    }

    // Get coach by ID
    async getCoachById(id) {
        return await mongoDBService.findCoachById(id);
    }

    // Get coach by email
    async getCoachByEmail(email) {
        return await mongoDBService.findCoachByEmail(email);
    }

    // Update coach profile
    async updateCoach(id, updateData) {
        try {
            const updatedCoach = await mongoDBService.updateCoach(id, updateData);
            if (!updatedCoach) {
                throw new Error('Coach not found');
            }

            return updatedCoach;
        } catch (error) {
            throw error;
        }
    }

    // Get coach's athletes
    getCoachAthletes(coachId) {
        // Mock athletes data - in production, fetch from database
        return [
            { name: 'John Doe', sports: 'Football', level: 'National', status: 'Active' },
            { name: 'Jane Smith', sports: 'Basketball', level: 'State', status: 'Active' },
            { name: 'Mike Johnson', sports: 'Tennis', level: 'District', status: 'Pending' }
        ];
    }

    // Get coach alerts
    getCoachAlerts(coachId) {
        // Mock alerts data - in production, fetch from database
        return [
            {
                id: '1',
                type: 'warning',
                icon: '⚠️',
                title: 'Form quality < 70%',
                description: 'Athlete John Doe\'s recent video shows poor form',
                action: 'Review'
            },
            {
                id: '2',
                type: 'danger',
                icon: '🚨',
                title: 'Possible injury risk',
                description: 'Unusual movement patterns detected in Sarah\'s video',
                action: 'Investigate'
            }
        ];
    }

    // Get coach stats
    async getCoachStats(coachId) {
        try {
            const stats = await mongoDBService.getCoachStats(coachId);
            if (!stats) {
                return {
                    totalAthletes: 0,
                    activeAlerts: 0,
                    videosAnalyzed: 0
                };
            }
            
            return {
                totalAthletes: stats.totalAthletes,
                activeAlerts: 0, // This would need to be implemented based on your alert system
                videosAnalyzed: stats.totalVideosAnalyzed
            };
        } catch (error) {
            console.error('Error getting coach stats:', error);
            return {
                totalAthletes: 0,
                activeAlerts: 0,
                videosAnalyzed: 0
            };
        }
    }

    // Get coach leaderboard
    getCoachLeaderboard(coachId) {
        // Mock coach's athletes leaderboard - in production, fetch from database
        const athletes = [
            { name: 'John Doe', sports: 'Football', level: 'National', score: 95 },
            { name: 'Jane Smith', sports: 'Basketball', level: 'State', score: 92 },
            { name: 'Mike Johnson', sports: 'Tennis', level: 'District', score: 88 }
        ];

        const stats = {
            totalAthletes: athletes.length,
            avgPerformance: 92,
            topPerformer: 'John Doe',
            improvements: 5
        };

        return { athletes, stats };
    }
}

module.exports = new CoachService();
