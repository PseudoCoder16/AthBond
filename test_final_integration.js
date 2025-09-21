const http = require('http');

console.log('🎉 FINAL INTEGRATION TEST - Sports Athlete Platform');
console.log('===================================================');

// Test 1: Server Status
function testServerStatus() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000', (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Server Status: RUNNING');
                resolve(true);
            } else {
                console.log('❌ Server Status: ERROR');
                resolve(false);
            }
        });
        
        req.on('error', () => {
            console.log('❌ Server Status: NOT RUNNING');
            resolve(false);
        });
    });
}

// Test 2: Athlete Signup
function testAthleteSignup() {
    return new Promise((resolve) => {
        const testData = JSON.stringify({
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
                'Content-Length': Buffer.byteLength(testData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Athlete Signup: WORKING');
                    resolve(true);
                } else {
                    console.log('❌ Athlete Signup: FAILED');
                    resolve(false);
                }
            });
        });

        req.on('error', () => {
            console.log('❌ Athlete Signup: ERROR');
            resolve(false);
        });

        req.write(testData);
        req.end();
    });
}

// Test 3: Athlete Login
function testAthleteLogin() {
    return new Promise((resolve) => {
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
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Athlete Login: WORKING');
                    resolve(true);
                } else {
                    console.log('❌ Athlete Login: FAILED');
                    resolve(false);
                }
            });
        });

        req.on('error', () => {
            console.log('❌ Athlete Login: ERROR');
            resolve(false);
        });

        req.write(loginData);
        req.end();
    });
}

// Test 4: Pages Accessibility
function testPages() {
    const pages = [
        { path: '/', name: 'Home Page' },
        { path: '/athlete/login', name: 'Athlete Login' },
        { path: '/athlete/signup', name: 'Athlete Signup' },
        { path: '/coach/login', name: 'Coach Login' }
    ];

    return Promise.all(pages.map(page => {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:3000${page.path}`, (res) => {
                if (res.statusCode === 200) {
                    console.log(`✅ ${page.name}: ACCESSIBLE`);
                    resolve(true);
                } else {
                    console.log(`❌ ${page.name}: NOT ACCESSIBLE`);
                    resolve(false);
                }
            });
            
            req.on('error', () => {
                console.log(`❌ ${page.name}: ERROR`);
                resolve(false);
            });
        });
    }));
}

// Run all tests
async function runAllTests() {
    console.log('\n🧪 Running Tests...\n');
    
    const serverStatus = await testServerStatus();
    if (!serverStatus) {
        console.log('\n❌ CRITICAL: Server is not running!');
        console.log('💡 Please start the server with: node server.js');
        return;
    }
    
    console.log('\n📝 Testing Authentication...');
    const signupResult = await testAthleteSignup();
    const loginResult = await testAthleteLogin();
    
    console.log('\n🌐 Testing Pages...');
    const pageResults = await testPages();
    
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('========================');
    console.log(`Server Status: ${serverStatus ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Athlete Signup: ${signupResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Athlete Login: ${loginResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Pages Accessible: ${pageResults.every(r => r) ? '✅ PASS' : '❌ FAIL'}`);
    
    if (serverStatus && signupResult && loginResult && pageResults.every(r => r)) {
        console.log('\n🎉 ALL TESTS PASSED! 🎉');
        console.log('🚀 Your Sports Athlete Platform is ready for use!');
        console.log('\n📱 Next Steps:');
        console.log('1. Open your browser and go to: http://localhost:3000');
        console.log('2. Create an athlete account');
        console.log('3. Login and explore the features');
        console.log('4. Upload videos for AI analysis');
        console.log('5. Check the leaderboard and notifications');
    } else {
        console.log('\n❌ Some tests failed. Please check the errors above.');
    }
}

runAllTests();
