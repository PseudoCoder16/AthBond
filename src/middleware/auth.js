// Middleware to check if athlete is authenticated
const requireAthleteAuth = (req, res, next) => {
    if (req.session.athleteId) {
        next();
    } else {
        res.redirect('/athlete/login');
    }
};

// Middleware to check if coach is authenticated
const requireCoachAuth = (req, res, next) => {
    if (req.session.coachId) {
        next();
    } else {
        res.redirect('/coach/login');
    }
};

// Middleware to check if user is authenticated (either athlete or coach)
const requireAuth = (req, res, next) => {
    if (req.session.athleteId || req.session.coachId) {
        next();
    } else {
        res.redirect('/');
    }
};

module.exports = {
    requireAthleteAuth,
    requireCoachAuth,
    requireAuth
};
