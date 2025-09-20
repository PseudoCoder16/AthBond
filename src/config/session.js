const session = require('express-session');

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'sports-athlete-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};

module.exports = sessionConfig;
