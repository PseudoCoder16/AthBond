const athleteService = require('../services/athleteService');
const coachService = require('../services/coachService');

class AuthController {
    // Athlete login
    async athleteLogin(req, res) {
        try {
            const { email, password } = req.body;
            const athlete = await athleteService.authenticateAthlete(email, password);
            
            req.session.athleteId = athlete.id;
            req.session.athleteEmail = athlete.email;
            req.session.userType = 'athlete';
            
            res.json({ 
                success: true, 
                message: 'Login successful',
                redirect: '/athlete/home'
            });
        } catch (error) {
            res.status(401).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    // Athlete signup
    async athleteSignup(req, res) {
        try {
            const athlete = await athleteService.createAthlete(req.body);
            
            req.session.athleteId = athlete.id;
            req.session.athleteEmail = athlete.email;
            req.session.userType = 'athlete';

            res.json({ 
                success: true, 
                message: 'Account created successfully',
                redirect: '/athlete/home'
            });
        } catch (error) {
            res.status(409).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    // Coach login
    async coachLogin(req, res) {
        try {
            const { email, password } = req.body;
            const coach = await coachService.authenticateCoach(email, password);
            
            req.session.coachId = coach.id;
            req.session.coachEmail = coach.email;
            req.session.userType = 'coach';
            
            res.json({ 
                success: true, 
                message: 'Login successful',
                redirect: '/coach/home'
            });
        } catch (error) {
            res.status(401).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    // Coach signup
    async coachSignup(req, res) {
        try {
            const coach = await coachService.createCoach(req.body);
            
            req.session.coachId = coach.id;
            req.session.coachEmail = coach.email;
            req.session.userType = 'coach';

            res.json({ 
                success: true, 
                message: 'Account created successfully',
                redirect: '/coach/home'
            });
        } catch (error) {
            res.status(409).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    // Logout
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Could not log out' 
                });
            }
            res.json({ 
                success: true, 
                message: 'Logged out successfully',
                redirect: '/'
            });
        });
    }
}

module.exports = new AuthController();
