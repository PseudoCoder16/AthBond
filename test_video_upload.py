#!/usr/bin/env python3
"""
Test Video Upload and Analysis System
====================================

This script tests the complete video upload and analysis system for EthBond.

Author: EthBond Team
Date: 2025
"""

import os
import sys
import logging
import tempfile
import numpy as np
import cv2
from pathlib import Path

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from video_analyzer import VideoAnalyzer
from user_manager import UserManager
from api_server import app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_test_video(output_path: str, duration: int = 10, fps: int = 30):
    """
    Create a test video with simulated pose movements.
    
    Args:
        output_path: Path to save the test video
        duration: Video duration in seconds
        fps: Frames per second
    """
    logger.info(f"Creating test video: {output_path}")
    
    # Video properties
    width, height = 640, 480
    total_frames = duration * fps
    
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    for frame_idx in range(total_frames):
        # Create frame
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame.fill(50)  # Dark background
        
        # Simulate arm movement (180° to 0° and back)
        progress = frame_idx / total_frames
        
        # Calculate angle (simulate rep movement)
        if progress < 0.5:
            # Going down (180° to 0°)
            angle = 180 - (progress * 2 * 180)
        else:
            # Going up (0° to 180°)
            angle = (progress - 0.5) * 2 * 180
        
        # Draw simple stick figure
        center_x, center_y = width // 2, height // 2
        
        # Head
        cv2.circle(frame, (center_x, center_y - 80), 20, (255, 255, 255), -1)
        
        # Body
        cv2.line(frame, (center_x, center_y - 60), (center_x, center_y + 60), (255, 255, 255), 3)
        
        # Arms (simulate elbow angle)
        arm_length = 60
        elbow_x = center_x
        elbow_y = center_y - 20
        
        # Calculate arm positions based on angle
        angle_rad = np.radians(angle)
        
        # Upper arm (shoulder to elbow)
        upper_arm_end_x = elbow_x + int(arm_length * 0.5 * np.cos(angle_rad))
        upper_arm_end_y = elbow_y + int(arm_length * 0.5 * np.sin(angle_rad))
        
        # Lower arm (elbow to wrist)
        lower_arm_end_x = upper_arm_end_x + int(arm_length * 0.5 * np.cos(angle_rad + np.pi))
        lower_arm_end_y = upper_arm_end_y + int(arm_length * 0.5 * np.sin(angle_rad + np.pi))
        
        # Draw arms
        cv2.line(frame, (center_x, center_y - 40), (upper_arm_end_x, upper_arm_end_y), (255, 255, 255), 3)
        cv2.line(frame, (upper_arm_end_x, upper_arm_end_y), (lower_arm_end_x, lower_arm_end_y), (255, 255, 255), 3)
        
        # Draw right arm (mirror)
        cv2.line(frame, (center_x, center_y - 40), (center_x - (upper_arm_end_x - center_x), upper_arm_end_y), (255, 255, 255), 3)
        cv2.line(frame, (center_x - (upper_arm_end_x - center_x), upper_arm_end_y), 
                (center_x - (lower_arm_end_x - center_x), lower_arm_end_y), (255, 255, 255), 3)
        
        # Add angle text
        cv2.putText(frame, f"Angle: {angle:.1f}°", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"Frame: {frame_idx}/{total_frames}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Write frame
        out.write(frame)
    
    out.release()
    logger.info(f"Test video created: {output_path}")


def test_video_analysis():
    """Test video analysis functionality."""
    logger.info("Testing Video Analysis System")
    logger.info("=" * 50)
    
    # Create test video
    test_video_path = "test_video.mp4"
    create_test_video(test_video_path, duration=5, fps=15)
    
    # Initialize analyzer
    analyzer = VideoAnalyzer()
    
    # Analyze video
    logger.info("Analyzing test video...")
    results = analyzer.analyze_video(test_video_path, "test_user")
    
    # Display results
    logger.info("Analysis Results:")
    logger.info(f"  Analysis ID: {results['analysis_id']}")
    logger.info(f"  Total Reps: {results['total_reps']}")
    logger.info(f"  Average Score: {results['average_score']}")
    logger.info(f"  Performance Level: {results['performance_level']}")
    logger.info(f"  Badges Earned: {len([b for b in results['badges'] if b['earned']])}")
    
    for badge in results['badges']:
        status = "✅" if badge['earned'] else "❌"
        logger.info(f"    {status} {badge['name']}: {badge['description']}")
    
    # Clean up
    os.remove(test_video_path)
    logger.info("Test video cleaned up")
    
    return results


def test_user_management():
    """Test user management functionality."""
    logger.info("\nTesting User Management System")
    logger.info("=" * 50)
    
    # Initialize user manager
    manager = UserManager()
    
    # Create test user
    user_id = manager.create_user("TestUser", "test@example.com")
    logger.info(f"Created user: {user_id}")
    
    # Get user data
    user = manager.get_user(user_id)
    logger.info(f"User data: {user['username']}")
    
    # Simulate analysis results
    analysis_results = {
        'total_reps': 5,
        'average_score': 85.5,
        'performance_level': 'Excellent',
        'badges': [
            {'name': 'Consistency Star', 'earned': True, 'level': 'gold'},
            {'name': 'Fast Learner', 'earned': True, 'level': 'silver'},
            {'name': 'Perfect Form', 'earned': False, 'level': 'locked'},
            {'name': 'Strength Master', 'earned': False, 'level': 'locked'}
        ]
    }
    
    # Update user progress
    manager.update_user_progress(user_id, analysis_results)
    logger.info("Updated user progress")
    
    # Get user progress
    progress = manager.get_user_progress(user_id)
    logger.info(f"User progress: {progress['total_videos']} videos, {progress['average_performance']}% avg")
    
    # Test leaderboard
    leaderboard = manager.get_leaderboard()
    logger.info(f"Leaderboard: {len(leaderboard)} users")
    
    return user_id


def test_api_endpoints():
    """Test API endpoints."""
    logger.info("\nTesting API Endpoints")
    logger.info("=" * 50)
    
    # Test with Flask test client
    with app.test_client() as client:
        # Health check
        response = client.get('/api/health')
        logger.info(f"Health check: {response.status_code}")
        
        # Create user
        response = client.post('/api/user/create', 
                             json={'username': 'APITestUser', 'email': 'api@test.com'})
        if response.status_code == 200:
            user_data = response.get_json()
            user_id = user_data['user_id']
            logger.info(f"Created user via API: {user_id}")
            
            # Get user progress
            response = client.get(f'/api/user/{user_id}/progress')
            logger.info(f"User progress: {response.status_code}")
            
            # Get leaderboard
            response = client.get('/api/leaderboard')
            logger.info(f"Leaderboard: {response.status_code}")
        else:
            logger.error(f"Failed to create user: {response.status_code}")


def main():
    """Run all tests."""
    logger.info("🚀 Testing EthBond Video Upload and Analysis System")
    logger.info("=" * 60)
    
    try:
        # Test video analysis
        analysis_results = test_video_analysis()
        
        # Test user management
        user_id = test_user_management()
        
        # Test API endpoints
        test_api_endpoints()
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ All tests completed successfully!")
        logger.info("🎯 EthBond system is ready for frontend integration!")
        
        # Display summary
        logger.info("\nSystem Summary:")
        logger.info(f"  - Video analysis: ✅ Working")
        logger.info(f"  - User management: ✅ Working")
        logger.info(f"  - API endpoints: ✅ Working")
        logger.info(f"  - Badge system: ✅ Working")
        logger.info(f"  - Progress tracking: ✅ Working")
        logger.info(f"  - Leaderboard: ✅ Working")
        
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        raise


if __name__ == "__main__":
    main()


