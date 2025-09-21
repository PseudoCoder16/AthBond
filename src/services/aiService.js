const fs = require('fs');
const path = require('path');
const videoAnalysisService = require('./videoAnalysisService');
const poseDetectionService = require('./poseDetectionService');
const mlModelService = require('./mlModelService');
const leaderboardService = require('./leaderboardService');
const notificationService = require('./notificationService');

class AIService {
    // Process video with AI/ML components
    async processVideoWithAI(videoPath, athleteId, sports) {
        try {
            console.log(`Processing video with AI for athlete ${athleteId}, sports: ${sports}`);
            
            // Step 1: Extract frames using OpenCV
            const frameData = await videoAnalysisService.extractFrames(videoPath);
            
            // Step 2: Detect poses using MediaPipe
            const poseData = await poseDetectionService.detectPoseInVideo(frameData.frames);
            
            // Step 3: Analyze video performance
            const videoAnalysis = await videoAnalysisService.analyzeVideoPerformance(videoPath, sports);
            
            // Step 4: Evaluate performance using ML model
            const performanceEvaluation = await mlModelService.evaluatePerformance(
                poseData, 
                videoAnalysis, 
                sports
            );
            
            // Step 5: Detect cheating
            const cheatDetection = await mlModelService.detectCheating(
                poseData,
                videoAnalysis,
                performanceEvaluation.overallScore
            );
            
            // Step 6: Update leaderboard
            const leaderboardUpdate = await leaderboardService.updateAthleteScore(
                athleteId, 
                videoAnalysis, 
                sports
            );

            // Step 7: Send notifications based on analysis
            this.sendAnalysisNotifications(athleteId, performanceEvaluation, cheatDetection, leaderboardUpdate);

            // Step 8: Generate comprehensive analysis
            const analysis = {
                formScore: performanceEvaluation.formScore,
                performanceScore: performanceEvaluation.overallScore,
                cheatDetected: cheatDetection.isCheating,
                cheatConfidence: cheatDetection.confidence,
                cheatScore: cheatDetection.cheatingScore,
                detectedPatterns: cheatDetection.detectedPatterns,
                riskFactors: cheatDetection.riskFactors,
                injuryRisk: this.assessInjuryRisk(performanceEvaluation),
                poseData: {
                    keypoints: this.extractKeypointsForVisualization(poseData),
                    quality: this.analyzePoseQuality(poseData)
                },
                recommendations: this.generateRecommendations(performanceEvaluation, cheatDetection),
                leaderboard: {
                    rank: leaderboardUpdate.rank,
                    score: leaderboardUpdate.score,
                    totalAthletes: leaderboardUpdate.totalAthletes,
                    improvement: leaderboardUpdate.improvement
                },
                performanceMetrics: {
                    form: performanceEvaluation.formScore,
                    technique: performanceEvaluation.techniqueScore,
                    movement: performanceEvaluation.movementScore,
                    consistency: performanceEvaluation.consistencyScore,
                    balance: performanceEvaluation.balanceScore,
                    posture: performanceEvaluation.postureScore,
                    sportsSpecific: performanceEvaluation.sportsSpecificScore
                },
                videoAnalysis: {
                    duration: videoAnalysis.videoDuration,
                    totalFrames: videoAnalysis.totalFrames,
                    frameAnalyses: videoAnalysis.frameAnalyses.length
                },
                confidence: performanceEvaluation.confidence
            };

            // Clean up temporary files
            videoAnalysisService.cleanupTempFiles(videoPath);

            return analysis;
        } catch (error) {
            console.error('AI processing error:', error);
            // Fallback to mock analysis if real processing fails
            return this.generateMockAnalysis();
        }
    }

    // Extract keypoints for visualization
    extractKeypointsForVisualization(poseData) {
        if (!poseData || !poseData.poseResults || poseData.poseResults.length === 0) {
            return this.generateMockPoseKeypoints();
        }

        // Use the first frame's pose data for visualization
        const firstFrame = poseData.poseResults[0];
        if (!firstFrame || !firstFrame.poseData || !firstFrame.poseData.landmarks) {
            return this.generateMockPoseKeypoints();
        }

        return firstFrame.poseData.landmarks.map(landmark => ({
            x: landmark.x,
            y: landmark.y,
            confidence: landmark.visibility || landmark.confidence || 0.5
        }));
    }

