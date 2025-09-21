const http = require('http');

// Test the athlete API endpoint
function testAthleteAPI() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/athlete',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
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

console.log('🧪 Testing Athlete API...');
console.log('========================');
testAthleteAPI();
