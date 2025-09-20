# EthBond - AI-Powered Pose Scoring System

EthBond is a comprehensive machine learning system for real-time pose analysis and scoring using computer vision, pose detection, and deep learning.

## 🚀 Features

- **Real-time Pose Detection**: Using MediaPipe for accurate pose landmark extraction
- **Advanced ML Models**: TensorFlow-based models for pose scoring and classification
- **Intuitive Scoring System**: 0-100 point scale with color-coded performance levels
- **Comprehensive Evaluation**: Detailed metrics including accuracy, precision, recall, and confusion matrices
- **Video Processing**: OpenCV-based video capture and frame preprocessing
- **Modular Architecture**: Clean, well-documented codebase with separate modules for each component

## 📁 Project Structure

```
athbond/
├── version/                    # Virtual environment (ignore)
├── data/                      # Dataset storage (CSV, JSON)
├── models/                    # Saved ML/TensorFlow models
├── main.py                    # Main entry point (runs whole pipeline)
├── opencv_utils.py            # Video capture & frame preprocessing
├── mediapipe_utils.py         # Pose detection & keypoint extraction
├── ml_eval.py                 # Evaluation metrics (accuracy, precision, recall, confusion matrix)
├── tensorflow_model.py        # Builds & trains TF model for scoring
├── test_setup.py              # Quick test suite
├── requirements.txt           # Project dependencies
└── README.md                  # This file
```

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd athbond
   ```

2. **Activate virtual environment**:
   ```bash
   # Windows
   .\version\Scripts\Activate.ps1
   
   # Linux/Mac
   source version/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## 🎯 Usage

### Quick Test
```bash
python test_setup.py --quick
```

### Full Test Suite
```bash
python test_setup.py
```

### Training Mode
```bash
python main.py --mode train --data-path data/training/
```

### Inference Mode (Real-time)
```bash
python main.py --mode infer --video-source 0
```

### Evaluation Mode
```bash
python main.py --mode eval --model-path models/ethbond_model.h5
```

## 📊 Components

### 1. OpenCV Utils (`opencv_utils.py`)
- Video capture and frame preprocessing
- Image enhancement and filtering
- Video I/O operations
- Frame saving and loading utilities

### 2. MediaPipe Utils (`mediapipe_utils.py`)
- Pose detection using MediaPipe
- Keypoint extraction and normalization
- Pose analysis and stability metrics
- Landmark visualization

### 3. TensorFlow Model (`tensorflow_model.py`)
- Multiple model architectures (Dense, CNN, LSTM, Transformer)
- Model training with advanced callbacks
- Real-time pose scoring
- Model explanation and confidence analysis

### 4. ML Evaluation (`ml_eval.py`)
- Comprehensive evaluation metrics
- Visualization tools (confusion matrix, ROC curves, learning curves)
- HTML report generation
- Cross-validation and learning curve analysis

### 5. Main Pipeline (`main.py`)
- Orchestrates the entire workflow
- Training and inference pipelines
- Real-time video processing
- Command-line interface

## 🔧 Configuration

The system uses a default configuration that can be customized:

```python
config = {
    'video_source': 0,  # Default webcam
    'model_path': 'models/ethbond_model.h5',
    'data_path': 'data/',
    'batch_size': 32,
    'epochs': 100,
    'learning_rate': 0.001,
    'input_shape': (33, 4),  # MediaPipe pose landmarks
    'num_classes': 10,  # Adjust based on your scoring system
    'confidence_threshold': 0.5
}
```

## 📈 Model Architectures

The system supports multiple model architectures:

1. **Dense Neural Network**: Standard fully connected layers
2. **CNN**: Convolutional layers for spatial feature extraction
3. **LSTM**: Recurrent layers for temporal sequence analysis
4. **Transformer**: Attention-based architecture for complex patterns

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Test all components
python test_setup.py

# Test specific component
python test_setup.py --component opencv_utils

# Quick functionality test
python test_setup.py --quick
```

## 📝 Dependencies

- **TensorFlow 2.13.0**: Deep learning framework
- **OpenCV 4.12.0**: Computer vision library
- **MediaPipe 0.10.9**: Pose detection
- **scikit-learn 1.7.2**: Machine learning utilities
- **NumPy 1.24.3**: Numerical computing
- **Matplotlib 3.10.6**: Visualization
- **Pandas**: Data manipulation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python test_setup.py`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the test suite for examples
- Review the comprehensive documentation in each module

## 🎉 Getting Started

1. **Run the quick test** to verify everything is working:
   ```bash
   python test_setup.py --quick
   ```

2. **Try the inference mode** with your webcam:
   ```bash
   python main.py --mode infer
   ```

3. **Explore the code** - each module is well-documented with examples and test functions.

---

**EthBond** - Empowering pose analysis with AI! 🚀