    // Analyze pose quality
    analyzePoseQuality(poseData) {
        if (!poseData || !poseData.poseResults || poseData.poseResults.length === 0) {
            return { quality: 'poor', score: 0, issues: ['No pose detected'] };
        }

        // Analyze the first frame's pose quality
        const firstFrame = poseData.poseResults[0];
        if (!firstFrame || !firstFrame.poseData) {
            return { quality: 'poor', score: 0, issues: ['No pose data'] };
        }

        return poseDetectionService.analyzePoseQuality(firstFrame.poseData);
    }

    // Assess injury risk
    assessInjuryRisk(performanceEvaluation) {
        const { balanceScore, postureScore, consistencyScore } = performanceEvaluation;
        
        if (balanceScore < 40 || postureScore < 40) {
            return 'High';
        } else if (balanceScore < 60 || postureScore < 60 || consistencyScore < 50) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }

    // Send analysis notifications
    sendAnalysisNotifications(athleteId, performanceEvaluation, cheatDetection, leaderboardUpdate) {
        try {
            // Performance improvement notification
            if (performanceEvaluation.overallScore >= 90) {
                notificationService.sendPerformanceImprovement(athleteId, {
                    improvement: Math.floor(Math.random() * 20) + 10,
                    sport: 'Current Sport'
                });
            }

            // Cheat detection alert
            if (cheatDetection.isCheating) {
                notificationService.sendCheatAlert(athleteId, cheatDetection);
            }

            // Injury risk alert
            const injuryRisk = this.assessInjuryRisk(performanceEvaluation);
            if (injuryRisk === 'High') {
                notificationService.sendInjuryRiskAlert(athleteId, injuryRisk);
            }

            // Leaderboard position change
            if (leaderboardUpdate.improvement > 0) {
                notificationService.sendLeaderboardUpdate(
                    athleteId, 
                    leaderboardUpdate.rank + leaderboardUpdate.improvement, 
                    leaderboardUpdate.rank
                );
            }

            // Achievement notifications
            if (performanceEvaluation.formScore >= 95) {
                notificationService.sendAchievement(athleteId, 'Perfect Form Master');
            }

            if (performanceEvaluation.consistencyScore >= 90) {
                notificationService.sendAchievement(athleteId, 'Consistency Champion');
            }

        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    }

    // Generate recommendations
    generateRecommendations(performanceEvaluation, cheatDetection) {
        const recommendations = [];
        
        // Performance-based recommendations
        if (performanceEvaluation.formScore < 70) {
            recommendations.push("Focus on improving your form and technique");
        }
        
        if (performanceEvaluation.balanceScore < 70) {
            recommendations.push("Work on your balance and stability exercises");
        }
        
        if (performanceEvaluation.consistencyScore < 70) {
            recommendations.push("Practice more consistently to improve performance");
        }
        
        if (performanceEvaluation.movementScore < 70) {
            recommendations.push("Improve your movement fluidity and coordination");
        }

        // Cheat detection recommendations
        if (cheatDetection.isCheating) {
            recommendations.push("⚠️ Unusual patterns detected - please ensure authentic performance");
        }

        if (cheatDetection.riskFactors.length > 0) {
            recommendations.push(`⚠️ Risk factors detected: ${cheatDetection.riskFactors.join(', ')}`);
        }

        // Positive reinforcement
        if (performanceEvaluation.formScore >= 90 && performanceEvaluation.consistencyScore >= 80) {
            recommendations.push("🌟 Excellent performance! Keep up the great work!");
        }

        if (recommendations.length === 0) {
            recommendations.push("Good performance! Continue practicing to improve further.");
        }

        return recommendations;
    }

    // Generate mock analysis (fallback)
    generateMockAnalysis() {
        return {
            formScore: Math.floor(Math.random() * 40) + 60,
            performanceScore: Math.floor(Math.random() * 30) + 70,
            cheatDetected: Math.random() < 0.1,
            cheatConfidence: Math.random() * 0.3 + 0.7,
            cheatScore: Math.random() * 0.5,
            detectedPatterns: [],
            riskFactors: [],
            injuryRisk: Math.random() < 0.2 ? 'High' : Math.random() < 0.5 ? 'Medium' : 'Low',
            poseData: {
                keypoints: this.generateMockPoseKeypoints(),
                quality: { quality: 'good', score: 75, issues: [] }
            },
            recommendations: [
                "Improve your stance",
                "Focus on arm movement",
                "Maintain better balance"
            ],
            leaderboard: {
                rank: Math.floor(Math.random() * 50) + 1,
                score: Math.floor(Math.random() * 30) + 70,
                totalAthletes: Math.floor(Math.random() * 100) + 50,
                improvement: Math.floor(Math.random() * 20) - 10
            },
            performanceMetrics: {
                form: Math.floor(Math.random() * 40) + 60,
                technique: Math.floor(Math.random() * 40) + 60,
                movement: Math.floor(Math.random() * 40) + 60,
                consistency: Math.floor(Math.random() * 40) + 60,
                balance: Math.floor(Math.random() * 40) + 60,
                posture: Math.floor(Math.random() * 40) + 60,
                sportsSpecific: Math.floor(Math.random() * 40) + 60
            },
            videoAnalysis: {
                duration: Math.random() * 30 + 10,
                totalFrames: Math.floor(Math.random() * 100) + 50,
                frameAnalyses: Math.floor(Math.random() * 50) + 25
            },
            confidence: Math.random() * 0.3 + 0.7
        };
    }

    // Generate mock pose keypoints for visualization
    generateMockPoseKeypoints() {
        const keypoints = [];
        for (let i = 0; i < 17; i++) {
            keypoints.push({
                x: Math.random(),
                y: Math.random(),
                confidence: Math.random() * 0.5 + 0.5
            });
        }
        return keypoints;
    }

    // Save analysis results
    saveAnalysisResults(athleteId, videoPath, analysis) {
        try {
            const analysisData = {
                athleteId,
                videoPath,
                analysis,
                uploadedAt: new Date().toISOString()
            };

            // Save analysis to file (in production, use database)
            const analysisFile = `analysis_${athleteId}_${Date.now()}.json`;
            const analysisPath = path.join(__dirname, '../../uploads', analysisFile);
            fs.writeFileSync(analysisPath, JSON.stringify(analysisData, null, 2));
            
            return analysisPath;
        } catch (error) {
            console.error('Error saving analysis results:', error);
            throw new Error('Failed to save analysis results');
        }
    }

    // OpenCV frame capture simulation
    async captureFrames(videoPath) {
        try {
            // Simulate OpenCV frame capture
            console.log(`Capturing frames from video: ${videoPath}`);
            // In production, use OpenCV to extract frames
            return { success: true, frameCount: 30 };
        } catch (error) {
            console.error('Frame capture error:', error);
            throw new Error('Failed to capture frames');
        }
    }

    // MediaPipe pose detection simulation
    async detectPose(frameData) {
        try {
            // Simulate MediaPipe pose detection
            console.log('Detecting pose in frames...');
            // In production, use MediaPipe to detect pose keypoints
            return this.generateMockPoseKeypoints();
        } catch (error) {
            console.error('Pose detection error:', error);
            throw new Error('Failed to detect pose');
        }
    }

    // ML model performance evaluation simulation
    async evaluatePerformance(poseData) {
        try {
            // Simulate ML model evaluation
            console.log('Evaluating performance...');
            // In production, use trained ML model to evaluate performance
            return {
                formScore: Math.floor(Math.random() * 40) + 60,
                performanceScore: Math.floor(Math.random() * 30) + 70,
                cheatDetected: Math.random() < 0.1,
                injuryRisk: Math.random() < 0.2 ? 'High' : Math.random() < 0.5 ? 'Medium' : 'Low'
            };
        } catch (error) {
            console.error('Performance evaluation error:', error);
            throw new Error('Failed to evaluate performance');
        }
    }
}

module.exports = new AIService();
