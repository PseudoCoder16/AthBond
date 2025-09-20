#!/usr/bin/env python3
"""
Test Angle-Based Scoring System
==============================

This script demonstrates the new angle-based scoring system for EthBond.
It shows how different arm angles result in different scores.

Author: EthBond Team
Date: 2025
"""

import numpy as np
import logging
from tensorflow_model import ModelScorer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_test_keypoints(angle_degrees):
    """
    Create test keypoints with a specific elbow angle.
    
    Args:
        angle_degrees: Desired elbow angle in degrees
        
    Returns:
        np.ndarray: Keypoints array (33, 4)
    """
    # Create base keypoints array
    keypoints = np.zeros((33, 4), dtype=np.float32)
    
    # Set visibility for all landmarks
    keypoints[:, 3] = 1.0  # All landmarks visible
    
    # Define base positions (normalized coordinates 0-1)
    # Shoulder position
    shoulder_x, shoulder_y = 0.4, 0.3
    # Elbow position
    elbow_x, elbow_y = 0.4, 0.5
    
    # For elbow angle calculation, we need to position the wrist correctly
    # The angle is between shoulder-elbow-wrist
    # We'll position the wrist to create the desired angle
    
    # Calculate the direction from elbow to shoulder
    shoulder_to_elbow = np.array([shoulder_x - elbow_x, shoulder_y - elbow_y])
    shoulder_to_elbow = shoulder_to_elbow / np.linalg.norm(shoulder_to_elbow)
    
    # Calculate wrist position to create the desired angle
    # The angle between shoulder-elbow-wrist should be the desired angle
    forearm_length = 0.15
    
    # Rotate the shoulder-to-elbow vector by the desired angle
    angle_rad = np.radians(angle_degrees)
    cos_angle = np.cos(angle_rad)
    sin_angle = np.sin(angle_rad)
    
    # Create rotation matrix
    rotation_matrix = np.array([[cos_angle, -sin_angle], [sin_angle, cos_angle]])
    
    # Rotate the vector and scale it
    wrist_direction = rotation_matrix @ shoulder_to_elbow
    wrist_x = elbow_x + wrist_direction[0] * forearm_length
    wrist_y = elbow_y + wrist_direction[1] * forearm_length
    
    # Set landmark positions
    # Left arm landmarks
    keypoints[11] = [shoulder_x, shoulder_y, 0.0, 1.0]  # Left shoulder
    keypoints[13] = [elbow_x, elbow_y, 0.0, 1.0]        # Left elbow
    keypoints[15] = [wrist_x, wrist_y, 0.0, 1.0]        # Left wrist
    
    # Right arm landmarks (mirror)
    keypoints[12] = [1.0 - shoulder_x, shoulder_y, 0.0, 1.0]  # Right shoulder
    keypoints[14] = [1.0 - elbow_x, elbow_y, 0.0, 1.0]        # Right elbow
    keypoints[16] = [1.0 - wrist_x, wrist_y, 0.0, 1.0]        # Right wrist
    
    # Add some basic body landmarks for completeness
    keypoints[0] = [0.5, 0.1, 0.0, 1.0]   # Nose
    keypoints[23] = [0.4, 0.7, 0.0, 1.0]  # Left hip
    keypoints[24] = [0.6, 0.7, 0.0, 1.0]  # Right hip
    
    return keypoints


def test_angle_scoring():
    """Test the angle-based scoring system with different angles."""
    logger.info("Testing Angle-Based Scoring System")
    logger.info("=" * 50)
    
    # Initialize scorer
    scorer = ModelScorer()
    
    # Test different angles
    test_angles = [0, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180]
    
    logger.info("Angle\tScore\tCategory")
    logger.info("-" * 30)
    
    for angle in test_angles:
        # Create test keypoints
        keypoints = create_test_keypoints(angle)
        
        # Calculate score
        score = scorer.score_pose(None, keypoints)  # Model not needed for angle-based scoring
        
        # Determine category
        if score >= 80:
            category = "GOOD POSTURE"
        else:
            category = "NEEDS IMPROVEMENT"
        
        logger.info(f"{angle:3d}°\t{score:3.0f}\t{category}")
    
    logger.info("=" * 50)
    logger.info("Scoring Logic:")
    logger.info("- Angle < 90°: Score 80-100 (Good Posture)")
    logger.info("- Angle ≥ 90°: Score 0-20 (Needs Improvement)")
    logger.info("- 0° = Perfect (100 points)")
    logger.info("- 90° = Threshold (80 points)")
    logger.info("- 180° = Worst (0 points)")


def test_realistic_scenarios():
    """Test realistic arm positions."""
    logger.info("\nTesting Realistic Scenarios")
    logger.info("=" * 50)
    
    scorer = ModelScorer()
    
    scenarios = [
        (45, "Arms bent at 45° - Good form"),
        (75, "Arms bent at 75° - Good form"),
        (90, "Arms at 90° - Threshold"),
        (120, "Arms extended at 120° - Needs improvement"),
        (150, "Arms almost straight at 150° - Poor form"),
    ]
    
    for angle, description in scenarios:
        keypoints = create_test_keypoints(angle)
        score = scorer.score_pose(None, keypoints)
        
        logger.info(f"{description}")
        logger.info(f"  Angle: {angle}°")
        logger.info(f"  Score: {score:.0f}/100")
        
        if score >= 80:
            logger.info(f"  Result: ✅ GOOD POSTURE")
        else:
            logger.info(f"  Result: ❌ NEEDS IMPROVEMENT")
        logger.info("")


if __name__ == "__main__":
    test_angle_scoring()
    test_realistic_scenarios()
    
    logger.info("🎯 Angle-based scoring system is ready!")
    logger.info("Run 'python main.py --mode infer' to test with real-time video.")
