const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        focusArea: { type: String, trim: true },
        frequencyPerWeek: { type: Number, min: 1, max: 14, default: 3 },
        durationMinutes: { type: Number, min: 5, max: 180, default: 20 },
        notes: { type: String, trim: true, default: '' }
    },
    { _id: false }
);

const trainingPlanSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Athlete',
            required: true
        },
        goal: { type: String, required: true, trim: true },
        targetScore: { type: Number, min: 0, max: 100 },
        baselineScore: { type: Number, min: 0, max: 100 },
        duration: { type: String, default: '2 weeks' },
        reasoning: { type: String, default: '' },
        exercises: { type: [exerciseSchema], default: [] },
        status: {
            type: String,
            enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
            default: 'ACTIVE'
        }
    },
    { timestamps: true }
);

trainingPlanSchema.index({ athleteId: 1, createdAt: -1 });

module.exports = mongoose.model('TrainingPlan', trainingPlanSchema);
