#!/bin/bash

# Sports Athlete Platform - Complete Integration Test Script
# This script will install dependencies, start the server, and test the integration

echo "🏆 Starting Sports Athlete Platform Integration Test"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Navigate to the project directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=3000
SESSION_SECRET=your-session-secret-key-here
MONGODB_URI=mongodb://localhost:27017/sports-athlete-platform
NODE_ENV=development
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Start the server
echo "🚀 Starting the server..."
echo "The server will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server with nodemon for development
npm run dev

# If npm run dev fails, try starting with node directly
if [ $? -ne 0 ]; then
    echo "⚠️ npm run dev failed, trying node directly..."
    node server.js
fi
