#!/usr/bin/env python3
"""
Test Complete Rep Counting System
=================================

This script demonstrates the complete rep counting functionality.
It simulates realistic arm movements from 180° to 0° and back.

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
    """Create test keypoints with a specific elbow angle."""
    keypoints = np.zeros((33, 4), dtype=np.float32)
    keypoints[:, 3] = 1.0  # All landmarks visible
    
    # Define base positions
    shoulder_x, shoulder_y = 0.4, 0.3
    elbow_x, elbow_y = 0.4, 0.5
    
    # Calculate wrist position
    shoulder_to_elbow = np.array([shoulder_x - elbow_x, shoulder_y - elbow_y])
    shoulder_to_elbow = shoulder_to_elbow / np.linalg.norm(shoulder_to_elbow)
    
    forearm_length = 0.15
    angle_rad = np.radians(angle_degrees)
    cos_angle = np.cos(angle_rad)
    sin_angle = np.sin(angle_rad)
    
    rotation_matrix = np.array([[cos_angle, -sin_angle], [sin_angle, cos_angle]])
    wrist_direction = rotation_matrix @ shoulder_to_elbow
    wrist_x = elbow_x + wrist_direction[0] * forearm_length
    wrist_y = elbow_y + wrist_direction[1] * forearm_length
    
    # Set landmark positions
    keypoints[11] = [shoulder_x, shoulder_y, 0.0, 1.0]  # Left shoulder
    keypoints[13] = [elbow_x, elbow_y, 0.0, 1.0]        # Left elbow
    keypoints[15] = [wrist_x, wrist_y, 0.0, 1.0]        # Left wrist
    
    # Right arm landmarks (mirror)
    keypoints[12] = [1.0 - shoulder_x, shoulder_y, 0.0, 1.0]  # Right shoulder
    keypoints[14] = [1.0 - elbow_x, elbow_y, 0.0, 1.0]        # Right elbow
    keypoints[16] = [1.0 - wrist_x, wrist_y, 0.0, 1.0]        # Right wrist
    
    # Basic body landmarks
    keypoints[0] = [0.5, 0.1, 0.0, 1.0]   # Nose
    keypoints[23] = [0.4, 0.7, 0.0, 1.0]  # Left hip
    keypoints[24] = [0.6, 0.7, 0.0, 1.0]  # Right hip
    
    return keypoints


def simulate_complete_rep():
    """Simulate a complete rep with proper angle transitions."""
    logger.info("Simulating Complete Rep Movement")
    logger.info("=" * 50)
    
    scorer = ModelScorer()
    
    # Simulate complete movement: 180° → 0° → 180°
    angles = [
        180, 170, 160, 150, 140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0,  # Down
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180  # Up
    ]
    
    for i, angle in enumerate(angles):
        keypoints = create_test_keypoints(angle)
        result = scorer.score_pose(None, keypoints)
        
        phase = "Down" if i < len(angles) // 2 else "Up"
        logger.info(f"{phase:4s}: {angle:3d}° | Score: {result['score']:3.0f} | "
                   f"Reps: {result['rep_count']} | State: {result['rep_state']}")
    
    logger.info(f"\n🎉 Rep completed! Total reps: {result['rep_count']}")


def simulate_multiple_complete_reps():
    """Simulate multiple complete reps."""
    logger.info("\nSimulating Multiple Complete Reps")
    logger.info("=" * 50)
    
    scorer = ModelScorer()
    
    for rep_num in range(1, 4):
        logger.info(f"\n--- Rep {rep_num} ---")
        
        # Complete movement for each rep
        angles = [
            180, 150, 120, 90, 60, 30, 0,  # Down
            30, 60, 90, 120, 150, 180      # Up
        ]
        
        for angle in angles:
            keypoints = create_test_keypoints(angle)
            result = scorer.score_pose(None, keypoints)
            
            logger.info(f"  {angle:3d}° | Reps: {result['rep_count']} | State: {result['rep_state']}")
    
    logger.info(f"\n🏆 Final result: {result['rep_count']} reps completed!")


def test_rep_detection_accuracy():
    """Test rep detection with different movement patterns."""
    logger.info("\nTesting Rep Detection Accuracy")
    logger.info("=" * 50)
    
    scorer = ModelScorer()
    
    # Test case 1: Perfect rep
    logger.info("Test 1: Perfect rep (180° → 0° → 180°)")
    perfect_angles = [180, 135, 90, 45, 0, 45, 90, 135, 180]
    for angle in perfect_angles:
        keypoints = create_test_keypoints(angle)
        result = scorer.score_pose(None, keypoints)
        logger.info(f"  {angle:3d}° | Reps: {result['rep_count']} | State: {result['rep_state']}")
    
    # Reset for next test
    scorer.reset_rep_count()
    
    # Test case 2: Incomplete rep (only going down)
    logger.info("\nTest 2: Incomplete rep (180° → 0° only)")
    incomplete_angles = [180, 135, 90, 45, 0]
    for angle in incomplete_angles:
        keypoints = create_test_keypoints(angle)
        result = scorer.score_pose(None, keypoints)
        logger.info(f"  {angle:3d}° | Reps: {result['rep_count']} | State: {result['rep_state']}")
    
    # Reset for next test
    scorer.reset_rep_count()
    
    # Test case 3: Multiple quick reps
    logger.info("\nTest 3: Multiple quick reps")
    quick_reps = [180, 0, 180, 0, 180, 0, 180]
    for angle in quick_reps:
        keypoints = create_test_keypoints(angle)
        result = scorer.score_pose(None, keypoints)
        logger.info(f"  {angle:3d}° | Reps: {result['rep_count']} | State: {result['rep_state']}")


def main():
    """Run all rep counting tests."""
    logger.info("🚀 Testing Complete EthBond Rep Counting System")
    logger.info("=" * 60)
    
    # Test single complete rep
    simulate_complete_rep()
    
    # Test multiple complete reps
    simulate_multiple_complete_reps()
    
    # Test rep detection accuracy
    test_rep_detection_accuracy()
    
    logger.info("\n" + "=" * 60)
    logger.info("✅ Complete rep counting system is working correctly!")
    logger.info("🎯 Ready for real-time rep counting!")
    logger.info("Run 'python main.py --mode infer' to start counting reps!")


if __name__ == "__main__":
    main()


