// Validation middleware for athlete registration
const validateAthleteSignup = (req, res, next) => {
    const { name, age, gender, email, sports, level, phone, password, confirmPassword } = req.body;

    // Check required fields
    if (!name || !age || !gender || !email || !sports || !level || !phone || !password || !confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    // Validate password
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Passwords do not match' 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 6 characters long' 
        });
    }

    // Validate age
    const ageNum = parseInt(age);
    if (ageNum < 10 || ageNum > 100) {
        return res.status(400).json({ 
            success: false, 
            message: 'Age must be between 10 and 100' 
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email format' 
        });
    }

    next();
};

// Validation middleware for coach registration
const validateCoachSignup = (req, res, next) => {
    const { name, age, gender, email, sports, phone, sportsGovtId, password, confirmPassword } = req.body;

    // Check required fields
    if (!name || !age || !gender || !email || !sports || !phone || !sportsGovtId || !password || !confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    // Validate password
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Passwords do not match' 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 6 characters long' 
        });
    }

    // Validate age
    const ageNum = parseInt(age);
    if (ageNum < 18 || ageNum > 100) {
        return res.status(400).json({ 
            success: false, 
            message: 'Age must be between 18 and 100' 
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email format' 
        });
    }

    next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email and password are required' 
        });
    }

    next();
};

module.exports = {
    validateAthleteSignup,
    validateCoachSignup,
    validateLogin
};
