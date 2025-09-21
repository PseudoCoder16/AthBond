const express = require('express');
const path = require('path');
const router = express.Router();
const { requireAthleteAuth, requireCoachAuth } = require('../middleware/auth');

// Main pages
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/logo.html'));
});

router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Athlete pages
router.get('/athlete/login', (req, res) => {
    if (req.session.athleteId) {
        res.redirect('/athlete/home');
    } else {
        res.sendFile(path.join(__dirname, '../../public/athlete/login.html'));
    }
});

router.get('/athlete/signup', (req, res) => {
    if (req.session.athleteId) {
        res.redirect('/athlete/home');
    } else {
        res.sendFile(path.join(__dirname, '../../public/athlete/signup.html'));
    }
});

router.get('/athlete/dashboard', requireAthleteAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/athlete/dashboard.html'));
});

router.get('/athlete/home', requireAthleteAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/athlete/home.html'));
});

router.get('/athlete/upload', requireAthleteAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/athlete/upload.html'));
});

router.get('/athlete/leaderboard', requireAthleteAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/athlete/leaderboard.html'));
});

router.get('/athlete/notifications', requireAthleteAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/athlete/notifications.html'));
});

// Coach pages
router.get('/coach/login', (req, res) => {
    if (req.session.coachId) {
        res.redirect('/coach/home');
    } else {
        res.sendFile(path.join(__dirname, '../../public/coach/login.html'));
    }
});

router.get('/coach/signup', (req, res) => {
    if (req.session.coachId) {
        res.redirect('/coach/home');
    } else {
        res.sendFile(path.join(__dirname, '../../public/coach/signup.html'));
    }
});

router.get('/coach/dashboard', requireCoachAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/coach/dashboard.html'));
});

router.get('/coach/home', requireCoachAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/coach/home.html'));
});

router.get('/coach/leaderboard', requireCoachAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/coach/leaderboard.html'));
});

module.exports = router;
