# 🏆 Sports Athlete Platform - Complete Deployment Guide

## 🚀 Quick Start (Windows)

1. **Open Command Prompt or PowerShell**
2. **Navigate to the AthBond directory:**
   ```cmd
   cd C:\Users\avija\OneDrive\Desktop\merged\AthBond
   ```

3. **Run the deployment script:**
   ```cmd
   start.bat
   ```

## 🚀 Quick Start (Linux/Mac)

1. **Open Terminal**
2. **Navigate to the AthBond directory:**
   ```bash
   cd /path/to/AthBond
   ```

3. **Make the script executable and run:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

## 🚀 Manual Start

If the scripts don't work, run these commands manually:

```bash
# Install dependencies
npm install

# Start the server
node server.js
```

## 📱 How to Use

1. **Open your browser** and go to: `http://localhost:3000`

2. **Create an Athlete Account:**
   - Click "Create Account" 
   - Fill in your details (name, age, gender, email, sports, level, phone, password)
   - Click "Sign Up"

3. **Login:**
   - Use the same email and password you used to create the account
   - Click "Sign In"

4. **Access Features:**
   - **Dashboard**: View your profile and stats
   - **Upload Video**: Upload videos for AI analysis
   - **Leaderboard**: See your ranking
   - **Notifications**: View real-time alerts

## 🔧 Features Included

### ✅ Fixed Issues
- **Login Authentication**: Fixed "Invalid email or password" error
- **Undefined Name**: Fixed athlete name showing as "undefined"
- **Console Warnings**: Fixed touch event listener warnings
- **Server Startup**: Fixed server startup issues

### 🤖 AI/ML Integration
- **Video Analysis**: Upload videos for AI-powered analysis
- **Real-time Processing**: Live progress updates during video processing
- **Performance Scoring**: AI evaluates technique, form, and consistency
- **Cheat Detection**: AI detects unusual patterns
- **Injury Risk Assessment**: AI identifies potential injury risks

### 📊 Real-time Features
- **Live Notifications**: Real-time alerts and achievements
- **Dynamic Leaderboard**: Auto-updating rankings
- **Progress Tracking**: Live upload and analysis progress
- **WebSocket Communication**: Instant updates across all connected clients

## 🛠️ Technical Details

### Backend
- **Node.js + Express.js**: Server framework
- **Socket.IO**: Real-time communication
- **In-Memory Storage**: Simple data persistence (no database required)
- **AI Services**: Video analysis, pose detection, ML evaluation

### Frontend
- **HTML/CSS/JavaScript**: Clean, responsive interface
- **Socket.IO Client**: Real-time updates
- **Modern UI**: Mobile-friendly design

## 🐛 Troubleshooting

### Server Won't Start
- Make sure you're in the `AthBond` directory
- Run `npm install` to install dependencies
- Check that port 3000 is not in use

### Login Issues
- Make sure you created an account first
- Use the exact same email and password
- Clear browser cache if needed

### Video Upload Issues
- Make sure the `uploads` directory exists
- Check file format (MP4, AVI, MOV supported)
- Ensure file size is reasonable (< 100MB)

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Restart the server
3. Clear browser cache
4. Try creating a new account

## 🎉 Success!

Once everything is running, you should see:
- ✅ Server running on http://localhost:3000
- ✅ Login working without errors
- ✅ Athlete name displaying correctly
- ✅ Real-time features working
- ✅ AI/ML integration functional

**Enjoy your Sports Athlete Platform! 🏆**
