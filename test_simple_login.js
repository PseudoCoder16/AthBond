// Simple test to create a test athlete and verify login works
const http = require('http');

console.log('🧪 Testing Login Fix...');
console.log('=======================');

// Create a test athlete directly in the in-memory storage
const testEmail = 'vansh@example.com';
const testPassword = 'password123';

// First, let's try to signup
const signupData = JSON.stringify({
    name: "Vansh",
    age: 25,
    gender: "Male",
    email: testEmail,
    sports: "Football",
    level: "State",
    phone: "1234567890",
    password: testPassword,
    confirmPassword: testPassword
});

console.log('📝 Attempting signup for:', testEmail);

const signupOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/athlete/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signupData)
    }
};

const signupReq = http.request(signupOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📝 Signup Response:');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        
        if (res.statusCode === 200) {
            console.log('✅ Signup successful!');
            console.log('🔐 Now testing login...');
            testLogin();
        } else {
            console.log('❌ Signup failed, but continuing with login test...');
            testLogin();
        }
    });
});

signupReq.on('error', (err) => {
    console.log('❌ Signup request failed:', err.message);
    testLogin();
});

signupReq.write(signupData);
signupReq.end();

function testLogin() {
    const loginData = JSON.stringify({
        email: testEmail,
        password: testPassword
    });

    console.log('🔐 Attempting login for:', testEmail);

    const loginOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/athlete/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    const loginReq = http.request(loginOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('🔐 Login Response:');
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 200) {
                console.log('🎉 SUCCESS! Login is working!');
                console.log('📱 You can now login with your account!');
            } else {
                console.log('❌ Login still failing');
                console.log('💡 The issue might be that the server needs to be restarted');
                console.log('💡 Try restarting the server and then test again');
            }
        });
    });

    loginReq.on('error', (err) => {
        console.log('❌ Login request failed:', err.message);
    });

    loginReq.write(loginData);
    loginReq.end();
}
