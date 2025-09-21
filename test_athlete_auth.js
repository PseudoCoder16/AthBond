const http = require('http');

// Test athlete signup and login
function testAthleteSignup() {
    const signupData = JSON.stringify({
        name: "Test Athlete",
        age: 25,
        gender: "Male",
        email: "test@athlete.com",
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
            
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('✅ Athlete created successfully!');
                // Now test login
                testAthleteLogin();
            } else {
                console.log('❌ Failed to create athlete');
                // Try login anyway in case athlete already exists
                testAthleteLogin();
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Signup request failed:', err.message);
        // Try login anyway
        testAthleteLogin();
    });

    req.write(signupData);
    req.end();
}

function testAthleteLogin() {
    const loginData = JSON.stringify({
        email: "test@athlete.com",
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
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('🔐 Athlete Login Response:');
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ Athlete logged in successfully!');
                console.log('🎉 Now you can test the dashboard at http://localhost:3000/athlete/dashboard');
                console.log('📝 The "undefined" issue should be fixed now!');
            } else {
                console.log('❌ Failed to login athlete');
                console.log('💡 Please try logging in manually at http://localhost:3000/athlete/login');
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Login request failed:', err.message);
    });

    req.write(loginData);
    req.end();
}

console.log('🧪 Testing Athlete Signup and Login...');
console.log('=====================================');
testAthleteSignup();
