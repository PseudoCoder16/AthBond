const mongoose = require('mongoose');

const videoAnalysisSchema = new mongoose.Schema({
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete',
        required: [true, 'Athlete reference is required']
    },
    videoPath: {
        type: String,
        required: [true, 'Video path is required']
    },
    videoName: {
        type: String,
        required: [true, 'Video name is required']
    },
    videoSize: {
        type: Number,
        required: true
    },
    videoDuration: {
        type: Number,
        required: true
    },
    totalFrames: {
        type: Number,
        required: true
    },
    sports: {
        type: String,
        required: [true, 'Sports category is required'],
        enum: ['Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Cricket', 'Volleyball', 'Badminton', 'Other']
    },
    analysis: {
        formScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        performanceScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        techniqueScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        movementScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        consistencyScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        balanceScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        postureScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        sportsSpecificScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    cheatDetection: {
        detected: {
            type: Boolean,
            default: false
        },
        confidence: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },
        cheatingScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        },
        detectedPatterns: [{
            type: String
        }],
        riskFactors: [{
            type: String
        }],
        recommendations: [{
            type: String
        }]
    },
    poseData: {
        keypoints: [{
            x: Number,
            y: Number,
            confidence: Number,
            name: String
        }],
        quality: {
            quality: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor']
            },
            score: {
                type: Number,
                min: 0,
                max: 100
            },
            issues: [{
                type: String
            }]
        }
    },
    leaderboard: {
        rank: {
            type: Number,
            default: null
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        totalAthletes: {
            type: Number,
            required: true
        },
        improvement: {
            type: Number,
            default: 0
        }
    },
    injuryRisk: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    processingTime: {
        type: Number,
        required: true // in milliseconds
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },
    error: {
        message: String,
        code: String,
        timestamp: Date
    },
    visualization: {
        poseImage: String,
        performanceChart: String,
        cheatReport: String,
        comprehensiveReport: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
videoAnalysisSchema.index({ athlete: 1, createdAt: -1 });
videoAnalysisSchema.index({ sports: 1, 'analysis.performanceScore': -1 });
videoAnalysisSchema.index({ 'cheatDetection.detected': 1 });
videoAnalysisSchema.index({ status: 1 });
videoAnalysisSchema.index({ createdAt: -1 });

// Virtual for overall score
videoAnalysisSchema.virtual('overallScore').get(function() {
    return this.analysis.performanceScore;
});

// Virtual for isCheating
videoAnalysisSchema.virtual('isCheating').get(function() {
    return this.cheatDetection.detected;
});

// Pre-save middleware
videoAnalysisSchema.pre('save', function(next) {
    // Update last modified date
    this.updatedAt = new Date();
    next();
});

// Instance methods
videoAnalysisSchema.methods.markAsCompleted = function() {
    this.status = 'completed';
    return this.save();
};

videoAnalysisSchema.methods.markAsFailed = function(error) {
    this.status = 'failed';
    this.error = {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date()
    };
    return this.save();
};

videoAnalysisSchema.methods.getAnalysisSummary = function() {
    return {
        id: this._id,
        athlete: this.athlete,
        sports: this.sports,
        overallScore: this.overallScore,
        formScore: this.analysis.formScore,
        techniqueScore: this.analysis.techniqueScore,
        movementScore: this.analysis.movementScore,
        consistencyScore: this.analysis.consistencyScore,
        isCheating: this.isCheating,
        cheatConfidence: this.cheatDetection.confidence,
        injuryRisk: this.injuryRisk,
        rank: this.leaderboard.rank,
        improvement: this.leaderboard.improvement,
        confidence: this.confidence,
        createdAt: this.createdAt
    };
};

videoAnalysisSchema.methods.getDetailedAnalysis = function() {
    return {
        id: this._id,
        athlete: this.athlete,
        videoPath: this.videoPath,
        videoName: this.videoName,
        videoDuration: this.videoDuration,
        totalFrames: this.totalFrames,
        sports: this.sports,
        analysis: this.analysis,
        cheatDetection: this.cheatDetection,
        poseData: this.poseData,
        leaderboard: this.leaderboard,
        injuryRisk: this.injuryRisk,
        confidence: this.confidence,
        processingTime: this.processingTime,
        status: this.status,
        visualization: this.visualization,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// Static methods
videoAnalysisSchema.statics.findByAthlete = function(athleteId, limit = 20) {
    return this.find({ athlete: athleteId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('athlete', 'name sports level');
};

videoAnalysisSchema.statics.findBySports = function(sports, limit = 50) {
    return this.find({ sports: sports, status: 'completed' })
        .sort({ 'analysis.performanceScore': -1 })
        .limit(limit)
        .populate('athlete', 'name sports level');
};

videoAnalysisSchema.statics.getCheatDetected = function(limit = 20) {
    return this.find({ 'cheatDetection.detected': true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('athlete', 'name sports level');
};

videoAnalysisSchema.statics.getPerformanceStats = function(athleteId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.find({
        athlete: athleteId,
        status: 'completed',
        createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
};

videoAnalysisSchema.statics.getLeaderboardData = function(sports, limit = 50) {
    return this.find({ 
        sports: sports, 
        status: 'completed' 
    })
    .sort({ 'analysis.performanceScore': -1 })
    .limit(limit)
    .populate('athlete', 'name sports level')
    .select('athlete analysis.performanceScore leaderboard.rank leaderboard.improvement createdAt');
};

// Export the model
module.exports = mongoose.model('VideoAnalysis', videoAnalysisSchema);

