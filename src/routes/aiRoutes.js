const express = require('express');
const aiController = require('../controllers/aiController');
const { upload, documentUpload } = require('../config/upload');

const router = express.Router();

router.post('/ai/analyze-video', upload.single('video'), aiController.analyzeVideo);
router.post('/ai/upload-document', documentUpload.single('document'), aiController.uploadDocument);
router.post('/ai/coach-query', aiController.coachQuery);
router.get('/ai/training-plan/:athleteId', aiController.getTrainingPlan);

module.exports = router;
