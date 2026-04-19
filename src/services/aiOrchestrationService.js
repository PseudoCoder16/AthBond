const mongoose = require('mongoose');
const PerformanceLog = require('../models/PerformanceLog');
const TrainingPlan = require('../models/TrainingPlan');
const Document = require('../models/Document');
const ruleEngineService = require('./ruleEngineService');
const intelligentAgentService = require('./intelligentAgentService');
const trainingRecommendationService = require('./trainingRecommendationService');
const fastApiClient = require('./fastApiClient');
const athleteService = require('./athleteService');

class AIOrchestrationService {
    async analyzeVideo({ athleteId, videoPath, sport }) {
        const fastApiResult = await fastApiClient.analyzeVideo(videoPath, { athleteId, sport });
        const poseScore = fastApiResult.pose_score || fastApiResult.poseScore || 0;
        const metrics = fastApiResult.metrics || {};
        const ruleResults = ruleEngineService.evaluateRules(metrics);

        if (!mongoose.Types.ObjectId.isValid(athleteId)) {
            return {
                poseScore,
                metrics,
                ruleResults,
                trainingPlan: null
            };
        }

        const history = await PerformanceLog.find({ athleteId }).sort({ createdAt: -1 }).limit(10).lean();
        const agentOutput = intelligentAgentService.buildPlanInput({ poseScore, ruleResults, history });

        const athlete = await athleteService.getAthleteById(athleteId);
        const planPayload = trainingRecommendationService.generatePlan({
            athlete,
            poseScore,
            ruleResults,
            agentOutput
        });

        const performanceLog = await PerformanceLog.create({
            athleteId,
            poseScore,
            sport: sport || athlete?.sports || 'General',
            metrics,
            ruleResults: ruleResults.triggeredRules,
            recommendations: ruleResults.recommendations
        });

        const trainingPlan = await TrainingPlan.create({
            athleteId,
            goal: planPayload.goal,
            targetScore: planPayload.targetScore,
            baselineScore: planPayload.baselineScore,
            duration: planPayload.duration,
            reasoning: planPayload.reasoning,
            exercises: planPayload.exercises
        });

        return {
            poseScore,
            metrics,
            ruleResults,
            performanceLog,
            trainingPlan
        };
    }

    async uploadCoachDocument(file, athleteId) {
        const document = await Document.create({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            uploadedBy: mongoose.Types.ObjectId.isValid(athleteId) ? athleteId : null
        });

        try {
            const result = await fastApiClient.ingestDocument(file.path, file.originalname);
            document.ingestionStatus = 'INGESTED';
            document.metadata = result;
        } catch (error) {
            document.ingestionStatus = 'FAILED';
            document.metadata = { error: error.message };
        }

        await document.save();
        return document;
    }

    async coachQuery(question) {
        return fastApiClient.coachQuery(question);
    }

    async getLatestTrainingPlan(athleteId) {
        if (!mongoose.Types.ObjectId.isValid(athleteId)) {
            return null;
        }
        return TrainingPlan.findOne({ athleteId }).sort({ createdAt: -1 }).lean();
    }
}

module.exports = new AIOrchestrationService();
