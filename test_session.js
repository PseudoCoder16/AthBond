const http = require('http');

// Test session maintenance
function testSessionMaintenance() {
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
                // Now test the API with the session
                testAPIWithSession(sessionCookie);
            } else {
                console.log('❌ Login failed');
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ Login request failed:', err.message);
    });

    req.write(loginData);
    req.end();
}

function testAPIWithSession(sessionCookie) {
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
            console.log('📡 API Response:');
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                try {
                    const result = JSON.parse(data);
                    console.log('✅ API call successful!');
                    console.log('Athlete data:', result.athlete);
                    
                    if (result.athlete && Object.keys(result.athlete).length > 0) {
                        console.log('🎉 SUCCESS! Athlete data is being returned!');
                        console.log('Name:', result.athlete.name);
                        console.log('Email:', result.athlete.email);
                    } else {
                        console.log('❌ Athlete object is empty');
                    }
                } catch (error) {
                    console.log('❌ Error parsing response:', error.message);
                }
            } else {
                console.log('❌ API call failed');
            }
        });
    });

    req.on('error', (err) => {
        console.log('❌ API request failed:', err.message);
    });

    req.end();
}

console.log('🧪 Testing Session Maintenance...');
console.log('=================================');
testSessionMaintenance();
