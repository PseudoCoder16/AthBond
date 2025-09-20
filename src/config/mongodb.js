const mongoose = require('mongoose');
require('dotenv').config();

class MongoDBConnection {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    // Connect to MongoDB
    async connect() {
        try {
            if (this.isConnected) {
                console.log('MongoDB already connected');
                return this.connection;
            }

            const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-athlete-platform';
            
            console.log('Connecting to MongoDB...');
            
            this.connection = await mongoose.connect(mongoURI, {
                maxPoolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                bufferCommands: false // Disable mongoose buffering
            });

            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');
            
            // Handle connection events
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
                this.isConnected = true;
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });

            return this.connection;
        } catch (error) {
            console.error('MongoDB connection failed:', error);
            this.isConnected = false;
            throw error;
        }
    }

    // Disconnect from MongoDB
    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.connection.close();
                this.isConnected = false;
                console.log('MongoDB disconnected');
            }
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }

    // Health check
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected', message: 'Not connected to MongoDB' };
            }

            // Ping the database
            await mongoose.connection.db.admin().ping();
            return { status: 'connected', message: 'MongoDB is healthy' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }

    // Get database instance
    getDatabase() {
        if (!this.isConnected) {
            throw new Error('MongoDB not connected');
        }
        return mongoose.connection.db;
    }

    // Get mongoose instance
    getMongoose() {
        return mongoose;
    }
}

// Create singleton instance
const mongoDB = new MongoDBConnection();

module.exports = mongoDB;

