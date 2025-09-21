const http = require('http');

console.log('🧪 COMPLETE ATHLETE UPLOAD FLOW TEST');
console.log('=====================================');

let sessionCookie = '';
const testEmail = `test${Date.now()}@athlete.com`;
const testPassword = "password123";

// Step 1: Signup
async function signupAthlete() {
    return new Promise((resolve) => {
        const signupData = JSON.stringify({
            name: "Test Athlete",
            age: 25,
            gender: "Male",
            email: testEmail,
            sports: "Football",
            level: "State",
            phone: "1234567890",
            password: testPassword,
            confirmPassword: testPassword
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
                console.log('📝 Signup Response:');
                console.log('Status:', res.statusCode);
                console.log('Response:', data);
                
                if (res.statusCode === 200) {
                    console.log('✅ Athlete signup successful');
                    resolve(true);
                } else {
                    console.log('❌ Athlete signup failed');
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.log('❌ Signup request error:', e.message);
            resolve(false);
        });

        req.write(signupData);
        req.end();
    });
}

// Step 2: Login
async function loginAthlete() {
    return new Promise((resolve) => {
        const loginData = JSON.stringify({ email: testEmail, password: testPassword });
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
                console.log('🔐 Login Response:');
                console.log('Status:', res.statusCode);
                console.log('Response:', data);
                
                if (res.headers['set-cookie']) {
                    sessionCookie = res.headers['set-cookie'][0].split(';')[0];
                    console.log('🍪 Session cookie:', sessionCookie);
                }
                
                if (res.statusCode === 200) {
                    console.log('✅ Athlete login successful');
                    resolve(true);
                } else {
                    console.log('❌ Athlete login failed');
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.log('❌ Login request error:', e.message);
            resolve(false);
        });

        req.write(loginData);
        req.end();
    });
}

// Step 3: Test Video Upload
async function testVideoUpload() {
    return new Promise((resolve) => {
        const fs = require('fs');
        
        // Create a simple test file
        const testVideoPath = './test_video.txt';
        fs.writeFileSync(testVideoPath, 'This is a test video file');
        
        const fileContent = fs.readFileSync(testVideoPath);
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
        
        const formData = `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="video"; filename="test_video.txt"\r\n` +
            `Content-Type: video/mp4\r\n\r\n` +
            fileContent + '\r\n' +
            `--${boundary}--\r\n`;
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/athlete/upload-video',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(formData),
                'Cookie': sessionCookie
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('📹 Upload Response:');
                console.log('Status:', res.statusCode);
                console.log('Response:', data);
                
                if (res.statusCode === 200) {
                    console.log('✅ Video upload successful!');
                    resolve(true);
                } else {
                    console.log('❌ Video upload failed with status:', res.statusCode);
                    resolve(false);
                }
                
                // Clean up test file
                fs.unlinkSync(testVideoPath);
            });
        });
        
        req.on('error', (e) => {
            console.log('❌ Upload request error:', e.message);
            resolve(false);
        });
        
        req.write(formData);
        req.end();
    });
}

// Step 4: Test Leaderboard
async function testLeaderboard() {
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
                console.log('🏆 Leaderboard Response:');
                console.log('Status:', res.statusCode);
                console.log('Response:', data);
                
                if (res.statusCode === 200) {
                    console.log('✅ Leaderboard access successful!');
                    resolve(true);
                } else {
                    console.log('❌ Leaderboard access failed with status:', res.statusCode);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (e) => {
            console.log('❌ Leaderboard request error:', e.message);
            resolve(false);
        });
        
        req.end();
    });
}

// Run complete flow
async function runCompleteFlow() {
    console.log('\n🧪 Running Complete Athlete Flow...\n');
    
    console.log('📝 Step 1: Creating athlete account...');
    const signupResult = await signupAthlete();
    if (!signupResult) {
        console.log('❌ Signup failed, stopping test');
        return;
    }
    
    console.log('\n🔐 Step 2: Logging in...');
    const loginResult = await loginAthlete();
    if (!loginResult) {
        console.log('❌ Login failed, stopping test');
        return;
    }
    
    console.log('\n📹 Step 3: Testing video upload...');
    const uploadResult = await testVideoUpload();
    if (!uploadResult) {
        console.log('❌ Video upload failed, but continuing test');
    }
    
    console.log('\n🏆 Step 4: Testing leaderboard access...');
    const leaderboardResult = await testLeaderboard();
    if (!leaderboardResult) {
        console.log('❌ Leaderboard access failed');
    }
    
    console.log('\n📊 FINAL RESULTS:');
    console.log('=================');
    console.log(`Signup: ${signupResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Login: ${loginResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Upload: ${uploadResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Leaderboard: ${leaderboardResult ? '✅ PASS' : '❌ FAIL'}`);
    
    if (signupResult && loginResult && uploadResult && leaderboardResult) {
        console.log('\n🎉 ALL TESTS PASSED! 🎉');
        console.log('💡 The upload system is working correctly!');
        console.log('💡 If you still get 404 errors, check:');
        console.log('   1. Make sure you are logged in');
        console.log('   2. Check browser console for errors');
        console.log('   3. Verify the file is a valid video format');
    } else {
        console.log('\n❌ Some tests failed. Check the errors above.');
    }
}

runCompleteFlow();
