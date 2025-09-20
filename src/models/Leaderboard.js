const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    sports: {
        type: String,
        required: [true, 'Sports category is required'],
        enum: ['Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Cricket', 'Volleyball', 'Badminton', 'Other']
    },
    level: {
        type: String,
        required: [true, 'Level is required'],
        enum: ['National', 'State', 'District', 'Local']
    },
    entries: [{
        athlete: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Athlete',
            required: true
        },
        rank: {
            type: Number,
            required: true,
            min: 1
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        totalVideos: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        bestScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        improvement: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }],
    totalAthletes: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for efficient queries
leaderboardSchema.index({ sports: 1, level: 1, isActive: 1 });
leaderboardSchema.index({ 'entries.rank': 1 });
leaderboardSchema.index({ 'entries.score': -1 });
leaderboardSchema.index({ lastUpdated: -1 });

// Pre-save middleware
leaderboardSchema.pre('save', function(next) {
    // Update last updated timestamp
    this.lastUpdated = new Date();
    
    // Update total athletes count
    this.totalAthletes = this.entries.length;
    
    next();
});

// Instance methods
leaderboardSchema.methods.addAthlete = function(athleteData) {
    // Check if athlete already exists
    const existingIndex = this.entries.findIndex(entry => 
        entry.athlete.toString() === athleteData.athlete.toString()
    );
    
    if (existingIndex >= 0) {
        // Update existing entry
        this.entries[existingIndex] = {
            ...this.entries[existingIndex],
            ...athleteData,
            lastUpdated: new Date()
        };
    } else {
        // Add new entry
        this.entries.push({
            ...athleteData,
            lastUpdated: new Date()
        });
    }
    
    // Sort by score (descending)
    this.entries.sort((a, b) => b.score - a.score);
    
    // Update ranks
    this.entries.forEach((entry, index) => {
        entry.rank = index + 1;
    });
    
    return this.save();
};

leaderboardSchema.methods.updateAthleteScore = function(athleteId, newScore, additionalData = {}) {
    const entryIndex = this.entries.findIndex(entry => 
        entry.athlete.toString() === athleteId.toString()
    );
    
    if (entryIndex >= 0) {
        // Update existing entry
        const oldScore = this.entries[entryIndex].score;
        this.entries[entryIndex] = {
            ...this.entries[entryIndex],
            ...additionalData,
            score: newScore,
            improvement: newScore - oldScore,
            lastUpdated: new Date()
        };
        
        // Re-sort and update ranks
        this.entries.sort((a, b) => b.score - a.score);
        this.entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });
        
        return this.save();
    }
    
    return Promise.reject(new Error('Athlete not found in leaderboard'));
};

leaderboardSchema.methods.removeAthlete = function(athleteId) {
    this.entries = this.entries.filter(entry => 
        entry.athlete.toString() !== athleteId.toString()
    );
    
    // Update ranks after removal
    this.entries.forEach((entry, index) => {
        entry.rank = index + 1;
    });
    
    return this.save();
};

leaderboardSchema.methods.getAthleteRank = function(athleteId) {
    const entry = this.entries.find(entry => 
        entry.athlete.toString() === athleteId.toString()
    );
    
    return entry ? entry.rank : null;
};

leaderboardSchema.methods.getTopAthletes = function(limit = 10) {
    return this.entries
        .slice(0, limit)
        .map(entry => ({
            rank: entry.rank,
            athlete: entry.athlete,
            score: entry.score,
            totalVideos: entry.totalVideos,
            averageScore: entry.averageScore,
            bestScore: entry.bestScore,
            improvement: entry.improvement,
            lastUpdated: entry.lastUpdated
        }));
};

leaderboardSchema.methods.getAthleteStats = function(athleteId) {
    const entry = this.entries.find(entry => 
        entry.athlete.toString() === athleteId.toString()
    );
    
    if (!entry) {
        return null;
    }
    
    return {
        rank: entry.rank,
        score: entry.score,
        totalVideos: entry.totalVideos,
        averageScore: entry.averageScore,
        bestScore: entry.bestScore,
        improvement: entry.improvement,
        lastUpdated: entry.lastUpdated
    };
};

// Static methods
leaderboardSchema.statics.findBySportsAndLevel = function(sports, level) {
    return this.findOne({ 
        sports: sports, 
        level: level, 
        isActive: true 
    }).populate('entries.athlete', 'name sports level');
};

leaderboardSchema.statics.createOrUpdate = async function(sports, level, athleteData) {
    let leaderboard = await this.findOne({ 
        sports: sports, 
        level: level, 
        isActive: true 
    });
    
    if (!leaderboard) {
        leaderboard = new this({
            sports: sports,
            level: level,
            entries: []
        });
    }
    
    await leaderboard.addAthlete(athleteData);
    return leaderboard;
};

leaderboardSchema.statics.getGlobalLeaderboard = function(limit = 100) {
    return this.find({ isActive: true })
        .populate('entries.athlete', 'name sports level')
        .sort({ lastUpdated: -1 })
        .limit(limit);
};

leaderboardSchema.statics.getAthleteLeaderboard = function(athleteId, limit = 20) {
    return this.find({ 
        'entries.athlete': athleteId,
        isActive: true 
    })
    .populate('entries.athlete', 'name sports level')
    .sort({ lastUpdated: -1 })
    .limit(limit);
};

leaderboardSchema.statics.getLeaderboardStats = function(sports, level = null) {
    const query = { sports: sports, isActive: true };
    if (level) {
        query.level = level;
    }
    
    return this.findOne(query).then(leaderboard => {
        if (!leaderboard || leaderboard.entries.length === 0) {
            return {
                totalAthletes: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0
            };
        }
        
        const scores = leaderboard.entries.map(entry => entry.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        return {
            totalAthletes: leaderboard.totalAthletes,
            averageScore: Math.round(averageScore),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            sports: sports,
            level: level
        };
    });
};

// Export the model
module.exports = mongoose.model('Leaderboard', leaderboardSchema);

