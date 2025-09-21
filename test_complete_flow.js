const http = require('http');

// Test athlete signup to see if data is being saved
function testAthleteSignup() {
    const signupData = JSON.stringify({
        name: "John Doe",
        age: 25,
        gender: "Male",
        email: "jane@athlete.com",
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
                console.log('🔍 Now testing login and API...');
                testAthleteLogin();
            } else {
                console.log('❌ Failed to create athlete');
                console.log('Response:', data);
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
        email: "jane@athlete.com",
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
                    console.log('Age:', result.athlete.age);
                    console.log('Gender:', result.athlete.gender);
                    
                    if (result.athlete.name && result.athlete.name !== 'Unknown') {
                        console.log('🎉 SUCCESS! The "undefined" issue is FIXED!');
                        console.log('📱 You can now open http://localhost:3000/athlete/dashboard to see the name displayed correctly!');
                    } else {
                        console.log('❌ The athlete data is still not being retrieved properly');
                        console.log('🔍 Check the server logs for more details');
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

console.log('🧪 Testing Complete Athlete Flow...');
console.log('===================================');
testAthleteSignup();
