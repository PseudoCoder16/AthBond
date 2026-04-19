const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String, required: true },
        path: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Athlete',
            default: null
        },
        ingestionStatus: {
            type: String,
            enum: ['PENDING', 'INGESTED', 'FAILED'],
            default: 'PENDING'
        },
        metadata: {
            type: Object,
            default: {}
        }
    },
    { timestamps: true }
);

documentSchema.index({ createdAt: -1 });
documentSchema.index({ ingestionStatus: 1 });

module.exports = mongoose.model('Document', documentSchema);
