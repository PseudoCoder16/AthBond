const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { requireAthleteAuth, requireCoachAuth } = require('../middleware/auth');

// Get notifications for athlete
router.get('/api/athlete/notifications', requireAthleteAuth, (req, res) => {
    try {
        const athleteId = req.session.athleteId;
        const notifications = notificationService.getNotifications(athleteId);
        const unreadCount = notificationService.getUnreadCount(athleteId);
        
        res.json({
            success: true,
            notifications: notifications,
            unreadCount: unreadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load notifications'
        });
    }
});

// Get notifications for coach
router.get('/api/coach/notifications', requireCoachAuth, (req, res) => {
    try {
        const coachId = req.session.coachId;
        const notifications = notificationService.getNotifications(coachId);
        const unreadCount = notificationService.getUnreadCount(coachId);
        
        res.json({
            success: true,
            notifications: notifications,
            unreadCount: unreadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load notifications'
        });
    }
});

// Mark notification as read
router.put('/api/notifications/:notificationId/read', (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.session.athleteId || req.session.coachId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        notificationService.markAsRead(userId, parseInt(notificationId));
        
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read
router.put('/api/notifications/read-all', (req, res) => {
    try {
        const userId = req.session.athleteId || req.session.coachId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        notificationService.markAllAsRead(userId);
        
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark notifications as read'
        });
    }
});

// Send notification (for testing purposes)
router.post('/api/notifications/send', (req, res) => {
    try {
        const { userId, message, type, userType } = req.body;
        
        let notification;
        if (userType === 'athlete') {
            notification = notificationService.sendToAthlete(userId, message, type);
        } else if (userType === 'coach') {
            notification = notificationService.sendToCoach(userId, message, type);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type'
            });
        }
        
        res.json({
            success: true,
            message: 'Notification sent',
            notification: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send notification'
        });
    }
});

module.exports = router;
