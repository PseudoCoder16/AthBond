#!/bin/bash

echo "🚀 Starting Sports Athlete Platform Deployment..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Please run this script from the AthBond directory."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the server
echo "🏆 Starting the server..."
echo "📡 Server will be available at: http://localhost:3000"
echo "🎯 Open your browser and navigate to the URL above"
echo ""

# Start the server
node server.js
