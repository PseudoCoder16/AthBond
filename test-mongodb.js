const mongoDBService = require('./src/config/mongodbDatabase');
require('dotenv').config();

async function testMongoDBConnection() {
    try {
        console.log('🔄 Testing MongoDB connection...');
        
        // Initialize MongoDB connection
        await mongoDBService.initialize();
        
        // Test connection status
        const status = mongoDBService.getConnectionStatus();
        console.log('📊 Connection Status:', status);
        
        // Test health check
        const health = await mongoDBService.healthCheck();
        console.log('🏥 Health Check:', health);
        
        // Test creating an athlete
        console.log('\n🔄 Testing athlete creation...');
        const testAthlete = {
            name: 'Test Athlete',
            age: 25,
            gender: 'Male',
            email: 'test@example.com',
            sports: 'Football',
            level: 'State',
            phone: '1234567890',
            password: 'testpassword123'
        };
        
        try {
            const athlete = await mongoDBService.createAthlete(testAthlete);
            console.log('✅ Athlete created successfully:', athlete._id);
            
            // Test finding athlete
            const foundAthlete = await mongoDBService.findAthleteByEmail('test@example.com');
            console.log('✅ Athlete found:', foundAthlete ? 'Yes' : 'No');
            
            // Clean up test data
            await mongoDBService.deleteAthlete(athlete._id);
            console.log('✅ Test athlete cleaned up');
            
        } catch (error) {
            if (error.code === 11000) {
                console.log('⚠️ Athlete already exists (duplicate key error)');
            } else {
                console.error('❌ Error testing athlete operations:', error.message);
            }
        }
        
        // Test creating a coach
        console.log('\n🔄 Testing coach creation...');
        const testCoach = {
            name: 'Test Coach',
            age: 35,
            gender: 'Female',
            email: 'coach@example.com',
            sports: 'Basketball',
            phone: '0987654321',
            sportsGovtId: 'COACH123456',
            password: 'coachpassword123'
        };
        
        try {
            const coach = await mongoDBService.createCoach(testCoach);
            console.log('✅ Coach created successfully:', coach._id);
            
            // Test finding coach
            const foundCoach = await mongoDBService.findCoachByEmail('coach@example.com');
            console.log('✅ Coach found:', foundCoach ? 'Yes' : 'No');
            
            // Clean up test data
            await mongoDBService.deleteCoach(coach._id);
            console.log('✅ Test coach cleaned up');
            
        } catch (error) {
            if (error.code === 11000) {
                console.log('⚠️ Coach already exists (duplicate key error)');
            } else {
                console.error('❌ Error testing coach operations:', error.message);
            }
        }
        
        console.log('\n🎉 MongoDB integration test completed successfully!');
        
    } catch (error) {
        console.error('❌ MongoDB test failed:', error);
    } finally {
        // Close connection
        await mongoDBService.close();
        console.log('🔌 MongoDB connection closed');
        process.exit(0);
    }
}

// Run the test
testMongoDBConnection();
