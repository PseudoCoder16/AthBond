@echo off
echo 🏆 Starting Sports Athlete Platform with Leaderboard...
echo =====================================================

REM Check if we're in the right directory
if not exist "server.js" (
    echo ❌ Error: server.js not found. Please run this script from the AthBond directory.
    pause
    exit /b 1
)

REM Install dependencies if needed
echo 📦 Installing dependencies...
npm install

REM Create uploads directory if it doesn't exist
if not exist "uploads" mkdir uploads

REM Start the server
echo 🏆 Starting the server...
echo 📡 Server will be available at: http://localhost:3000
echo 🎯 Open your browser and navigate to the URL above
echo 🏆 Leaderboard system is fully integrated!
echo.

REM Start the server
node server.js
