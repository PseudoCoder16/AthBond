const express = require('express');
const router = express.Router();

// Simple in-memory storage for athletes
const athletes = new Map();
let athleteIdCounter = 1;

// Athlete signup
router.post('/athlete/signup', (req, res) => {
    try {
        const { name, age, gender, email, sports, level, phone, password, confirmPassword } = req.body;
        
        console.log('Athlete signup attempt for:', email);
        
        // Validation
        if (!name || !age || !gender || !email || !sports || !level || !phone || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }
        
        if (athletes.has(email)) {
            return res.status(409).json({ 
                success: false, 
                message: 'Athlete with this email already exists' 
            });
        }
        
        // Create athlete
        const athlete = {
            id: `athlete_${athleteIdCounter++}`,
            name,
            age: parseInt(age),
            gender,
            email,
            sports,
            level,
            phone,
            password, // Store plain password for simplicity
            createdAt: new Date()
        };
        
        athletes.set(email, athlete);
        console.log('Athlete created:', athlete);
        
        // Set session
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
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Athlete login
router.post('/athlete/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Athlete login attempt for:', email);
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        const athlete = athletes.get(email);
        
        if (!athlete) {
            console.log('Athlete not found for email:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        if (athlete.password !== password) {
            console.log('Password mismatch for email:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        console.log('Login successful for:', email);
        
        // Set session
        req.session.athleteId = athlete.id;
        req.session.athleteEmail = athlete.email;
        req.session.userType = 'athlete';
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            redirect: '/athlete/home'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
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
});

// Export athletes for use in other controllers
module.exports = { router, athletes };
