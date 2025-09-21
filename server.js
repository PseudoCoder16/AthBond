const { app, server, PORT } = require('./src/app');

// Start server
server.listen(PORT, () => {
    console.log(`🏆 Sports Athlete Server is running on http://localhost:${PORT}`);
    console.log('\n📋 Available routes:');
    console.log('🎨 Pages:');
    console.log('  - GET  / - Logo page');
    console.log('  - GET  /home - Main selection page');
    console.log('\n🏃‍♂️ Athlete:');
    console.log('  - GET  /athlete/login - Athlete login page');
    console.log('  - GET  /athlete/signup - Athlete signup page');
    console.log('  - GET  /athlete/dashboard - Athlete dashboard');
    console.log('  - GET  /athlete/home - Athlete home page');
    console.log('  - GET  /athlete/upload - Video upload page');
    console.log('  - GET  /athlete/leaderboard - Athlete leaderboard');
    console.log('\n👨‍🏫 Coach:');
    console.log('  - GET  /coach/login - Coach login page');
    console.log('  - GET  /coach/signup - Coach signup page');
    console.log('  - GET  /coach/dashboard - Coach dashboard');
    console.log('  - GET  /coach/home - Coach home page');
    console.log('  - GET  /coach/leaderboard - Coach leaderboard');
    console.log('\n🔐 Authentication:');
    console.log('  - POST /athlete/login - Athlete login');
    console.log('  - POST /athlete/signup - Athlete signup');
    console.log('  - POST /coach/login - Coach login');
    console.log('  - POST /coach/signup - Coach signup');
    console.log('  - POST /logout - Logout');
    console.log('\n🤖 AI/ML Features:');
    console.log('  - POST /api/athlete/upload-video - Video upload & AI processing');
    console.log('  - GET  /api/athlete/stats - Athlete performance stats');
    console.log('  - GET  /api/athlete/leaderboard - Athlete leaderboard');
    console.log('  - GET  /api/coach/athletes - Coach\'s athletes');
    console.log('  - GET  /api/coach/alerts - AI-generated alerts');
    console.log('  - GET  /api/coach/stats - Coach statistics');
    console.log('\n🚀 Server started successfully!');
});
