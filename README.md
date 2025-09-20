# 🏆 AthBond - AI-Powered Sports Platform

A comprehensive sports management system that combines AI-powered pose analysis with athlete-coach collaboration, built using both Python ML pipeline and Node.js web platform.

## 🌟 Features

### **🤖 AI-Powered Pose Analysis (Python Backend)**
- **Real-time Pose Detection**: Using MediaPipe for accurate pose landmark extraction
- **Advanced ML Models**: TensorFlow-based models for pose scoring and classification
- **Intuitive Scoring System**: 0-100 point scale with color-coded performance levels
- **Rep Counting**: Automatic rep detection (180° → 0° → 180°) with state machine logic
- **Video Processing**: OpenCV-based video capture and frame preprocessing
- **Comprehensive Evaluation**: Detailed metrics including accuracy, precision, recall, and confusion matrices
- **Modular Architecture**: Clean, well-documented codebase with separate modules for each component

### **👥 Sports Management Platform (Node.js Frontend)**
- **For Athletes:**
  - 🏃‍♂️ **Athlete Registration** - Complete profile with sports category and competition level
  - 📊 **Profile Management** - Update personal information and sports details
  - 🏅 **Level Tracking** - District, State, and National level management
  - 📱 **Responsive Dashboard** - Modern, mobile-friendly interface

- **For Coaches:**
  - 👨‍🏫 **Coach Registration** - Professional coach profiles with government ID verification
  - 🎯 **Sports Expertise** - Specialized coaching in various sports categories
  - 📈 **Athlete Management** - Track and mentor athletes
  - 🔒 **Verified Credentials** - Government-issued sports ID validation

### **Platform Features:**
- 🔐 **Secure Authentication** - Separate login systems for athletes and coaches
- 🛡️ **Password Security** - Bcrypt hashing for password protection
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ⚡ **Real-time Validation** - Client and server-side form validation
- 🎨 **Modern UI/UX** - Beautiful gradient designs with smooth animations

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (for ML pipeline)
- **Node.js v14+** (for web platform)
- **npm** (Node Package Manager)

### Installation

#### 1. **Python ML Pipeline Setup:**
```bash
# Clone the repository
git clone https://github.com/PseudoCoder16/AthBond.git
cd AthBond

# Create virtual environment
python -m venv version
.\version\Scripts\Activate.ps1  # Windows
# source version/bin/activate    # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt

# Run the ML pipeline
python main.py --mode infer
```

#### 2. **Node.js Web Platform Setup:**
```bash
# Install Node.js dependencies
npm install

# Start the web server
npm start
# or
node server.js
```

## 📁 Project Structure

```
AthBond/
├── 🤖 Python ML Pipeline
│   ├── main.py                 # Main application entry point
│   ├── tensorflow_model.py     # ML model and rep counting
│   ├── mediapipe_utils.py      # Pose detection utilities
│   ├── opencv_utils.py         # Video processing utilities
│   ├── ml_eval.py             # Model evaluation metrics
│   ├── video_analyzer.py      # Video upload and analysis
│   ├── user_manager.py        # User data management
│   ├── api_server.py          # Flask REST API
│   └── requirements.txt       # Python dependencies
│
├── 🌐 Node.js Web Platform
│   ├── server.js              # Main server file
│   ├── package.json           # Node.js dependencies
│   ├── src/                   # Source code
│   │   ├── controllers/       # Route controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   └── services/         # Business logic
│   └── public/               # Frontend files
│       ├── athlete/          # Athlete pages
│       └── coach/            # Coach pages
│
└── 📊 Data Storage
    ├── data/                 # Training data (ignored by Git)
    ├── models/              # ML models (ignored by Git)
    ├── uploads/             # Video uploads (ignored by Git)
    ├── user_data/           # User analytics (ignored by Git)
    └── results/             # Analysis results (ignored by Git)
```

## 🎯 Usage

### **Real-time Pose Analysis:**
```bash
# Activate virtual environment
.\version\Scripts\Activate.ps1

# Run real-time pose detection
python main.py --mode infer

# Run video analysis
python main.py --mode analyze --video path/to/video.mp4

# Train new model
python main.py --mode train --data data/training/
```

### **Web Platform:**
```bash
# Start the web server
npm start

# Access the platform
# Athletes: http://localhost:3000/athlete
# Coaches: http://localhost:3000/coach
```

### **API Endpoints:**
```bash
# Start Flask API server
python start_server.py

# Upload video for analysis
curl -X POST -F "file=@video.mp4" http://localhost:5000/api/upload

# Get user progress
curl http://localhost:5000/api/user/{user_id}/progress
```

## 🔧 Configuration

### **Environment Variables:**
Create `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/athbond
SESSION_SECRET=your-secret-key

# ML Pipeline
MODEL_PATH=models/best_model.h5
UPLOAD_DIR=uploads/
RESULTS_DIR=results/
```

## 📊 ML Pipeline Details

### **Scoring System:**
- **Angle < 90°**: Score 80-100 (Excellent form)
- **Angle ≥ 90°**: Score 0-20 (Needs improvement)
- **Rep Counting**: Tracks complete movement cycles (180° → 0° → 180°)

### **Model Architecture:**
- **Input**: 33 MediaPipe pose landmarks (4D coordinates)
- **Output**: Pose score (0-100) and rep count
- **Framework**: TensorFlow/Keras with custom loss functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **PseudoCoder16** - Lead Developer
- **AI/ML Team** - Pose analysis and scoring algorithms
- **Frontend Team** - Web platform and user interface

## 🆘 Support

For support, email support@athbond.com or create an issue in the repository.

---

**Built with ❤️ for athletes and coaches worldwide**