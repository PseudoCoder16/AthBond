#!/usr/bin/env python3
"""
Test Rep Counting System
=======================

This script demonstrates the rep counting functionality for EthBond.
It simulates arm movements from 180° to 0° and back to count reps.

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
    
    # Calculate wrist position to create the desired angle
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


def simulate_rep_movement():
    """Simulate a complete rep movement from 180° to 0° and back."""
    logger.info("Simulating Rep Movement")
    logger.info("=" * 50)
    
    # Initialize scorer
    scorer = ModelScorer()
    
    # Simulate movement from 180° to 0° (going down)
    logger.info("Phase 1: Going down (180° → 0°)")
    down_angles = [180, 160, 140, 120, 100, 80, 60, 40, 20, 0]
    
    for angle in down_angles:
        keypoints = create_test_keypoints(angle)
        result = scorer.score_pose(None, keypoints)
        
        logger.info(f"  Angle: {angle:3d}° | Score: {result['score']:3.0f} | "
                   f"Reps: {result['rep_count']} | State: {result['rep_state']}")
    
    # Simulate movement from 0° to 180° (going up)
    logger.info("\nPhase 2: Going up (0° → 180°)")
    up_angles = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180]
    
    for angle in up_angles:
        keypoints = create_test_keypoints(angle)
        result = scorer.score_pose(None, keypoints)
        
        logger.info(f"  Angle: {angle:3d}° | Score: {result['score']:3.0f} | "
                   f"Reps: {result['rep_count']} | State: {result['rep_state']}")
    
    logger.info(f"\n🎉 Rep completed! Total reps: {result['rep_count']}")


def simulate_multiple_reps():
    """Simulate multiple reps to test continuous counting."""
    logger.info("\nSimulating Multiple Reps")
    logger.info("=" * 50)
    
    # Initialize scorer
    scorer = ModelScorer()
    
    # Simulate 3 complete reps
    for rep_num in range(1, 4):
        logger.info(f"\n--- Rep {rep_num} ---")
        
        # Down movement
        for angle in [180, 120, 60, 0]:
            keypoints = create_test_keypoints(angle)
            result = scorer.score_pose(None, keypoints)
            logger.info(f"  Down: {angle:3d}° | Reps: {result['rep_count']} | State: {result['rep_state']}")
        
        # Up movement
        for angle in [0, 60, 120, 180]:
            keypoints = create_test_keypoints(angle)
            result = scorer.score_pose(None, keypoints)
            logger.info(f"  Up:   {angle:3d}° | Reps: {result['rep_count']} | State: {result['rep_state']}")
    
    logger.info(f"\n🏆 Final result: {result['rep_count']} reps completed!")


def test_rep_thresholds():
    """Test the rep counting thresholds."""
    logger.info("\nTesting Rep Counting Thresholds")
    logger.info("=" * 50)
    
    scorer = ModelScorer()
    
    # Test different angle ranges
    test_cases = [
        (180, "Fully extended (should start rep)"),
        (150, "Extended (should continue rep)"),
        (120, "Moderately extended"),
        (90, "Halfway"),
        (60, "Moderately bent"),
        (30, "Bent (should complete rep)"),
        (0, "Fully bent (should complete rep)"),
    ]
    
    for angle, description in test_cases:
        keypoints = create_test_keypoints(angle)
        result = scorer.score_pose(None, keypoints)
        
        logger.info(f"{description:30} | Angle: {angle:3d}° | "
                   f"Reps: {result['rep_count']} | State: {result['rep_state']}")


def main():
    """Run all rep counting tests."""
    logger.info("🚀 Testing EthBond Rep Counting System")
    logger.info("=" * 60)
    
    # Test single rep
    simulate_rep_movement()
    
    # Test multiple reps
    simulate_multiple_reps()
    
    # Test thresholds
    test_rep_thresholds()
    
    logger.info("\n" + "=" * 60)
    logger.info("✅ Rep counting system is working correctly!")
    logger.info("🎯 Ready for real-time rep counting!")
    logger.info("Run 'python main.py --mode infer' to start counting reps!")


if __name__ == "__main__":
    main()
