const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class VisualizationService {
    constructor() {
        this.outputDir = path.join(__dirname, '../../uploads/visualizations');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    // Generate pose visualization with OpenCV
    async generatePoseVisualization(poseData, frameData, outputPath) {
        try {
            console.log('Generating pose visualization...');
            
            // Create visualization data
            const visualization = {
                keypoints: this.extractKeypoints(poseData),
                connections: this.getPoseConnections(),
                boundingBox: this.calculateBoundingBox(poseData),
                frameInfo: {
                    width: frameData.width || 640,
                    height: frameData.height || 480,
                    timestamp: frameData.timestamp || 0
                }
            };

            // Generate visualization image (simulated)
            const imagePath = await this.createVisualizationImage(visualization, outputPath);
            
            return {
                success: true,
                imagePath: imagePath,
                visualization: visualization
            };
        } catch (error) {
            console.error('Pose visualization error:', error);
            throw new Error('Failed to generate pose visualization');
        }
    }

    // Generate performance analysis visualization
    async generatePerformanceVisualization(analysis, outputPath) {
        try {
            console.log('Generating performance visualization...');
            
            const visualization = {
                scores: {
                    form: analysis.performanceMetrics.form,
                    technique: analysis.performanceMetrics.technique,
                    movement: analysis.performanceMetrics.movement,
                    consistency: analysis.performanceMetrics.consistency,
                    balance: analysis.performanceMetrics.balance,
                    posture: analysis.performanceMetrics.posture
                },
                overallScore: analysis.performanceScore,
                cheatDetection: {
                    detected: analysis.cheatDetected,
                    confidence: analysis.cheatConfidence,
                    score: analysis.cheatScore
                },
                recommendations: analysis.recommendations,
                leaderboard: analysis.leaderboard
            };

            // Generate performance chart (simulated)
            const chartPath = await this.createPerformanceChart(visualization, outputPath);
            
            return {
                success: true,
                chartPath: chartPath,
                visualization: visualization
            };
        } catch (error) {
            console.error('Performance visualization error:', error);
            throw new Error('Failed to generate performance visualization');
        }
    }

    // Generate cheat detection visualization
    async generateCheatDetectionVisualization(cheatData, outputPath) {
        try {
            console.log('Generating cheat detection visualization...');
            
            const visualization = {
                isCheating: cheatData.isCheating,
                confidence: cheatData.confidence,
                cheatingScore: cheatData.cheatingScore,
                detectedPatterns: cheatData.detectedPatterns,
                riskFactors: cheatData.riskFactors,
                recommendations: cheatData.recommendations,
                timeline: this.generateCheatTimeline(cheatData)
            };

            // Generate cheat detection report (simulated)
            const reportPath = await this.createCheatDetectionReport(visualization, outputPath);
            
            return {
                success: true,
                reportPath: reportPath,
                visualization: visualization
            };
        } catch (error) {
            console.error('Cheat detection visualization error:', error);
            throw new Error('Failed to generate cheat detection visualization');
        }
    }

    // Generate comprehensive analysis visualization
    async generateComprehensiveVisualization(analysis, outputPath) {
        try {
            console.log('Generating comprehensive analysis visualization...');
            
            const visualization = {
                pose: {
                    keypoints: analysis.poseData.keypoints,
                    quality: analysis.poseData.quality
                },
                performance: {
                    scores: analysis.performanceMetrics,
                    overall: analysis.performanceScore,
                    confidence: analysis.confidence
                },
                cheatDetection: {
                    detected: analysis.cheatDetected,
                    confidence: analysis.cheatConfidence,
                    patterns: analysis.detectedPatterns,
                    riskFactors: analysis.riskFactors
                },
                leaderboard: analysis.leaderboard,
                recommendations: analysis.recommendations,
                videoInfo: analysis.videoAnalysis
            };

            // Generate comprehensive report
            const reportPath = await this.createComprehensiveReport(visualization, outputPath);
            
            return {
                success: true,
                reportPath: reportPath,
                visualization: visualization
            };
        } catch (error) {
            console.error('Comprehensive visualization error:', error);
            throw new Error('Failed to generate comprehensive visualization');
        }
    }

    // Extract keypoints for visualization
    extractKeypoints(poseData) {
        if (!poseData || !poseData.landmarks) {
            return [];
        }

        return poseData.landmarks.map(landmark => ({
            x: landmark.x,
            y: landmark.y,
            confidence: landmark.visibility || landmark.confidence || 0.5,
            name: landmark.name || 'unknown'
        }));
    }

    // Get pose connections for drawing
    getPoseConnections() {
        return [
            // Face
            [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
            // Torso
            [11, 12], [11, 13], [12, 14], [11, 23], [12, 24], [23, 24],
            // Left arm
            [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], [19, 21],
            // Right arm
            [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [20, 22],
            // Left leg
            [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
            // Right leg
            [24, 26], [26, 28], [28, 30], [30, 32], [28, 32]
        ];
    }

    // Calculate bounding box
    calculateBoundingBox(poseData) {
        const keypoints = this.extractKeypoints(poseData);
        if (keypoints.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        const xs = keypoints.map(kp => kp.x);
        const ys = keypoints.map(kp => kp.y);

        return {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }

    // Generate cheat detection timeline
    generateCheatTimeline(cheatData) {
        // Simulate timeline data
        return [
            { timestamp: 0, event: 'Video analysis started', confidence: 0.8 },
            { timestamp: 5, event: 'Pose detection completed', confidence: 0.9 },
            { timestamp: 10, event: 'Performance evaluation', confidence: 0.85 },
            { timestamp: 15, event: 'Cheat detection analysis', confidence: cheatData.confidence },
            { timestamp: 20, event: 'Final assessment', confidence: cheatData.confidence }
        ];
    }

    // Create visualization image (simulated)
    async createVisualizationImage(visualization, outputPath) {
        try {
            // In production, use OpenCV to create actual visualization
            const imagePath = path.join(this.outputDir, `pose_${Date.now()}.png`);
            
            // Simulate image creation
            const imageData = {
                width: visualization.frameInfo.width,
                height: visualization.frameInfo.height,
                keypoints: visualization.keypoints,
                connections: visualization.connections,
                boundingBox: visualization.boundingBox
            };

            // Save visualization data
            fs.writeFileSync(imagePath.replace('.png', '.json'), JSON.stringify(imageData, null, 2));
            
            return imagePath;
        } catch (error) {
            console.error('Image creation error:', error);
            throw new Error('Failed to create visualization image');
        }
    }

    // Create performance chart (simulated)
    async createPerformanceChart(visualization, outputPath) {
        try {
            const chartPath = path.join(this.outputDir, `performance_${Date.now()}.json`);
            
            // Create chart data
            const chartData = {
                type: 'radar',
                data: {
                    labels: Object.keys(visualization.scores),
                    datasets: [{
                        label: 'Performance Scores',
                        data: Object.values(visualization.scores),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    scale: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            };

            fs.writeFileSync(chartPath, JSON.stringify(chartData, null, 2));
            return chartPath;
        } catch (error) {
            console.error('Chart creation error:', error);
            throw new Error('Failed to create performance chart');
        }
    }

    // Create cheat detection report (simulated)
    async createCheatDetectionReport(visualization, outputPath) {
        try {
            const reportPath = path.join(this.outputDir, `cheat_report_${Date.now()}.json`);
            
            const reportData = {
                summary: {
                    isCheating: visualization.isCheating,
                    confidence: visualization.confidence,
                    riskLevel: visualization.cheatingScore > 0.7 ? 'High' : 
                              visualization.cheatingScore > 0.4 ? 'Medium' : 'Low'
                },
                details: {
                    detectedPatterns: visualization.detectedPatterns,
                    riskFactors: visualization.riskFactors,
                    recommendations: visualization.recommendations
                },
                timeline: visualization.timeline,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
            return reportPath;
        } catch (error) {
            console.error('Report creation error:', error);
            throw new Error('Failed to create cheat detection report');
        }
    }

    // Create comprehensive report (simulated)
    async createComprehensiveReport(visualization, outputPath) {
        try {
            const reportPath = path.join(this.outputDir, `comprehensive_${Date.now()}.json`);
            
            const reportData = {
                summary: {
                    overallScore: visualization.performance.overall,
                    confidence: visualization.performance.confidence,
                    cheatDetected: visualization.cheatDetection.detected,
                    rank: visualization.leaderboard.rank
                },
                poseAnalysis: {
                    keypoints: visualization.pose.keypoints,
                    quality: visualization.pose.quality
                },
                performanceMetrics: visualization.performance.scores,
                cheatDetection: {
                    detected: visualization.cheatDetection.detected,
                    confidence: visualization.cheatDetection.confidence,
                    patterns: visualization.cheatDetection.patterns,
                    riskFactors: visualization.cheatDetection.riskFactors
                },
                leaderboard: visualization.leaderboard,
                recommendations: visualization.recommendations,
                videoInfo: visualization.videoInfo,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
            return reportPath;
        } catch (error) {
            console.error('Comprehensive report creation error:', error);
            throw new Error('Failed to create comprehensive report');
        }
    }

    // Generate HTML report
    async generateHTMLReport(analysis, outputPath) {
        try {
            const htmlPath = path.join(this.outputDir, `report_${Date.now()}.html`);
            
            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sports Performance Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .score { font-size: 2em; font-weight: bold; color: #4CAF50; }
        .warning { color: #ff9800; }
        .danger { color: #f44336; }
        .success { color: #4CAF50; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .card { background: #f9f9f9; padding: 15px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏆 Sports Performance Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>📊 Overall Performance</h2>
        <div class="score">${analysis.performanceScore}/100</div>
        <p>Confidence: ${Math.round(analysis.confidence * 100)}%</p>
    </div>

    <div class="section">
        <h2>🎯 Performance Metrics</h2>
        <div class="grid">
            <div class="card">
                <h3>Form</h3>
                <div class="score">${analysis.performanceMetrics.form}/100</div>
            </div>
            <div class="card">
                <h3>Technique</h3>
                <div class="score">${analysis.performanceMetrics.technique}/100</div>
            </div>
            <div class="card">
                <h3>Movement</h3>
                <div class="score">${analysis.performanceMetrics.movement}/100</div>
            </div>
            <div class="card">
                <h3>Consistency</h3>
                <div class="score">${analysis.performanceMetrics.consistency}/100</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🚨 Cheat Detection</h2>
        <p>Status: <span class="${analysis.cheatDetected ? 'danger' : 'success'}">${analysis.cheatDetected ? '⚠️ Suspicious Activity Detected' : '✅ Clean Performance'}</span></p>
        <p>Confidence: ${Math.round(analysis.cheatConfidence * 100)}%</p>
        ${analysis.detectedPatterns.length > 0 ? `<p>Detected Patterns: ${analysis.detectedPatterns.join(', ')}</p>` : ''}
    </div>

    <div class="section">
        <h2>🏅 Leaderboard</h2>
        <p>Your Rank: #${analysis.leaderboard.rank}</p>
        <p>Your Score: ${analysis.leaderboard.score}/100</p>
        <p>Total Athletes: ${analysis.leaderboard.totalAthletes}</p>
        <p>Improvement: ${analysis.leaderboard.improvement > 0 ? '+' : ''}${analysis.leaderboard.improvement}</p>
    </div>

    <div class="section">
        <h2>💡 Recommendations</h2>
        <ul>
            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;

            fs.writeFileSync(htmlPath, html);
            return htmlPath;
        } catch (error) {
            console.error('HTML report creation error:', error);
            throw new Error('Failed to create HTML report');
        }
    }

    // Clean up old visualizations
    cleanupOldVisualizations(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
        try {
            const files = fs.readdirSync(this.outputDir);
            const now = Date.now();

            files.forEach(file => {
                const filePath = path.join(this.outputDir, file);
                const stats = fs.statSync(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filePath);
                    console.log(`Cleaned up old visualization: ${file}`);
                }
            });
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }
}

module.exports = new VisualizationService();

