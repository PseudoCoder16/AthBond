const http = require('http');

let sessionCookie = '';

// Test athlete login and get session
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
                // Now test the athlete API with session
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

// Test the athlete API with session
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
                    console.log('🎉 The "undefined" issue is FIXED!');
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

console.log('🧪 Testing Athlete Login and API with Session...');
console.log('===============================================');
testAthleteLogin();
