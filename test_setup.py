#!/usr/bin/env python3
"""
Test Setup for EthBond
======================

This module provides quick testing functionality for the EthBond project.
It includes tests for all major components and integration tests.

Author: EthBond Team
Date: 2025
"""

import sys
import os
import logging
import numpy as np
import cv2
from pathlib import Path
from typing import Dict

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our modules
from opencv_utils import VideoCapture, FrameProcessor, ImageUtils
from mediapipe_utils import PoseDetector, KeypointExtractor, PoseAnalyzer
from tensorflow_model import ModelBuilder, ModelTrainer, ModelScorer
from ml_eval import ModelEvaluator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EthBondTester:
    """
    Comprehensive testing class for EthBond components.
    """
    
    def __init__(self):
        """Initialize tester."""
        self.test_results = {}
        logger.info("EthBond tester initialized")
    
    def run_all_tests(self) -> Dict[str, bool]:
        """
        Run all available tests.
        
        Returns:
            Dict[str, bool]: Test results
        """
        logger.info("Running all EthBond tests...")
        
        tests = [
            ('opencv_utils', self.test_opencv_utils),
            ('mediapipe_utils', self.test_mediapipe_utils),
            ('tensorflow_model', self.test_tensorflow_model),
            ('ml_eval', self.test_ml_eval),
            ('integration', self.test_integration),
            ('data_flow', self.test_data_flow)
        ]
        
        for test_name, test_func in tests:
            try:
                logger.info(f"Running {test_name} test...")
                result = test_func()
                self.test_results[test_name] = result
                status = "PASSED" if result else "FAILED"
                logger.info(f"{test_name} test {status}")
            except Exception as e:
                logger.error(f"{test_name} test failed with exception: {str(e)}")
                self.test_results[test_name] = False
        
        # Print summary
        self.print_test_summary()
        
        return self.test_results
    
    def test_opencv_utils(self) -> bool:
        """Test OpenCV utilities."""
        try:
            # Test VideoCapture
            video_capture = VideoCapture()
            logger.info("✓ VideoCapture initialized")
            
            # Test FrameProcessor
            frame_processor = FrameProcessor()
            logger.info("✓ FrameProcessor initialized")
            
            # Test with dummy frame
            dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            processed_frame = frame_processor.preprocess_frame(dummy_frame)
            assert processed_frame.shape == (480, 640, 3)
            logger.info("✓ Frame preprocessing works")
            
            # Test ImageUtils
            test_image_path = "data/test_image.jpg"
            Path("data").mkdir(exist_ok=True)
            
            # Save test image
            success = ImageUtils.save_frame(dummy_frame, test_image_path)
            assert success, "Failed to save test image"
            logger.info("✓ Image saving works")
            
            # Load test image
            loaded_image = ImageUtils.load_image(test_image_path)
            assert loaded_image is not None, "Failed to load test image"
            logger.info("✓ Image loading works")
            
            # Cleanup
            if os.path.exists(test_image_path):
                os.remove(test_image_path)
            
            return True
            
        except Exception as e:
            logger.error(f"OpenCV utils test failed: {str(e)}")
            return False
    
    def test_mediapipe_utils(self) -> bool:
        """Test MediaPipe utilities."""
        try:
            # Test PoseDetector
            pose_detector = PoseDetector()
            logger.info("✓ PoseDetector initialized")
            
            # Test KeypointExtractor
            keypoint_extractor = KeypointExtractor()
            logger.info("✓ KeypointExtractor initialized")
            
            # Test PoseAnalyzer
            pose_analyzer = PoseAnalyzer()
            logger.info("✓ PoseAnalyzer initialized")
            
            # Test with dummy image
            dummy_image = np.zeros((480, 640, 3), dtype=np.uint8)
            
            # Test pose detection
            pose_results = pose_detector.detect_pose(dummy_image)
            assert pose_results is not None, "Pose detection failed"
            logger.info("✓ Pose detection works")
            
            # Test keypoint extraction
            keypoints = keypoint_extractor.extract_keypoints(pose_results)
            assert keypoints.shape == (33, 4), f"Unexpected keypoints shape: {keypoints.shape}"
            logger.info("✓ Keypoint extraction works")
            
            # Test pose analysis
            stability_metrics = pose_analyzer.analyze_pose_stability(pose_results)
            assert isinstance(stability_metrics, dict), "Pose analysis failed"
            logger.info("✓ Pose analysis works")
            
            return True
            
        except Exception as e:
            logger.error(f"MediaPipe utils test failed: {str(e)}")
            return False
    
    def test_tensorflow_model(self) -> bool:
        """Test TensorFlow model utilities."""
        try:
            # Test ModelBuilder
            model_builder = ModelBuilder()
            logger.info("✓ ModelBuilder initialized")
            
            # Test ModelTrainer
            model_trainer = ModelTrainer()
            logger.info("✓ ModelTrainer initialized")
            
            # Test ModelScorer
            model_scorer = ModelScorer()
            logger.info("✓ ModelScorer initialized")
            
            # Test model building
            model = model_builder.build_model(
                input_shape=(33, 4),
                num_classes=5,
                architecture='dense'
            )
            assert model is not None, "Model building failed"
            logger.info("✓ Model building works")
            
            # Test model training with dummy data
            X_train = np.random.randn(50, 33, 4).astype(np.float32)
            y_train = np.random.randint(0, 5, 50)
            
            trained_model = model_trainer.train_model(
                model, X_train, y_train,
                epochs=2,
                batch_size=16,
                verbose=0
            )
            assert trained_model is not None, "Model training failed"
            logger.info("✓ Model training works")
            
            # Test model scoring
            test_keypoints = np.random.randn(33, 4).astype(np.float32)
            score = model_scorer.score_pose(trained_model, test_keypoints)
            assert isinstance(score, (int, float)), "Model scoring failed"
            logger.info("✓ Model scoring works")
            
            return True
            
        except Exception as e:
            logger.error(f"TensorFlow model test failed: {str(e)}")
            return False
    
    def test_ml_eval(self) -> bool:
        """Test ML evaluation utilities."""
        try:
            # Test ModelEvaluator
            evaluator = ModelEvaluator(class_names=['Class 0', 'Class 1', 'Class 2'])
            logger.info("✓ ModelEvaluator initialized")
            
            # Create dummy model and data
            from sklearn.ensemble import RandomForestClassifier
            model = RandomForestClassifier(n_estimators=10, random_state=42)
            
            X_test = np.random.randn(50, 10)
            y_test = np.random.randint(0, 3, 50)
            
            model.fit(X_test, y_test)
            
            # Test model evaluation
            results = evaluator.evaluate_model(model, X_test, y_test, detailed=True)
            assert 'basic_metrics' in results, "Model evaluation failed"
            logger.info("✓ Model evaluation works")
            
            # Test basic metrics
            basic_metrics = results['basic_metrics']
            assert 'accuracy' in basic_metrics, "Accuracy metric missing"
            logger.info("✓ Basic metrics calculation works")
            
            return True
            
        except Exception as e:
            logger.error(f"ML evaluation test failed: {str(e)}")
            return False
    
    def test_integration(self) -> bool:
        """Test integration between components."""
        try:
            # Test full pipeline integration
            logger.info("Testing full pipeline integration...")
            
            # Initialize components
            frame_processor = FrameProcessor()
            pose_detector = PoseDetector()
            keypoint_extractor = KeypointExtractor()
            model_builder = ModelBuilder()
            model_scorer = ModelScorer()
            
            # Create dummy model
            model = model_builder.build_model(
                input_shape=(33, 4),
                num_classes=3,
                architecture='dense'
            )
            
            # Train with dummy data
            X_train = np.random.randn(20, 33, 4).astype(np.float32)
            y_train = np.random.randint(0, 3, 20)
            
            trainer = ModelTrainer()
            trained_model = trainer.train_model(
                model, X_train, y_train,
                epochs=1,
                batch_size=10,
                verbose=0
            )
            
            # Test full pipeline
            dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            
            # Process frame
            processed_frame = frame_processor.preprocess_frame(dummy_frame)
            assert processed_frame is not None, "Frame processing failed"
            
            # Detect pose
            pose_results = pose_detector.detect_pose(processed_frame)
            assert pose_results is not None, "Pose detection failed"
            
            # Extract keypoints
            keypoints = keypoint_extractor.extract_keypoints(pose_results)
            assert keypoints.shape == (33, 4), "Keypoint extraction failed"
            
            # Score pose
            score = model_scorer.score_pose(trained_model, keypoints)
            assert isinstance(score, (int, float)), "Pose scoring failed"
            
            logger.info("✓ Full pipeline integration works")
            return True
            
        except Exception as e:
            logger.error(f"Integration test failed: {str(e)}")
            return False
    
    def test_data_flow(self) -> bool:
        """Test data flow and file operations."""
        try:
            # Test directory creation
            test_dirs = ['data', 'models', 'data/raw', 'data/processed']
            for dir_path in test_dirs:
                Path(dir_path).mkdir(parents=True, exist_ok=True)
                assert Path(dir_path).exists(), f"Failed to create directory: {dir_path}"
            logger.info("✓ Directory creation works")
            
            # Test data saving and loading
            test_data = np.random.randn(10, 33, 4)
            test_labels = np.random.randint(0, 5, 10)
            
            # Save test data
            np.save('data/test_features.npy', test_data)
            np.save('data/test_labels.npy', test_labels)
            logger.info("✓ Data saving works")
            
            # Load test data
            loaded_data = np.load('data/test_features.npy')
            loaded_labels = np.load('data/test_labels.npy')
            
            assert np.array_equal(test_data, loaded_data), "Data loading failed"
            assert np.array_equal(test_labels, loaded_labels), "Label loading failed"
            logger.info("✓ Data loading works")
            
            # Cleanup
            for file_path in ['data/test_features.npy', 'data/test_labels.npy']:
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Data flow test failed: {str(e)}")
            return False
    
    def print_test_summary(self):
        """Print test summary."""
        logger.info("\n" + "="*50)
        logger.info("ETHBOND TEST SUMMARY")
        logger.info("="*50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        failed_tests = total_tests - passed_tests
        
        for test_name, result in self.test_results.items():
            status = "✓ PASSED" if result else "✗ FAILED"
            logger.info(f"{test_name:20} {status}")
        
        logger.info("-"*50)
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests}")
        logger.info(f"Failed: {failed_tests}")
        logger.info(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests == 0:
            logger.info("🎉 ALL TESTS PASSED! EthBond is ready to use!")
        else:
            logger.info("⚠️  Some tests failed. Please check the logs above.")
        
        logger.info("="*50)


def quick_test():
    """
    Quick test function for basic functionality.
    """
    logger.info("Running quick EthBond test...")
    
    try:
        # Test basic imports
        from opencv_utils import VideoCapture
        from mediapipe_utils import PoseDetector
        from tensorflow_model import ModelBuilder
        from ml_eval import ModelEvaluator
        
        logger.info("✓ All modules imported successfully")
        
        # Test basic initialization
        video_capture = VideoCapture()
        pose_detector = PoseDetector()
        model_builder = ModelBuilder()
        evaluator = ModelEvaluator()
        
        logger.info("✓ All components initialized successfully")
        logger.info("🎉 Quick test passed! EthBond is working!")
        
        return True
        
    except Exception as e:
        logger.error(f"Quick test failed: {str(e)}")
        return False


def main():
    """Main test function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='EthBond Test Suite')
    parser.add_argument('--quick', action='store_true', help='Run quick test only')
    parser.add_argument('--component', type=str, help='Test specific component')
    
    args = parser.parse_args()
    
    if args.quick:
        quick_test()
    elif args.component:
        tester = EthBondTester()
        if hasattr(tester, f'test_{args.component}'):
            test_func = getattr(tester, f'test_{args.component}')
            result = test_func()
            status = "PASSED" if result else "FAILED"
            logger.info(f"{args.component} test {status}")
        else:
            logger.error(f"Unknown component: {args.component}")
    else:
        tester = EthBondTester()
        tester.run_all_tests()


if __name__ == "__main__":
    main()
