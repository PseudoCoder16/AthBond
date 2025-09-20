const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateAthleteSignup, validateCoachSignup, validateLogin } = require('../middleware/validation');

// Athlete authentication routes
router.post('/athlete/login', validateLogin, authController.athleteLogin);
router.post('/athlete/signup', validateAthleteSignup, authController.athleteSignup);

// Coach authentication routes
router.post('/coach/login', validateLogin, authController.coachLogin);
router.post('/coach/signup', validateCoachSignup, authController.coachSignup);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;
