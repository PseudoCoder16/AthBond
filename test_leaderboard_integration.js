const http = require('http');

console.log('🏆 LEADERBOARD INTEGRATION TEST');
console.log('===============================');

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

// Test 2: Create Athlete and Test Leaderboard
async function testLeaderboardFlow() {
    let sessionCookie = '';
    const testEmail = `test${Date.now()}@athlete.com`;
    const testPassword = "password123";

    // Step 1: Signup
    console.log('\n📝 Step 1: Creating athlete account...');
    const signupResult = await signupAthlete(testEmail, testPassword);
    if (!signupResult) {
        console.log('❌ Signup failed');
        return false;
    }

    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    const loginResult = await loginAthlete(testEmail, testPassword);
    if (!loginResult) {
        console.log('❌ Login failed');
        return false;
    }
    sessionCookie = loginResult.cookie;

    // Step 3: Test Leaderboard API
    console.log('🏆 Step 3: Testing leaderboard API...');
    const leaderboardResult = await testLeaderboardAPI(sessionCookie);
    if (!leaderboardResult) {
        console.log('❌ Leaderboard API failed');
        return false;
    }

    console.log('✅ All leaderboard tests passed!');
    return true;
}

function signupAthlete(email, password) {
    return new Promise((resolve) => {
        const signupData = JSON.stringify({
            name: "Test Athlete",
            age: 25,
            gender: "Male",
            email: email,
            sports: "Football",
            level: "State",
            phone: "1234567890",
            password: password,
            confirmPassword: password
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
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Athlete signup successful');
                    resolve(true);
                } else {
                    console.log('❌ Athlete signup failed:', data);
                    resolve(false);
                }
            });
        });

        req.on('error', () => {
            console.log('❌ Signup request error');
            resolve(false);
        });

        req.write(signupData);
        req.end();
    });
}

function loginAthlete(email, password) {
    return new Promise((resolve) => {
        const loginData = JSON.stringify({ email, password });
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
                    console.log('✅ Athlete login successful');
                    const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
                    resolve({ success: true, cookie });
                } else {
                    console.log('❌ Athlete login failed:', data);
                    resolve(false);
                }
            });
        });

        req.on('error', () => {
            console.log('❌ Login request error');
            resolve(false);
        });

        req.write(loginData);
        req.end();
    });
}

function testLeaderboardAPI(sessionCookie) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/athlete/leaderboard',
            method: 'GET',
            headers: {
                'Cookie': sessionCookie
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const result = JSON.parse(data);
                        if (result.success) {
                            console.log('✅ Leaderboard API working');
                            console.log('📊 Leaderboard data structure:', {
                                hasLeaderboard: !!result.leaderboard,
                                hasAthletePosition: !!result.athletePosition,
                                hasStats: !!result.stats,
                                leaderboardLength: result.leaderboard ? result.leaderboard.length : 0
                            });
                            resolve(true);
                        } else {
                            console.log('❌ Leaderboard API returned error:', result.message);
                            resolve(false);
                        }
                    } catch (e) {
                        console.log('❌ Error parsing leaderboard response:', e.message);
                        resolve(false);
                    }
                } else {
                    console.log('❌ Leaderboard API failed with status:', res.statusCode);
                    resolve(false);
                }
            });
        });

        req.on('error', () => {
            console.log('❌ Leaderboard request error');
            resolve(false);
        });

        req.end();
    });
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
    
    console.log('\n🏆 Testing Leaderboard Integration...');
    const leaderboardResult = await testLeaderboardFlow();
    
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('========================');
    console.log(`Server Status: ${serverStatus ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Leaderboard Integration: ${leaderboardResult ? '✅ PASS' : '❌ FAIL'}`);
    
    if (serverStatus && leaderboardResult) {
        console.log('\n🎉 ALL LEADERBOARD TESTS PASSED! 🎉');
        console.log('🏆 Your leaderboard system is fully functional!');
        console.log('\n📱 Next Steps:');
        console.log('1. Open your browser and go to: http://localhost:3000');
        console.log('2. Create an athlete account');
        console.log('3. Login and go to the leaderboard page');
        console.log('4. Upload videos to see scores update in real-time');
        console.log('5. Check the leaderboard rankings and statistics');
    } else {
        console.log('\n❌ Some tests failed. Please check the errors above.');
    }
}

runAllTests();
