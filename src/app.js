const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');

// Import configurations
const sessionConfig = require('./config/session');
const mongoDBService = require('./config/mongodbDatabase');

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const { router: authRoutes, athletes } = require('./routes/simpleAuthRoutes');
const athleteRoutes = require('./routes/athleteRoutes');
const coachRoutes = require('./routes/coachRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;

// Load environment variables
require('dotenv').config();

// Initialize MongoDB
mongoDBService.initialize().catch(console.error);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Session configuration
app.use(session(sessionConfig));

// Routes
app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', athleteRoutes);
app.use('/', coachRoutes);
app.use('/', leaderboardRoutes);
app.use('/', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join athlete room
    socket.on('join-athlete', (athleteId) => {
        socket.join(`athlete-${athleteId}`);
        console.log(`Athlete ${athleteId} joined room`);
    });

    // Join coach room
    socket.on('join-coach', (coachId) => {
        socket.join(`coach-${coachId}`);
        console.log(`Coach ${coachId} joined room`);
    });

    // Handle video upload progress
    socket.on('video-upload-progress', (data) => {
        socket.to(`athlete-${data.athleteId}`).emit('upload-progress', data);
    });

    // Handle AI analysis progress
    socket.on('ai-analysis-progress', (data) => {
        socket.to(`athlete-${data.athleteId}`).emit('analysis-progress', data);
    });

    // Handle leaderboard updates
    socket.on('leaderboard-update', (data) => {
        io.emit('leaderboard-changed', data);
    });

    // Handle real-time notifications
    socket.on('send-notification', (data) => {
        if (data.type === 'athlete') {
            socket.to(`athlete-${data.athleteId}`).emit('notification', data);
        } else if (data.type === 'coach') {
            socket.to(`coach-${data.coachId}`).emit('notification', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io available to routes
app.set('io', io);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = { app, server, PORT };
