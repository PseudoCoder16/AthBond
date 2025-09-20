# EthBond Backend System

## 🚀 Complete Video Upload and Analysis System

This backend system provides a comprehensive solution for video upload, pose analysis, progress tracking, and community leaderboards for the EthBond application.

## 📁 System Architecture

```
ethbond/
├── video_analyzer.py          # Video processing and analysis
├── user_manager.py            # User data and progress management
├── api_server.py              # REST API endpoints
├── frontend_integration.py    # Frontend integration helpers
├── test_video_upload.py       # Complete system testing
├── main.py                    # Original real-time system
├── tensorflow_model.py        # ML model and rep counting
├── mediapipe_utils.py         # Pose detection utilities
├── opencv_utils.py            # Video processing utilities
└── requirements.txt           # Dependencies
```

## 🎯 Features

### 1. Video Upload & Analysis
- **Upload Support**: MP4, AVI, MOV, MKV, WebM formats
- **Real-time Processing**: Frame-by-frame pose analysis
- **Rep Counting**: Automatic rep detection (180° → 0° → 180°)
- **Angle-based Scoring**: 0-100 scale based on arm angles
- **Performance Metrics**: Consistency, form quality, improvement tracking

### 2. Progress Tracking
- **Video Analytics**: Total videos analyzed, average performance
- **Improvement Tracking**: Progress over time
- **Badge System**: 4 achievement badges with different levels
- **Historical Data**: Complete analysis history

### 3. Badge System
- **Consistency Star** ⭐: Based on form consistency (80%+ threshold)
- **Fast Learner** 🚀: Based on high performance scores (70%+ threshold)
- **Perfect Form** 🏅: Based on form quality (75%+ threshold)
- **Strength Master** 💪: Based on total reps completed (10+ threshold)

### 4. Leaderboard & Community
- **Global Rankings**: Community-wide performance rankings
- **User Stats**: Individual rank, score, total athletes, improvement
- **Real-time Updates**: Live leaderboard updates

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
# Activate virtual environment
.\version\Scripts\Activate.ps1

# Install required packages
pip install -r requirements.txt
```

### 2. Start the API Server
```bash
python api_server.py
```
The server will start on `http://localhost:5000`

### 3. Test the System
```bash
python test_video_upload.py
```

## 📡 API Endpoints

### Video Upload
```http
POST /api/upload
Content-Type: multipart/form-data

Form Data:
- file: Video file
- username: User name (optional)
- user_id: Existing user ID (optional)
```

### User Progress
```http
GET /api/user/{user_id}/progress
```

### Leaderboard
```http
GET /api/leaderboard?limit=50
```

### User Management
```http
POST /api/user/create
Content-Type: application/json

{
  "username": "JohnDoe",
  "email": "john@example.com"
}
```

## 🎮 Frontend Integration

### JavaScript/TypeScript Example
```javascript
// Upload video
async function uploadVideo(videoFile, username) {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('username', username);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
}

// Get user progress
async function getUserProgress(userId) {
    const response = await fetch(`/api/user/${userId}/progress`);
    return await response.json();
}

// Get leaderboard
async function getLeaderboard() {
    const response = await fetch('/api/leaderboard');
    return await response.json();
}
```

## 📊 Data Structure

### Analysis Results
```json
{
  "analysis_id": "uuid",
  "user_id": "user_id",
  "total_reps": 5,
  "average_score": 85.5,
  "performance_level": "Excellent",
  "badges": [
    {
      "name": "Consistency Star",
      "icon": "⭐",
      "earned": true,
      "level": "gold"
    }
  ],
  "improvement": 12.5,
  "consistency": 88.2,
  "form_quality": 92.1
}
```

### User Progress
```json
{
  "user_id": "uuid",
  "username": "JohnDoe",
  "total_videos": 10,
  "total_reps": 50,
  "average_performance": 82.5,
  "improvement": 15.2,
  "badges": [...],
  "last_activity": "2025-01-21T10:30:00"
}
```

### Leaderboard
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "TopAthlete",
      "average_performance": 95.5,
      "total_reps": 100,
      "badges_count": 4
    }
  ]
}
```

## 🏆 Badge Criteria

| Badge | Criteria | Levels |
|-------|----------|--------|
| **Consistency Star** ⭐ | Form consistency ≥ 80% | Gold (90%+), Silver (80%+) |
| **Fast Learner** 🚀 | Average score ≥ 70% | Gold (85%+), Silver (70%+) |
| **Perfect Form** 🏅 | Form quality ≥ 75% | Gold (90%+), Silver (75%+) |
| **Strength Master** 💪 | Total reps ≥ 10 | Gold (20+), Silver (10+) |

## 🔧 Configuration

### Video Processing
- **Max file size**: 100MB
- **Supported formats**: MP4, AVI, MOV, MKV, WebM
- **Frame processing**: Every 3rd frame for performance
- **Angle smoothing**: 5-frame moving average

### Rep Counting
- **Fully extended**: 135-180° (starts rep)
- **Fully bent**: 0-45° (completes rep)
- **State machine**: rest → going_down → going_up → rest

### Scoring System
- **Good posture** (angle < 90°): 80-100 points
- **Needs improvement** (angle ≥ 90°): 0-20 points
- **Perfect form** (0°): 100 points
- **Straight arms** (180°): 0 points

## 🚀 Quick Start

1. **Start the server**:
   ```bash
   python api_server.py
   ```

2. **Upload a video** (using curl):
   ```bash
   curl -X POST -F "file=@your_video.mp4" -F "username=TestUser" http://localhost:5000/api/upload
   ```

3. **Check progress**:
   ```bash
   curl http://localhost:5000/api/user/{user_id}/progress
   ```

4. **View leaderboard**:
   ```bash
   curl http://localhost:5000/api/leaderboard
   ```

## 📈 Performance Metrics

The system tracks and calculates:
- **Total Reps**: Complete movement cycles
- **Average Score**: Mean performance across all frames
- **Consistency**: Standard deviation of scores (lower = better)
- **Form Quality**: Angle consistency and technique
- **Improvement**: Progress over time
- **Reps per Minute**: Training intensity

## 🔒 Data Storage

- **User Data**: `user_data/users.json`
- **Analytics**: `user_data/analytics.json`
- **Analysis Results**: `results/{analysis_id}.json`
- **Uploaded Videos**: `uploads/`

## 🧪 Testing

Run the complete test suite:
```bash
python test_video_upload.py
```

This will test:
- Video analysis pipeline
- User management system
- API endpoints
- Badge assignment
- Progress tracking
- Leaderboard functionality

## 🌟 Ready for Frontend Integration!

The backend system is fully functional and ready to integrate with your frontend UI. All endpoints are documented, tested, and working correctly.

**Next Steps**:
1. Connect your frontend to the API endpoints
2. Implement file upload functionality
3. Display progress and leaderboard data
4. Show badge achievements
5. Create user authentication (optional)

The system handles all the complex pose analysis, rep counting, and progress tracking automatically! 🎯
