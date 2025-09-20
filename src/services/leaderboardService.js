const fs = require('fs');
const path = require('path');
const { readAthletes, writeAthletes } = require('../config/database');

class LeaderboardService {
    constructor() {
        this.leaderboardFile = path.join(__dirname, '../../leaderboard.json');
        this.performanceHistoryFile = path.join(__dirname, '../../performance_history.json');
        this.initializeFiles();
    }

    // Initialize leaderboard files
    initializeFiles() {
        if (!fs.existsSync(this.leaderboardFile)) {
            fs.writeFileSync(this.leaderboardFile, JSON.stringify({}, null, 2));
        }
        if (!fs.existsSync(this.performanceHistoryFile)) {
            fs.writeFileSync(this.performanceHistoryFile, JSON.stringify({}, null, 2));
        }
    }

    // Update athlete score in leaderboard
    async updateAthleteScore(athleteId, videoAnalysis, sports) {
        try {
            console.log(`Updating leaderboard score for athlete ${athleteId}, sports: ${sports}`);

            // Load current leaderboard
            const leaderboard = this.loadLeaderboard();
            const performanceHistory = this.loadPerformanceHistory();

            // Calculate new score
            const newScore = this.calculateLeaderboardScore(videoAnalysis, sports);
            
            // Get athlete info
            const athlete = readAthletes().find(a => a.id === athleteId);
            if (!athlete) {
                throw new Error('Athlete not found');
            }

            // Update athlete's performance history
            this.updatePerformanceHistory(athleteId, newScore, videoAnalysis, performanceHistory);

            // Update leaderboard
            this.updateLeaderboardEntry(athleteId, athlete, newScore, sports, leaderboard);

            // Save updated data
            this.saveLeaderboard(leaderboard);
            this.savePerformanceHistory(performanceHistory);

            // Calculate new rank
            const rank = this.calculateRank(athleteId, sports, leaderboard);

            return {
                success: true,
                score: newScore,
                rank: rank,
                totalAthletes: this.getTotalAthletes(sports, leaderboard),
                improvement: this.calculateImprovement(athleteId, performanceHistory)
            };
        } catch (error) {
            console.error('Error updating athlete score:', error);
            throw new Error('Failed to update leaderboard score');
        }
    }

