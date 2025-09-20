# 🍃 MongoDB Integration Setup Guide

## Overview

This guide will help you set up MongoDB integration for your Sports Athlete Platform. The system has been updated to use MongoDB instead of JSON files for better scalability and performance.

## 📋 Prerequisites

- Node.js installed
- MongoDB Atlas account (or local MongoDB instance)
- Your MongoDB connection string

## 🔧 Setup Steps

### 1. Install Dependencies

The MongoDB dependencies have been added to `package.json`:

```json
{
  "mongoose": "^8.0.0",
  "dotenv": "^16.3.1"
}
```

Install them by running:
```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in your project root (copy from `env.example`):

```bash
# Copy the example file
cp env.example .env
```

Update the `.env` file with your MongoDB connection string:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://atishay-jain:wKyNM9TWiGvyXUls@cluster0.xxxxx.mongodb.net/sports-athlete-platform?retryWrites=true&w=majority

# Database Name
DB_NAME=sports-athlete-platform

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production-2024

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_DIR=uploads

# AI/ML Configuration
POSE_CONFIDENCE_THRESHOLD=0.7
CHEAT_DETECTION_THRESHOLD=0.7
PERFORMANCE_CONFIDENCE_THRESHOLD=0.8

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-in-production-2024
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose the free tier (M0)
   - Select your preferred region
   - Create the cluster

3. **Configure Database Access**
   - Go to "Database Access"
   - Add a new database user
   - Username: `atishay-jain`
   - Password: `wKyNM9TWiGvyXUls`
   - Role: "Atlas admin" or "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (for development)
   - Or add your specific IP address

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `sports-athlete-platform`

### 4. Test MongoDB Connection

Run the test script to verify everything is working:

```bash
node test-mongodb.js
```

Expected output:
```
🔄 Testing MongoDB connection...
✅ MongoDB connected successfully
📊 Connection Status: { isConnected: true, readyState: 1, ... }
🏥 Health Check: { status: 'connected', message: 'MongoDB is healthy' }
🔄 Testing athlete creation...
✅ Athlete created successfully: 64f8a1b2c3d4e5f6a7b8c9d0
✅ Athlete found: Yes
✅ Test athlete cleaned up
🔄 Testing coach creation...
✅ Coach created successfully: 64f8a1b2c3d4e5f6a7b8c9d1
✅ Coach found: Yes
✅ Test coach cleaned up
🎉 MongoDB integration test completed successfully!
🔌 MongoDB connection closed
```

### 5. Start the Application

```bash
npm run dev
```

The application will now use MongoDB for all data storage.

## 📊 Database Schema

### Collections Created

1. **athletes** - Athlete profiles and data
2. **coaches** - Coach profiles and data
3. **videoanalyses** - Video analysis results
4. **leaderboards** - Leaderboard data

### Key Features

- **Indexes**: Optimized for fast queries
- **Validation**: Data validation at the schema level
- **Relationships**: Proper references between collections
- **Timestamps**: Automatic created/updated timestamps

## 🔄 Migration from JSON Files

The system automatically migrates from JSON files to MongoDB:

1. **Athletes**: `athletes.json` → `athletes` collection
2. **Coaches**: `coaches.json` → `coaches` collection
3. **Leaderboard**: New MongoDB-based leaderboard system
4. **Video Analysis**: New collection for video analysis data

## 🛠️ Available Operations

### Athlete Operations
```javascript
// Create athlete
const athlete = await mongoDBService.createAthlete(athleteData);

// Find athlete by email
const athlete = await mongoDBService.findAthleteByEmail(email);

// Update athlete
const updated = await mongoDBService.updateAthlete(id, updateData);

// Get athlete stats
const stats = await mongoDBService.getAthleteStats(athleteId);
```

### Coach Operations
```javascript
// Create coach
const coach = await mongoDBService.createCoach(coachData);

// Find coach by email
const coach = await mongoDBService.findCoachByEmail(email);

// Update coach
const updated = await mongoDBService.updateCoach(id, updateData);
```

### Video Analysis Operations
```javascript
// Create video analysis
const analysis = await mongoDBService.createVideoAnalysis(analysisData);

// Get analyses by athlete
const analyses = await mongoDBService.getVideoAnalysesByAthlete(athleteId);

// Get performance stats
const stats = await mongoDBService.getPerformanceStats(athleteId, days);
```

### Leaderboard Operations
```javascript
// Create/update leaderboard
const leaderboard = await mongoDBService.createOrUpdateLeaderboard(sports, level, athleteData);

// Get leaderboard
const leaderboard = await mongoDBService.getLeaderboardBySportsAndLevel(sports, level);

// Get leaderboard stats
const stats = await mongoDBService.getLeaderboardStats(sports, level);
```

## 🔍 Monitoring and Maintenance

### Health Check
```javascript
const health = await mongoDBService.healthCheck();
console.log(health);
```

### Connection Status
```javascript
const status = mongoDBService.getConnectionStatus();
console.log(status);
```

### Cleanup Old Data
```javascript
// Clean up data older than 30 days
const deleted = await mongoDBService.cleanupOldData(30);
console.log(`Cleaned up ${deleted} old records`);
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your MongoDB URI
   - Verify network access settings
   - Ensure credentials are correct

2. **Authentication Failed**
   - Verify username and password
   - Check database user permissions

3. **Network Timeout**
   - Check your IP address in network access
   - Verify firewall settings

4. **Schema Validation Errors**
   - Check data format matches schema
   - Verify required fields are provided

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=mongoose:*
```

## 📈 Performance Optimization

### Indexes
The following indexes are automatically created:
- `email` (unique)
- `sports` + `level`
- `averageScore` (descending)
- `createdAt` (descending)

### Connection Pooling
- Max pool size: 10 connections
- Server selection timeout: 5 seconds
- Socket timeout: 45 seconds

## 🔒 Security

### Data Protection
- Passwords are hashed with bcrypt
- Sensitive data is encrypted
- Input validation at schema level

### Access Control
- Database user with limited permissions
- Network access restrictions
- Environment variable protection

## 📚 Next Steps

1. **Test the Application**: Run the test script and start the server
2. **Create Test Data**: Register some athletes and coaches
3. **Upload Videos**: Test the video analysis functionality
4. **Monitor Performance**: Check MongoDB Atlas dashboard
5. **Scale as Needed**: Upgrade MongoDB plan if required

## 🆘 Support

If you encounter any issues:

1. Check the MongoDB Atlas dashboard
2. Review the application logs
3. Verify environment variables
4. Test the connection with the provided script

---

**Note**: This setup provides a production-ready MongoDB integration with proper error handling, validation, and performance optimization.

