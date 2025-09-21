const http = require('http');

// Test the complete signup and login flow
function testSignupAndLogin() {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@athlete.com`;
    const testPassword = 'password123';
    
    console.log('🧪 Testing Complete Signup and Login Flow...');
    console.log('=============================================');
    console.log('Test Email:', testEmail);
    console.log('Test Password:', testPassword);
    
    // Step 1: Signup
    const signupData = JSON.stringify({
        name: "Test User",
        age: 25,
        gender: "Male",
        email: testEmail,
        sports: "Football",
        level: "State",
        phone: "1234567890",
        password: testPassword,
        confirmPassword: testPassword
    });

    const signupOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/athlete/signup',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(signupData)
        }
    };

    const signupReq = http.request(signupOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📝 Signup Response:');
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ Signup successful!');
                // Now test login
                testLogin(testEmail, testPassword);
            } else {
                console.log('❌ Signup failed');
                console.log('Response:', data);
            }
        });
    });

    signupReq.on('error', (err) => {
        console.log('❌ Signup request failed:', err.message);
    });

    signupReq.write(signupData);
    signupReq.end();
}

function testLogin(email, password) {
    const loginData = JSON.stringify({
        email: email,
        password: password
    });

    const loginOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/athlete/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    const loginReq = http.request(loginOptions, (res) => {
        let data = '';
        let sessionCookie = '';
        
        // Extract session cookie
        const setCookieHeader = res.headers['set-cookie'];
        if (setCookieHeader) {
            sessionCookie = setCookieHeader[0].split(';')[0];
            console.log('🍪 Session cookie:', sessionCookie);
        }
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('🔐 Login Response:');
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ Login successful!');
                // Now test the athlete API
                testAthleteAPI(sessionCookie);
            } else {
                console.log('❌ Login failed');
                console.log('Response:', data);
            }
        });
    });

    loginReq.on('error', (err) => {
        console.log('❌ Login request failed:', err.message);
    });

    loginReq.write(loginData);
    loginReq.end();
}

function testAthleteAPI(sessionCookie) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/athlete',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📡 Athlete API Response:');
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            try {
                const result = JSON.parse(data);
                if (result.success && result.athlete) {
                    console.log('✅ Athlete data retrieved successfully!');
                    console.log('Name:', result.athlete.name);
                    console.log('Email:', result.athlete.email);
                    console.log('Sports:', result.athlete.sports);
                    
                    if (result.athlete.name && result.athlete.name !== 'Unknown') {
                        console.log('🎉 SUCCESS! The login issue is FIXED!');
                        console.log('📱 You can now login with your created account!');
                    } else {
                        console.log('❌ The athlete data is still not being retrieved properly');
                    }
                } else {
                    console.log('❌ Failed to retrieve athlete data');
                    console.log('Message:', result.message);
                }
            } catch (error) {
                console.log('❌ Error parsing response:', error.message);
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ API request failed:', err.message);
    });

    req.end();
}

// Start the test
testSignupAndLogin();
