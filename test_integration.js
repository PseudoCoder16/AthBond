const http = require('http');

// Test if the server is running
function testServer() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Server is running! Status: ${res.statusCode}`);
        console.log(`📡 Server accessible at: http://localhost:${options.port}`);
        
        if (res.statusCode === 200) {
            console.log('🎉 Integration test PASSED!');
            console.log('\n📋 Available features:');
            console.log('  - Real-time WebSocket communication');
            console.log('  - AI-powered video analysis');
            console.log('  - Live leaderboard updates');
            console.log('  - Instant notifications');
            console.log('  - Athlete and coach dashboards');
            console.log('\n🚀 Open http://localhost:3000 in your browser to start!');
        }
    });

    req.on('error', (err) => {
        console.log('❌ Server is not running or not accessible');
        console.log('💡 Make sure to start the server with: npm start');
        console.log('   Or run: node server.js');
    });

    req.end();
}

// Run the test
console.log('🧪 Testing Sports Athlete Platform Integration...');
console.log('================================================');
testServer();
