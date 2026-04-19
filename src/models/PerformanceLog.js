const mongoose = require('mongoose');

const performanceLogSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Athlete',
            required: true
        },
        source: {
            type: String,
            enum: ['pose_analysis', 'manual', 'imported'],
            default: 'pose_analysis'
        },
        poseScore: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        sport: {
            type: String,
            trim: true,
            default: 'General'
        },
        metrics: {
            kneeAngle: Number,
            speed: Number,
            balance: Number,
            posture: Number
        },
        ruleResults: [
            {
                ruleId: String,
                severity: {
                    type: String,
                    enum: ['LOW', 'MEDIUM', 'HIGH']
                },
                message: String
            }
        ],
        recommendations: [String]
    },
    {
        timestamps: true
    }
);

performanceLogSchema.index({ athleteId: 1, createdAt: -1 });

module.exports = mongoose.model('PerformanceLog', performanceLogSchema);
