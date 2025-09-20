#!/usr/bin/env python3
"""
Video Analysis System for EthBond
=================================

This module handles video upload, processing, and analysis for the EthBond application.
It processes uploaded videos to extract pose data, calculate scores, and count reps.

Author: EthBond Team
Date: 2025
"""

import cv2
import numpy as np
import logging
import os
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import uuid

from mediapipe_utils import PoseDetector, KeypointExtractor
from tensorflow_model import ModelScorer
from opencv_utils import FrameProcessor

logger = logging.getLogger(__name__)


class VideoAnalyzer:
    """
    Video analysis system for processing uploaded training videos.
    """
    
    def __init__(self, upload_dir: str = "uploads", results_dir: str = "results"):
        """
        Initialize video analyzer.
        
        Args:
            upload_dir: Directory for uploaded videos
            results_dir: Directory for analysis results
        """
        self.upload_dir = Path(upload_dir)
        self.results_dir = Path(results_dir)
        
        # Create directories
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.results_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.pose_detector = PoseDetector()
        self.keypoint_extractor = KeypointExtractor()
        self.model_scorer = ModelScorer()
        self.frame_processor = FrameProcessor()
        
        logger.info("Video analyzer initialized")
    
    def analyze_video(self, video_path: str, user_id: str = None) -> Dict:
        """
        Analyze uploaded video and extract performance metrics.
        
        Args:
            video_path: Path to uploaded video file
            user_id: User identifier
            
        Returns:
            Dict: Analysis results including scores, reps, and metrics
        """
        try:
            logger.info(f"Starting video analysis: {video_path}")
            
            # Generate unique analysis ID
            analysis_id = str(uuid.uuid4())
            user_id = user_id or "anonymous"
            
            # Initialize video capture
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise ValueError(f"Could not open video: {video_path}")
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 0
            
            logger.info(f"Video properties: {frame_count} frames, {fps:.2f} FPS, {duration:.2f}s")
            
            # Analysis variables
            frame_results = []
            total_reps = 0
            scores = []
            angles = []
            rep_states = []
            
            frame_idx = 0
            processed_frames = 0
            
            # Process video frame by frame
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_idx += 1
                
                # Skip frames for performance (process every 3rd frame)
                if frame_idx % 3 != 0:
                    continue
                
                processed_frames += 1
                
                # Process frame
                processed_frame = self.frame_processor.preprocess_frame(frame)
                
                # Detect pose
                pose_results = self.pose_detector.detect_pose(processed_frame)
                
                if pose_results.pose_landmarks:
                    # Extract keypoints
                    keypoints = self.keypoint_extractor.extract_keypoints(pose_results)
                    
                    # Score pose and get rep data
                    result = self.model_scorer.score_pose(None, keypoints)
                    
                    # Store results
                    frame_data = {
                        'frame_idx': frame_idx,
                        'timestamp': frame_idx / fps if fps > 0 else 0,
                        'score': result['score'],
                        'angle': result['angle'],
                        'rep_count': result['rep_count'],
                        'rep_state': result['rep_state'],
                        'left_angle': result['left_angle'],
                        'right_angle': result['right_angle']
                    }
                    
                    frame_results.append(frame_data)
                    scores.append(result['score'])
                    angles.append(result['angle'])
                    rep_states.append(result['rep_state'])
                    
                    # Update total reps
                    total_reps = max(total_reps, result['rep_count'])
                
                # Progress logging
                if processed_frames % 30 == 0:  # Every 30 processed frames
                    progress = (frame_idx / frame_count) * 100
                    logger.info(f"Processing progress: {progress:.1f}%")
            
            cap.release()
            
            # Calculate analysis metrics
            analysis_results = self._calculate_metrics(
                frame_results, scores, angles, total_reps, duration, fps
            )
            
            # Add metadata
            analysis_results.update({
                'analysis_id': analysis_id,
                'user_id': user_id,
                'video_path': video_path,
                'video_name': Path(video_path).name,
                'timestamp': datetime.now().isoformat(),
                'total_frames': frame_count,
                'processed_frames': processed_frames,
                'duration': duration,
                'fps': fps
            })
            
            # Save results
            self._save_analysis_results(analysis_results)
            
            logger.info(f"Video analysis completed: {analysis_id}")
            return analysis_results
            
        except Exception as e:
            logger.error(f"Video analysis failed: {str(e)}")
            raise
    
    def _calculate_metrics(self, frame_results: List[Dict], scores: List[float], 
                          angles: List[float], total_reps: int, 
                          duration: float, fps: float) -> Dict:
        """Calculate performance metrics from frame results."""
        
        if not scores:
            return {
                'total_reps': 0,
                'average_score': 0,
                'max_score': 0,
                'min_score': 0,
                'average_angle': 0,
                'performance_level': 'No Data',
                'badges': [],
                'improvement': 0,
                'consistency': 0,
                'form_quality': 0
            }
        
        # Basic metrics
        avg_score = np.mean(scores)
        max_score = np.max(scores)
        min_score = np.min(scores)
        avg_angle = np.mean(angles)
        
        # Performance level
        if avg_score >= 80:
            performance_level = "Excellent"
        elif avg_score >= 60:
            performance_level = "Good"
        elif avg_score >= 40:
            performance_level = "Moderate"
        else:
            performance_level = "Needs Improvement"
        
        # Calculate consistency (lower standard deviation = more consistent)
        score_std = np.std(scores)
        consistency = max(0, 100 - (score_std * 2))  # Convert to 0-100 scale
        
        # Calculate form quality (based on angle consistency and score)
        angle_std = np.std(angles)
        form_quality = max(0, 100 - (angle_std / 10))  # Convert to 0-100 scale
        
        # Calculate improvement (placeholder - would need historical data)
        improvement = 0  # This would be calculated based on previous sessions
        
        # Assign badges
        badges = self._assign_badges(avg_score, total_reps, consistency, form_quality)
        
        return {
            'total_reps': total_reps,
            'average_score': round(avg_score, 2),
            'max_score': round(max_score, 2),
            'min_score': round(min_score, 2),
            'average_angle': round(avg_angle, 2),
            'performance_level': performance_level,
            'badges': badges,
            'improvement': improvement,
            'consistency': round(consistency, 2),
            'form_quality': round(form_quality, 2),
            'score_std': round(score_std, 2),
            'angle_std': round(angle_std, 2),
            'reps_per_minute': round((total_reps / duration) * 60, 2) if duration > 0 else 0
        }
    
    def _assign_badges(self, avg_score: float, total_reps: int, 
                      consistency: float, form_quality: float) -> List[Dict]:
        """Assign badges based on performance metrics."""
        
        badges = []
        
        # Consistency Star - Based on consistency score
        if consistency >= 80:
            badges.append({
                'name': 'Consistency Star',
                'icon': '⭐',
                'description': 'Maintained consistent form throughout the session',
                'earned': True,
                'level': 'gold' if consistency >= 90 else 'silver'
            })
        else:
            badges.append({
                'name': 'Consistency Star',
                'icon': '⭐',
                'description': 'Maintain consistent form to earn this badge',
                'earned': False,
                'level': 'locked'
            })
        
        # Fast Learner - Based on improvement over time
        if avg_score >= 70:
            badges.append({
                'name': 'Fast Learner',
                'icon': '🚀',
                'description': 'Achieved high performance scores',
                'earned': True,
                'level': 'gold' if avg_score >= 85 else 'silver'
            })
        else:
            badges.append({
                'name': 'Fast Learner',
                'icon': '🚀',
                'description': 'Improve your scores to earn this badge',
                'earned': False,
                'level': 'locked'
            })
        
        # Perfect Form - Based on form quality
        if form_quality >= 75:
            badges.append({
                'name': 'Perfect Form',
                'icon': '🏅',
                'description': 'Demonstrated excellent form and technique',
                'earned': True,
                'level': 'gold' if form_quality >= 90 else 'silver'
            })
        else:
            badges.append({
                'name': 'Perfect Form',
                'icon': '🏅',
                'description': 'Focus on form to earn this badge',
                'earned': False,
                'level': 'locked'
            })
        
        # Strength Master - Based on total reps
        if total_reps >= 10:
            badges.append({
                'name': 'Strength Master',
                'icon': '💪',
                'description': f'Completed {total_reps} reps with good form',
                'earned': True,
                'level': 'gold' if total_reps >= 20 else 'silver'
            })
        else:
            badges.append({
                'name': 'Strength Master',
                'icon': '💪',
                'description': 'Complete more reps to earn this badge',
                'earned': False,
                'level': 'locked'
            })
        
        return badges
    
    def _save_analysis_results(self, results: Dict):
        """Save analysis results to file."""
        try:
            analysis_id = results['analysis_id']
            filename = self.results_dir / f"{analysis_id}.json"
            
            with open(filename, 'w') as f:
                json.dump(results, f, indent=2)
            
            logger.info(f"Analysis results saved: {filename}")
            
        except Exception as e:
            logger.error(f"Failed to save analysis results: {str(e)}")
    
    def get_analysis_results(self, analysis_id: str) -> Optional[Dict]:
        """Retrieve analysis results by ID."""
        try:
            filename = self.results_dir / f"{analysis_id}.json"
            if filename.exists():
                with open(filename, 'r') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Failed to load analysis results: {str(e)}")
            return None
    
    def list_user_analyses(self, user_id: str) -> List[Dict]:
        """List all analyses for a specific user."""
        try:
            analyses = []
            for filename in self.results_dir.glob("*.json"):
                with open(filename, 'r') as f:
                    data = json.load(f)
                    if data.get('user_id') == user_id:
                        # Return summary data only
                        summary = {
                            'analysis_id': data['analysis_id'],
                            'video_name': data['video_name'],
                            'timestamp': data['timestamp'],
                            'total_reps': data['total_reps'],
                            'average_score': data['average_score'],
                            'performance_level': data['performance_level'],
                            'badges': data['badges']
                        }
                        analyses.append(summary)
            
            # Sort by timestamp (newest first)
            analyses.sort(key=lambda x: x['timestamp'], reverse=True)
            return analyses
            
        except Exception as e:
            logger.error(f"Failed to list user analyses: {str(e)}")
            return []


if __name__ == "__main__":
    # Test the video analyzer
    analyzer = VideoAnalyzer()
    
    # Example usage
    print("Video Analyzer initialized successfully!")
    print("Ready to process uploaded videos.")


