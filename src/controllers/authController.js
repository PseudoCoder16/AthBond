const athleteService = require('../services/athleteService');
const coachService = require('../services/coachService');

// Simple in-memory storage for testing
const testAthletes = new Map();

class AuthController {
    // Athlete login
    async athleteLogin(req, res) {
        try {
            const { email, password } = req.body;
            console.log('Athlete login attempt for email:', email);
            
            // First try database authentication
            let athlete = null;
            try {
                athlete = await athleteService.authenticateAthlete(email, password);
                console.log('Database authentication successful:', athlete);
            } catch (dbError) {
                console.log('Database authentication failed, trying in-memory storage');
                
                // Fallback to in-memory storage
                const storedAthlete = testAthletes.get(email);
                console.log('Looking for athlete in memory:', email);
                console.log('Stored athlete found:', storedAthlete);
                console.log('Password comparison:', storedAthlete ? storedAthlete.password === password : 'No athlete found');
                
                if (storedAthlete && storedAthlete.password === password) {
                    athlete = storedAthlete;
                    console.log('In-memory authentication successful:', athlete);
                } else {
                    console.log('In-memory authentication failed');
                    throw new Error('Invalid email or password');
                }
            }
            
            if (!athlete) {
                throw new Error('Invalid email or password');
            }
            
            req.session.athleteId = athlete.id || athlete._id || `athlete_${Date.now()}`;
            req.session.athleteEmail = athlete.email;
            req.session.userType = 'athlete';
            
            console.log('Session set:', {
                athleteId: req.session.athleteId,
                athleteEmail: req.session.athleteEmail,
                userType: req.session.userType
            });
            
            res.json({ 
                success: true, 
                message: 'Login successful',
                redirect: '/athlete/home'
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    // Athlete signup
    async athleteSignup(req, res) {
        try {
            const { email, password, name, age, gender, sports, level, phone } = req.body;
            console.log('Athlete signup attempt for email:', email);
            
            // Check if athlete already exists
            if (testAthletes.has(email)) {
                return res.status(409).json({ 
                    success: false, 
                    message: 'Athlete with this email already exists' 
                });
            }
            
            // Create athlete data
            const athlete = {
                id: `athlete_${Date.now()}`,
                email: email,
                password: password, // Store plain password for testing
                name: name,
                age: parseInt(age),
                gender: gender,
                sports: sports,
                level: level,
                phone: phone,
                createdAt: new Date()
            };
            
            console.log('Created athlete for in-memory storage:', athlete);
            
            // Store in memory
            testAthletes.set(email, athlete);
            console.log('Athlete created and stored:', athlete);
            
            // Also try to store in database
            try {
                await athleteService.createAthlete(req.body);
                console.log('Athlete also stored in database');
            } catch (dbError) {
                console.log('Database storage failed, but in-memory storage successful');
            }
            
            req.session.athleteId = athlete.id;
            req.session.athleteEmail = athlete.email;
            req.session.userType = 'athlete';

            res.json({ 
                success: true, 
                message: 'Account created successfully',
                redirect: '/athlete/home'
            });
        } catch (error) {
            console.error('Signup error:', error);
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

const authControllerInstance = new AuthController();

module.exports = { 
    athleteLogin: authControllerInstance.athleteLogin.bind(authControllerInstance),
    athleteSignup: authControllerInstance.athleteSignup.bind(authControllerInstance),
    coachLogin: authControllerInstance.coachLogin.bind(authControllerInstance),
    coachSignup: authControllerInstance.coachSignup.bind(authControllerInstance),
    logout: authControllerInstance.logout.bind(authControllerInstance),
    testAthletes 
};
