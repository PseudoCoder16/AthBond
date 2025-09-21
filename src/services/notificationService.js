class NotificationService {
    constructor() {
        this.notifications = new Map(); // Store notifications by user ID
    }

    // Send notification to athlete
    sendToAthlete(athleteId, message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };

        if (!this.notifications.has(athleteId)) {
            this.notifications.set(athleteId, []);
        }

        this.notifications.get(athleteId).push(notification);
        return notification;
    }

    // Send notification to coach
    sendToCoach(coachId, message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };

        if (!this.notifications.has(coachId)) {
            this.notifications.set(coachId, []);
        }

        this.notifications.get(coachId).push(notification);
        return notification;
    }

    // Get notifications for user
    getNotifications(userId) {
        return this.notifications.get(userId) || [];
    }

    // Mark notification as read
    markAsRead(userId, notificationId) {
        const userNotifications = this.notifications.get(userId);
        if (userNotifications) {
            const notification = userNotifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
            }
        }
    }

    // Mark all notifications as read
    markAllAsRead(userId) {
        const userNotifications = this.notifications.get(userId);
        if (userNotifications) {
            userNotifications.forEach(notification => {
                notification.read = true;
            });
        }
    }

    // Get unread count
    getUnreadCount(userId) {
        const userNotifications = this.notifications.get(userId) || [];
        return userNotifications.filter(n => !n.read).length;
    }

    // Clear old notifications (older than 30 days)
    clearOldNotifications() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        this.notifications.forEach((notifications, userId) => {
            const filteredNotifications = notifications.filter(
                notification => new Date(notification.timestamp) > thirtyDaysAgo
            );
            this.notifications.set(userId, filteredNotifications);
        });
    }

    // Send performance improvement notification
    sendPerformanceImprovement(athleteId, improvementData) {
        const message = `🎉 Great job! Your performance improved by ${improvementData.improvement}% in ${improvementData.sport}`;
        return this.sendToAthlete(athleteId, message, 'success');
    }

    // Send cheat detection alert
    sendCheatAlert(athleteId, cheatData) {
        const message = `⚠️ Unusual patterns detected in your recent video. Please ensure authentic performance.`;
        return this.sendToAthlete(athleteId, message, 'warning');
    }

    // Send injury risk alert
    sendInjuryRiskAlert(athleteId, riskLevel) {
        const message = `🏥 ${riskLevel} injury risk detected. Please consult with your coach.`;
        return this.sendToAthlete(athleteId, message, 'warning');
    }

    // Send leaderboard position change
    sendLeaderboardUpdate(athleteId, oldRank, newRank) {
        if (newRank < oldRank) {
            const message = `📈 Congratulations! You moved up ${oldRank - newRank} position(s) in the leaderboard!`;
            return this.sendToAthlete(athleteId, message, 'success');
        } else if (newRank > oldRank) {
            const message = `📉 You dropped ${newRank - oldRank} position(s) in the leaderboard. Keep practicing!`;
            return this.sendToAthlete(athleteId, message, 'info');
        }
    }

    // Send coach recommendation
    sendCoachRecommendation(athleteId, recommendation) {
        const message = `💡 Coach recommendation: ${recommendation}`;
        return this.sendToAthlete(athleteId, message, 'info');
    }

    // Send achievement notification
    sendAchievement(athleteId, achievement) {
        const message = `🏆 Achievement unlocked: ${achievement}`;
        return this.sendToAthlete(athleteId, message, 'success');
    }
}

module.exports = new NotificationService();
