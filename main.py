#!/usr/bin/env python3
"""
EthBond - Main Entry Point
==========================

This is the main entry point for the EthBond project pipeline.
It orchestrates the entire workflow from video capture to model scoring.

Author: EthBond Team
Date: 2025
"""

import os
import sys
import argparse
import logging
import cv2
from pathlib import Path

# Import our custom modules
from opencv_utils import VideoCapture, FrameProcessor
from mediapipe_utils import PoseDetector, KeypointExtractor
from tensorflow_model import ModelBuilder, ModelTrainer, ModelScorer
from ml_eval import ModelEvaluator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ethbond.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class EthBondPipeline:
    """
    Main pipeline class that orchestrates the entire EthBond workflow.
    """
    
    def __init__(self, config=None):
        """
        Initialize the EthBond pipeline.
        
        Args:
            config (dict): Configuration parameters for the pipeline
        """
        self.config = config or self._get_default_config()
        self.setup_directories()
        
        # Initialize components
        self.video_capture = VideoCapture()
        self.frame_processor = FrameProcessor()
        self.pose_detector = PoseDetector()
        self.keypoint_extractor = KeypointExtractor()
        self.model_builder = ModelBuilder()
        self.model_trainer = ModelTrainer()
        self.model_scorer = ModelScorer()
        self.evaluator = ModelEvaluator()
        
        logger.info("EthBond pipeline initialized successfully")
    
    def _get_default_config(self):
        """Get default configuration parameters."""
        return {
            'video_source': 0,  # Default webcam
            'model_path': 'models/best_model.h5',
            'data_path': 'data/',
            'batch_size': 32,
            'epochs': 100,
            'learning_rate': 0.001,
            'input_shape': (33, 4),  # MediaPipe pose landmarks
            'num_classes': 5,  # Adjust based on your scoring system
            'confidence_threshold': 0.5
        }
    
    def setup_directories(self):
        """Create necessary directories if they don't exist."""
        directories = ['data', 'models', 'data/raw', 'data/processed', 'data/training', 'data/testing']
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            logger.info(f"Directory ensured: {directory}")
    
    def run_training_pipeline(self, training_data_path=None):
        """
        Run the complete training pipeline.
        
        Args:
            training_data_path (str): Path to training data
        """
        logger.info("Starting training pipeline...")
        
        try:
            # Step 1: Load and preprocess training data
            logger.info("Loading training data...")
            X_train, y_train, X_val, y_val = self._load_training_data(training_data_path)
            
            # Step 2: Build model
            logger.info("Building model architecture...")
            model = self.model_builder.build_model(
                input_shape=self.config['input_shape'],
                num_classes=self.config['num_classes']
            )
            
            # Step 3: Train model
            logger.info("Training model...")
            trained_model = self.model_trainer.train_model(
                model=model,
                X_train=X_train,
                y_train=y_train,
                X_val=X_val,
                y_val=y_val,
                epochs=self.config['epochs'],
                batch_size=self.config['batch_size']
            )
            
            # Step 4: Save model
            model_path = self.config['model_path']
            trained_model.save(model_path)
            logger.info(f"Model saved to: {model_path}")
            
            # Step 5: Evaluate model
            logger.info("Evaluating model...")
            evaluation_results = self.evaluator.evaluate_model(
                model=trained_model,
                X_test=X_val,
                y_test=y_val
            )
            
            logger.info("Training pipeline completed successfully!")
            return trained_model, evaluation_results
            
        except Exception as e:
            logger.error(f"Training pipeline failed: {str(e)}")
            raise
    
    def run_inference_pipeline(self, video_source=None, model_path=None):
        """
        Run the inference pipeline for real-time scoring with rep counting.
        
        Args:
            video_source: Video source (0 for webcam, or path to video file)
            model_path: Path to trained model
        """
        logger.info("Starting inference pipeline...")
        
        try:
            # Load trained model
            model_path = model_path or self.config['model_path']
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model not found at: {model_path}")
            
            model = self.model_builder.load_model(model_path)
            logger.info(f"Model loaded from: {model_path}")
            
            # Initialize video capture with optimizations
            video_source = video_source or self.config['video_source']
            cap = self.video_capture.initialize_capture(video_source)
            
            logger.info("Starting real-time inference...")
            logger.info("Press 'q' to quit, 's' to save current frame, 'r' to reset reps")
            
            frame_count = 0
            last_rep_count = 0
            
            while True:
                # Capture frame
                ret, frame = cap.read()
                if not ret:
                    logger.warning("Failed to capture frame")
                    break
                
                frame_count += 1
                
                # Process frame
                processed_frame = self.frame_processor.preprocess_frame(frame)
                
                # Detect pose
                pose_results = self.pose_detector.detect_pose(processed_frame)
                
                if pose_results.pose_landmarks:
                    # Extract keypoints
                    keypoints = self.keypoint_extractor.extract_keypoints(pose_results)
                    
                    # Score using model and get rep data
                    result = self.model_scorer.score_pose(model, keypoints)
                    
                    # Check for new rep
                    if result['rep_count'] > last_rep_count:
                        logger.info(f"🎉 NEW REP! Total: {result['rep_count']}")
                        last_rep_count = result['rep_count']
                    
                    # Display results
                    self._display_results(frame, result, pose_results)
                else:
                    # No pose detected, show basic info
                    self._display_no_pose(frame)
                
                # Handle key presses
                key = self.video_capture.wait_key(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('s'):
                    self._save_frame(frame, frame_count)
                elif key == ord('r'):
                    self.model_scorer.reset_rep_count()
                    last_rep_count = 0
                    logger.info("Rep counter reset!")
            
            # Cleanup
            cap.release()
            self.video_capture.destroy_windows()
            logger.info("Inference pipeline completed")
            
        except Exception as e:
            logger.error(f"Inference pipeline failed: {str(e)}")
            raise
    
    def _load_training_data(self, data_path):
        """Load and preprocess training data."""
        # This is a placeholder - implement based on your data format
        logger.info("Loading training data...")
        # TODO: Implement data loading logic
        return None, None, None, None
    
    def _display_results(self, frame, result, pose_results):
        """Display results on the frame with rep counting."""
        score = result['score']
        angle = result['angle']
        rep_count = result['rep_count']
        rep_state = result['rep_state']
        
        # Add score text to frame with 0-100 range
        score_text = f"Score: {score:.0f}/100"
        
        # Color coding based on score
        if score >= 80:
            color = (0, 255, 0)  # Green for excellent
            level_text = "GOOD POSTURE"
        elif score >= 60:
            color = (0, 255, 255)  # Yellow for good
            level_text = "GOOD POSTURE"
        elif score >= 40:
            color = (0, 165, 255)  # Orange for moderate
            level_text = "GOOD POSTURE"
        else:
            color = (0, 0, 255)  # Red for poor
            level_text = "NEEDS IMPROVEMENT"
        
        cv2.putText(frame, score_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        cv2.putText(frame, level_text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Add rep counter
        rep_text = f"Reps: {rep_count}"
        cv2.putText(frame, rep_text, (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
        
        # Add angle information
        angle_text = f"Angle: {angle:.1f}°"
        cv2.putText(frame, angle_text, (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Add rep state
        state_text = f"State: {rep_state.replace('_', ' ').title()}"
        cv2.putText(frame, state_text, (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Add instruction text
        if angle < 90:
            instruction = "Keep arms bent < 90°"
            instruction_color = (0, 255, 0)
        else:
            instruction = "Bend arms more < 90°"
            instruction_color = (0, 0, 255)
        
        cv2.putText(frame, instruction, (10, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.5, instruction_color, 2)
        
        # Add controls info
        controls_text = "Press 'r' to reset reps"
        cv2.putText(frame, controls_text, (10, frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (128, 128, 128), 1)
        
        # Draw pose landmarks
        self.pose_detector.draw_landmarks(frame, pose_results)
        
        # Display frame
        cv2.imshow('EthBond - Real-time Scoring', frame)
    
    def _display_no_pose(self, frame):
        """Display frame when no pose is detected."""
        # Add "No pose detected" message
        cv2.putText(frame, "No pose detected", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, "Position yourself in front of camera", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Show current rep count
        rep_text = f"Reps: {self.model_scorer.rep_count}"
        cv2.putText(frame, rep_text, (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
        
        # Display frame
        cv2.imshow('EthBond - Real-time Scoring', frame)
    
    def _save_frame(self, frame, frame_count):
        """Save current frame."""
        filename = f"data/saved_frames/frame_{frame_count:06d}.jpg"
        Path(filename).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(filename, frame)
        logger.info(f"Frame saved: {filename}")


def main():
    """Main function to run the EthBond pipeline."""
    parser = argparse.ArgumentParser(description='EthBond - AI-powered pose scoring system')
    parser.add_argument('--mode', choices=['train', 'infer', 'eval'], default='infer',
                       help='Pipeline mode: train, infer, or eval')
    parser.add_argument('--video-source', type=str, default='0',
                       help='Video source (0 for webcam, or path to video file)')
    parser.add_argument('--model-path', type=str, default='models/best_model.h5',
                       help='Path to trained model')
    parser.add_argument('--data-path', type=str, default='data/',
                       help='Path to training data')
    parser.add_argument('--config', type=str, help='Path to configuration file')
    
    args = parser.parse_args()
    
    try:
        # Initialize pipeline
        pipeline = EthBondPipeline()
        
        if args.mode == 'train':
            logger.info("Running in training mode...")
            pipeline.run_training_pipeline(args.data_path)
            
        elif args.mode == 'infer':
            logger.info("Running in inference mode...")
            video_source = int(args.video_source) if args.video_source.isdigit() else args.video_source
            pipeline.run_inference_pipeline(video_source, args.model_path)
            
        elif args.mode == 'eval':
            logger.info("Running in evaluation mode...")
            # TODO: Implement evaluation mode
            pass
            
    except KeyboardInterrupt:
        logger.info("Pipeline interrupted by user")
    except Exception as e:
        logger.error(f"Pipeline failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
