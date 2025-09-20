const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [18, 'Age must be at least 18'],
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
    sportsGovtId: {
        type: String,
        required: [true, 'Sports Government ID is required'],
        unique: true,
        trim: true
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
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    totalAthletes: {
        type: Number,
        default: 0
    },
    totalVideosAnalyzed: {
        type: Number,
        default: 0
    },
    averageAthleteScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    experience: {
        years: {
            type: Number,
            default: 0,
            min: 0
        },
        description: {
            type: String,
            maxlength: [500, 'Experience description cannot exceed 500 characters']
        }
    },
    qualifications: [{
        title: String,
        institution: String,
        year: Number,
        certificate: String
    }],
    specializations: [{
        type: String,
        enum: ['Technique', 'Fitness', 'Mental Training', 'Nutrition', 'Recovery', 'Strategy', 'Other']
    }],
    achievements: [{
        title: String,
        description: String,
        date: Date,
        level: {
            type: String,
            enum: ['National', 'State', 'District', 'Local']
        }
    }],
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        privacy: {
            showProfile: { type: Boolean, default: true },
            showAthletes: { type: Boolean, default: true },
            showStats: { type: Boolean, default: true }
        }
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
coachSchema.index({ email: 1 });
coachSchema.index({ sportsGovtId: 1 });
coachSchema.index({ sports: 1 });
coachSchema.index({ isVerified: 1 });
coachSchema.index({ averageAthleteScore: -1 });

// Virtual for full name
coachSchema.virtual('fullName').get(function() {
    return this.name;
});

// Virtual for experience level
coachSchema.virtual('experienceLevel').get(function() {
    if (this.experience.years < 2) return 'Beginner';
    if (this.experience.years < 5) return 'Intermediate';
    if (this.experience.years < 10) return 'Advanced';
    return 'Expert';
});

// Pre-save middleware
coachSchema.pre('save', function(next) {
    // Update last modified date
    this.updatedAt = new Date();
    next();
});

// Instance methods
coachSchema.methods.updateAthleteCount = function() {
    return this.constructor.countDocuments({ 
        _id: this._id,
        isActive: true 
    });
};

coachSchema.methods.addQualification = function(qualification) {
    this.qualifications.push(qualification);
    return this.save();
};

coachSchema.methods.addAchievement = function(achievement) {
    this.achievements.push({
        ...achievement,
        date: new Date()
    });
    return this.save();
};

coachSchema.methods.updateRating = function(newRating) {
    const totalRating = this.rating.average * this.rating.count + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
    return this.save();
};

coachSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        name: this.name,
        age: this.age,
        gender: this.gender,
        sports: this.sports,
        experience: this.experience,
        qualifications: this.qualifications,
        specializations: this.specializations,
        achievements: this.achievements,
        rating: this.rating,
        totalAthletes: this.totalAthletes,
        averageAthleteScore: this.averageAthleteScore,
        isVerified: this.isVerified,
        createdAt: this.createdAt
    };
};

// Static methods
coachSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

coachSchema.statics.findBySportsGovtId = function(sportsGovtId) {
    return this.findOne({ sportsGovtId: sportsGovtId });
};

coachSchema.statics.findBySports = function(sports, limit = 50) {
    return this.find({ sports: sports, isActive: true, isVerified: true })
        .sort({ averageAthleteScore: -1 })
        .limit(limit);
};

coachSchema.statics.getTopCoaches = function(limit = 10) {
    return this.find({ isActive: true, isVerified: true })
        .sort({ averageAthleteScore: -1 })
        .limit(limit)
        .select('name sports experience rating averageAthleteScore totalAthletes');
};

coachSchema.statics.getVerifiedCoaches = function() {
    return this.find({ isActive: true, isVerified: true })
        .sort({ createdAt: -1 });
};

// Export the model
module.exports = mongoose.model('Coach', coachSchema);

