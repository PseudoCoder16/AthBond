const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

// Import configurations
const sessionConfig = require('./config/session');
const mongoDBService = require('./config/mongodbDatabase');

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const athleteRoutes = require('./routes/athleteRoutes');
const coachRoutes = require('./routes/coachRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = { app, PORT };
