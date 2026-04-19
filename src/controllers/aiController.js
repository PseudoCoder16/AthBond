const aiOrchestrationService = require('../services/aiOrchestrationService');

class AIController {
    async analyzeVideo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Video file is required' });
            }

            const athleteId = req.body.athleteId || req.session?.athleteId;
            const sport = req.body.sport;
            const result = await aiOrchestrationService.analyzeVideo({
                athleteId,
                videoPath: req.file.path,
                sport
            });

            return res.json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Document file is required' });
            }
            const athleteId = req.body.athleteId || req.session?.athleteId;
            const document = await aiOrchestrationService.uploadCoachDocument(req.file, athleteId);
            return res.json({ success: true, document });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async coachQuery(req, res) {
        try {
            const { question } = req.body;
            if (!question) {
                return res.status(400).json({ success: false, message: 'question is required' });
            }
            const result = await aiOrchestrationService.coachQuery(question);

            if (result?.fallback) {
                return res.json({
                    success: true,
                    data: {
                        answer: result.answer,
                        sources: result.sources || [],
                        fallback: true
                    }
                });
            }

            return res.json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getTrainingPlan(req, res) {
        try {
            const plan = await aiOrchestrationService.getLatestTrainingPlan(req.params.athleteId);
            if (!plan) {
                return res.status(404).json({ success: false, message: 'Training plan not found' });
            }
            return res.json({ success: true, data: plan });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AIController();