    // Calculate leaderboard score based on video analysis
    calculateLeaderboardScore(videoAnalysis, sports) {
        const metrics = videoAnalysis.performanceMetrics;
        const overallScore = videoAnalysis.overallScore;

        // Base score from video analysis
        let score = overallScore;

        // Apply sports-specific multipliers
        const sportsMultiplier = this.getSportsMultiplier(sports);
        score *= sportsMultiplier;

        // Apply consistency bonus/penalty
        const consistencyBonus = this.calculateConsistencyBonus(metrics.consistency);
        score += consistencyBonus;

        // Apply form quality bonus
        const formBonus = this.calculateFormBonus(metrics.form);
        score += formBonus;

        // Apply technique bonus
        const techniqueBonus = this.calculateTechniqueBonus(metrics.technique);
        score += techniqueBonus;

        // Apply cheat detection penalty
        const cheatPenalty = videoAnalysis.cheatDetected ? -20 : 0;
        score += cheatPenalty;

        // Ensure score is within valid range
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Get sports-specific multiplier
    getSportsMultiplier(sports) {
        const multipliers = {
            'football': 1.0,
            'basketball': 1.05,
            'tennis': 1.1,
            'swimming': 0.95,
            'athletics': 1.0,
            'cricket': 1.05,
            'volleyball': 1.0,
            'badminton': 1.08
        };
        return multipliers[sports.toLowerCase()] || 1.0;
    }

    // Calculate consistency bonus
    calculateConsistencyBonus(consistency) {
        if (consistency >= 90) return 5;
        if (consistency >= 80) return 3;
        if (consistency >= 70) return 1;
        if (consistency < 50) return -5;
        return 0;
    }

    // Calculate form bonus
    calculateFormBonus(form) {
        if (form >= 95) return 3;
        if (form >= 90) return 2;
        if (form >= 85) return 1;
        return 0;
    }

    // Calculate technique bonus
    calculateTechniqueBonus(technique) {
        if (technique >= 95) return 2;
        if (technique >= 90) return 1;
        return 0;
    }

    // Update performance history
    updatePerformanceHistory(athleteId, score, videoAnalysis, performanceHistory) {
        const timestamp = new Date().toISOString();
        
        if (!performanceHistory[athleteId]) {
            performanceHistory[athleteId] = [];
        }

        performanceHistory[athleteId].push({
            timestamp: timestamp,
            score: score,
            formScore: videoAnalysis.performanceMetrics.form,
            techniqueScore: videoAnalysis.performanceMetrics.technique,
            movementScore: videoAnalysis.performanceMetrics.movement,
            balanceScore: videoAnalysis.performanceMetrics.balance,
            postureScore: videoAnalysis.performanceMetrics.posture,
            consistencyScore: videoAnalysis.performanceMetrics.consistency,
            cheatDetected: videoAnalysis.cheatDetected || false,
            videoDuration: videoAnalysis.videoDuration,
            totalFrames: videoAnalysis.totalFrames
        });

        // Keep only last 50 performances
        if (performanceHistory[athleteId].length > 50) {
            performanceHistory[athleteId] = performanceHistory[athleteId].slice(-50);
        }
    }

    // Update leaderboard entry
    updateLeaderboardEntry(athleteId, athlete, score, sports, leaderboard) {
        const sportsKey = sports.toLowerCase();
        
        if (!leaderboard[sportsKey]) {
            leaderboard[sportsKey] = [];
        }

        // Find existing entry
        const existingIndex = leaderboard[sportsKey].findIndex(entry => entry.athleteId === athleteId);
        
        const entry = {
            athleteId: athleteId,
            name: athlete.name,
            sports: sports,
            level: athlete.level,
            score: score,
            lastUpdated: new Date().toISOString(),
            totalVideos: this.getTotalVideos(athleteId),
            averageScore: this.calculateAverageScore(athleteId),
            bestScore: this.getBestScore(athleteId),
            improvement: this.calculateImprovement(athleteId)
        };

        if (existingIndex >= 0) {
            leaderboard[sportsKey][existingIndex] = entry;
        } else {
            leaderboard[sportsKey].push(entry);
        }

        // Sort by score (descending)
        leaderboard[sportsKey].sort((a, b) => b.score - a.score);
    }

    // Get leaderboard for specific sports
    getLeaderboardBySports(sports, limit = 50) {
        const leaderboard = this.loadLeaderboard();
        const sportsKey = sports.toLowerCase();
        
        if (!leaderboard[sportsKey]) {
            return [];
        }

        return leaderboard[sportsKey].slice(0, limit).map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            sports: entry.sports,
            level: entry.level,
            score: entry.score,
            totalVideos: entry.totalVideos,
            averageScore: entry.averageScore,
            bestScore: entry.bestScore,
            improvement: entry.improvement,
            lastUpdated: entry.lastUpdated
        }));
    }

    // Get athlete stats
    getAthleteStats(athleteId) {
        const performanceHistory = this.loadPerformanceHistory();
        const history = performanceHistory[athleteId] || [];

        if (history.length === 0) {
            return {
                totalVideos: 0,
                averageScore: 0,
                bestScore: 0,
                rank: null,
                improvement: 0,
                lastVideoScore: 0,
                lastVideoDate: null
            };
        }

        const totalVideos = history.length;
        const averageScore = history.reduce((sum, entry) => sum + entry.score, 0) / totalVideos;
        const bestScore = Math.max(...history.map(entry => entry.score));
        const lastVideo = history[history.length - 1];

        // Calculate improvement (last 5 videos vs previous 5)
        const improvement = this.calculateImprovement(athleteId);

        return {
            totalVideos: totalVideos,
            averageScore: Math.round(averageScore),
            bestScore: bestScore,
            rank: this.calculateRank(athleteId),
            improvement: improvement,
            lastVideoScore: lastVideo.score,
            lastVideoDate: lastVideo.timestamp
        };
    }

    // Calculate athlete rank
    calculateRank(athleteId, sports = null, leaderboard = null) {
        if (!leaderboard) {
            leaderboard = this.loadLeaderboard();
        }

        if (sports) {
            // Calculate rank for specific sports
            const sportsKey = sports.toLowerCase();
            if (!leaderboard[sportsKey]) return null;
            
            const index = leaderboard[sportsKey].findIndex(entry => entry.athleteId === athleteId);
            return index >= 0 ? index + 1 : null;
        } else {
            // Calculate overall rank across all sports
            const athlete = readAthletes().find(a => a.id === athleteId);
            if (!athlete) return null;

            const sportsKey = athlete.sports.toLowerCase();
            if (!leaderboard[sportsKey]) return null;
            
            const index = leaderboard[sportsKey].findIndex(entry => entry.athleteId === athleteId);
            return index >= 0 ? index + 1 : null;
        }
    }

    // Calculate improvement over time
    calculateImprovement(athleteId) {
        const performanceHistory = this.loadPerformanceHistory();
        const history = performanceHistory[athleteId] || [];

        if (history.length < 2) return 0;

        // Compare last 5 videos with previous 5 videos
        const recentVideos = history.slice(-5);
        const previousVideos = history.slice(-10, -5);

        if (recentVideos.length === 0 || previousVideos.length === 0) return 0;

        const recentAvg = recentVideos.reduce((sum, entry) => sum + entry.score, 0) / recentVideos.length;
        const previousAvg = previousVideos.reduce((sum, entry) => sum + entry.score, 0) / previousVideos.length;

        return Math.round(recentAvg - previousAvg);
    }

    // Get total videos for athlete
    getTotalVideos(athleteId) {
        const performanceHistory = this.loadPerformanceHistory();
        const history = performanceHistory[athleteId] || [];
        return history.length;
    }

    // Calculate average score for athlete
    calculateAverageScore(athleteId) {
        const performanceHistory = this.loadPerformanceHistory();
        const history = performanceHistory[athleteId] || [];

        if (history.length === 0) return 0;

        const average = history.reduce((sum, entry) => sum + entry.score, 0) / history.length;
        return Math.round(average);
    }

    // Get best score for athlete
    getBestScore(athleteId) {
        const performanceHistory = this.loadPerformanceHistory();
        const history = performanceHistory[athleteId] || [];

        if (history.length === 0) return 0;

        return Math.max(...history.map(entry => entry.score));
    }

    // Get total athletes for sports
    getTotalAthletes(sports, leaderboard = null) {
        if (!leaderboard) {
            leaderboard = this.loadLeaderboard();
        }

        const sportsKey = sports.toLowerCase();
        return leaderboard[sportsKey] ? leaderboard[sportsKey].length : 0;
    }

    // Get global leaderboard (all sports combined)
    getGlobalLeaderboard(limit = 100) {
        const leaderboard = this.loadLeaderboard();
        const allAthletes = [];

        // Combine all sports
        Object.keys(leaderboard).forEach(sports => {
            leaderboard[sports].forEach(entry => {
                allAthletes.push({
                    ...entry,
                    sports: sports
                });
            });
        });

        // Sort by score and return top athletes
        allAthletes.sort((a, b) => b.score - a.score);
        
        return allAthletes.slice(0, limit).map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            sports: entry.sports,
            level: entry.level,
            score: entry.score,
            totalVideos: entry.totalVideos,
            averageScore: entry.averageScore,
            bestScore: entry.bestScore,
            improvement: entry.improvement
        }));
    }

    // Get performance trends for athlete
    getPerformanceTrends(athleteId, days = 30) {
        const performanceHistory = this.loadPerformanceHistory();
        const history = performanceHistory[athleteId] || [];

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentHistory = history.filter(entry => 
            new Date(entry.timestamp) >= cutoffDate
        );

        return {
            period: `${days} days`,
            totalVideos: recentHistory.length,
            averageScore: recentHistory.length > 0 ? 
                Math.round(recentHistory.reduce((sum, entry) => sum + entry.score, 0) / recentHistory.length) : 0,
            bestScore: recentHistory.length > 0 ? Math.max(...recentHistory.map(entry => entry.score)) : 0,
            improvement: this.calculateImprovement(athleteId),
            trend: this.calculateTrend(recentHistory)
        };
    }

    // Calculate performance trend
    calculateTrend(history) {
        if (history.length < 2) return 'stable';

        const firstHalf = history.slice(0, Math.floor(history.length / 2));
        const secondHalf = history.slice(Math.floor(history.length / 2));

        const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.score, 0) / secondHalf.length;

        const difference = secondAvg - firstAvg;

        if (difference > 5) return 'improving';
        if (difference < -5) return 'declining';
        return 'stable';
    }

    // Load leaderboard data
    loadLeaderboard() {
        try {
            const data = fs.readFileSync(this.leaderboardFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return {};
        }
    }

    // Save leaderboard data
    saveLeaderboard(leaderboard) {
        try {
            fs.writeFileSync(this.leaderboardFile, JSON.stringify(leaderboard, null, 2));
        } catch (error) {
            console.error('Error saving leaderboard:', error);
            throw new Error('Failed to save leaderboard');
        }
    }

    // Load performance history
    loadPerformanceHistory() {
        try {
            const data = fs.readFileSync(this.performanceHistoryFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading performance history:', error);
            return {};
        }
    }

    // Save performance history
    savePerformanceHistory(performanceHistory) {
        try {
            fs.writeFileSync(this.performanceHistoryFile, JSON.stringify(performanceHistory, null, 2));
        } catch (error) {
            console.error('Error saving performance history:', error);
            throw new Error('Failed to save performance history');
        }
    }

    // Get leaderboard statistics
    getLeaderboardStats(sports = null) {
        const leaderboard = this.loadLeaderboard();
        
        if (sports) {
            const sportsKey = sports.toLowerCase();
            const athletes = leaderboard[sportsKey] || [];
            
            if (athletes.length === 0) {
                return {
                    totalAthletes: 0,
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0
                };
            }

            const scores = athletes.map(athlete => athlete.score);
            const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

            return {
                totalAthletes: athletes.length,
                averageScore: Math.round(averageScore),
                highestScore: Math.max(...scores),
                lowestScore: Math.min(...scores),
                sports: sports
            };
        } else {
            // Global stats
            const allAthletes = [];
            Object.keys(leaderboard).forEach(sports => {
                allAthletes.push(...leaderboard[sports]);
            });

            if (allAthletes.length === 0) {
                return {
                    totalAthletes: 0,
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0
                };
            }

            const scores = allAthletes.map(athlete => athlete.score);
            const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

            return {
                totalAthletes: allAthletes.length,
                averageScore: Math.round(averageScore),
                highestScore: Math.max(...scores),
                lowestScore: Math.min(...scores)
            };
        }
    }
}

module.exports = new LeaderboardService();

