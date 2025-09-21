const http = require('http');

// Test with a unique email
const timestamp = Date.now();
const testEmail = `test${timestamp}@athlete.com`;

console.log('🧪 Testing with email:', testEmail);

// Test athlete signup
function testAthleteSignup() {
    const signupData = JSON.stringify({
        name: "Test User",
        age: 25,
        gender: "Male",
        email: testEmail,
        sports: "Football",
        level: "State",
        phone: "1234567890",
        password: "password123",
        confirmPassword: "password123"
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/athlete/signup',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(signupData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📝 Athlete Signup Response:');
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ Athlete created successfully!');
                testAthleteLogin();
            } else {
                console.log('❌ Failed to create athlete');
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Signup request failed:', err.message);
    });

    req.write(signupData);
    req.end();
}

let sessionCookie = '';

function testAthleteLogin() {
    const loginData = JSON.stringify({
        email: testEmail,
        password: "password123"
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/athlete/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        
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
            console.log('🔐 Athlete Login Response:');
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ Athlete logged in successfully!');
                testAthleteAPI();
            } else {
                console.log('❌ Failed to login athlete');
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Login request failed:', err.message);
    });

    req.write(loginData);
    req.end();
}

function testAthleteAPI() {
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
                        console.log('🎉 SUCCESS! The "undefined" issue is FIXED!');
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
        console.log('❌ Request failed:', err.message);
    });

    req.end();
}

console.log('🧪 Testing Complete Athlete Flow with Debug...');
console.log('=============================================');
testAthleteSignup();
