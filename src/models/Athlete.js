const mongoose = require('mongoose');

const athleteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [10, 'Age must be at least 10'],
        max: [100, 'Age cannot exceed 100']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Other']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    sports: {
        type: String,
        required: [true, 'Sports category is required'],
        enum: ['Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Cricket', 'Volleyball', 'Badminton', 'Hockey', 'Table Tennis', 'Other']
    },
    level: {
        type: String,
        required: [true, 'Level is required'],
        enum: ['National', 'State', 'District', 'Local']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                // Check if phone is not undefined/null and matches 10 digits
                return v && v !== 'undefined' && /^[0-9]{10}$/.test(v);
            },
            message: 'Please enter a valid 10-digit phone number'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    profileImage: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    totalVideos: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    bestScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    currentRank: {
        type: Number,
        default: null
    },
    improvement: {
        type: Number,
        default: 0
    },
    achievements: [{
        title: String,
        description: String,
        date: Date,
        score: Number
    }],
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        privacy: {
            showProfile: { type: Boolean, default: true },
            showScores: { type: Boolean, default: true },
            showRank: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
athleteSchema.index({ email: 1 });
athleteSchema.index({ sports: 1, level: 1 });
athleteSchema.index({ averageScore: -1 });
athleteSchema.index({ createdAt: -1 });

// Virtual for full name
athleteSchema.virtual('fullName').get(function() {
    return this.name;
});

// Virtual for age group
athleteSchema.virtual('ageGroup').get(function() {
    if (this.age < 18) return 'Junior';
    if (this.age < 25) return 'Young Adult';
    if (this.age < 35) return 'Adult';
    return 'Senior';
});

// Pre-save middleware
athleteSchema.pre('save', function(next) {
    // Update last modified date
    this.updatedAt = new Date();
    next();
});

// Instance methods
athleteSchema.methods.updateScore = function(newScore) {
    this.totalVideos += 1;
    
    // Calculate new average score
    const totalPoints = this.averageScore * (this.totalVideos - 1) + newScore;
    this.averageScore = Math.round(totalPoints / this.totalVideos);
    
    // Update best score if new score is higher
    if (newScore > this.bestScore) {
        this.bestScore = newScore;
    }
    
    return this.save();
};

athleteSchema.methods.addAchievement = function(achievement) {
    this.achievements.push({
        ...achievement,
        date: new Date()
    });
    return this.save();
};

athleteSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        name: this.name,
        age: this.age,
        gender: this.gender,
        sports: this.sports,
        level: this.level,
        totalVideos: this.totalVideos,
        averageScore: this.averageScore,
        bestScore: this.bestScore,
        currentRank: this.currentRank,
        improvement: this.improvement,
        achievements: this.achievements,
        createdAt: this.createdAt
    };
};

// Static methods
athleteSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

athleteSchema.statics.findBySports = function(sports, limit = 50) {
    return this.find({ sports: sports, isActive: true })
        .sort({ averageScore: -1 })
        .limit(limit);
};

athleteSchema.statics.getLeaderboard = function(sports, level = null, limit = 50) {
    const query = { sports: sports, isActive: true };
    if (level) {
        query.level = level;
    }
    
    return this.find(query)
        .sort({ averageScore: -1 })
        .limit(limit)
        .select('name sports level averageScore bestScore totalVideos currentRank');
};

athleteSchema.statics.getTopPerformers = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ averageScore: -1 })
        .limit(limit)
        .select('name sports level averageScore bestScore');
};

// Export the model
module.exports = mongoose.model('Athlete', athleteSchema);

