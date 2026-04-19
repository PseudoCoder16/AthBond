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

from pose_detection import PoseDetectionPipeline
from analysis import BiomechanicsAnalyzer
from scoring import PoseScoringEngine

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
        self.pose_pipeline = PoseDetectionPipeline()
        self.biomechanics_analyzer = BiomechanicsAnalyzer()
        self.scoring_engine = PoseScoringEngine()
        self.rep_state = "up"
        self.rep_count = 0
        
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
            issue_counter = {}
            
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
                
                pose_result = self.pose_pipeline.detect(frame)

                if pose_result.landmarks is not None and pose_result.visibility is not None:
                    biomechanics = self.biomechanics_analyzer.analyze(
                        pose_result.landmarks, pose_result.visibility
                    )
                    score_result = self.scoring_engine.evaluate(
                        biomechanics.angles,
                        biomechanics.posture_score,
                        biomechanics.balance_score,
                        biomechanics.asymmetry,
                    )

                    rep_count, rep_state = self._update_rep_counter(score_result["angles"]["knee"])

                    frame_data = {
                        'frame_idx': frame_idx,
                        'timestamp': frame_idx / fps if fps > 0 else 0,
                        'score': score_result['performance'],
                        'form_quality': score_result['form_quality'],
                        'angle': score_result['angles']['knee'],
                        'rep_count': rep_count,
                        'rep_state': rep_state,
                        'injury_risk': score_result['injury_risk'],
                        'issues': score_result['issues'],
                        'suggestions': score_result['suggestions'],
                        'angles': score_result['angles'],
                        'component_scores': score_result['component_scores']
                    }

                    frame_results.append(frame_data)
                    scores.append(score_result['performance'])
                    angles.append(score_result['angles']['knee'])
                    rep_states.append(rep_state)

                    for issue in score_result["issues"]:
                        issue_counter[issue] = issue_counter.get(issue, 0) + 1

                    total_reps = max(total_reps, rep_count)
                
                # Progress logging
                if processed_frames % 30 == 0:  # Every 30 processed frames
                    progress = (frame_idx / frame_count) * 100
                    logger.info(f"Processing progress: {progress:.1f}%")
            
            cap.release()
            
            # Calculate analysis metrics
            analysis_results = self._calculate_metrics(
                frame_results, scores, angles, total_reps, duration, fps
            )

            common_issues = sorted(issue_counter.items(), key=lambda x: x[1], reverse=True)
            top_issues = [issue for issue, _ in common_issues[:3]]
            top_suggestions = []
            if frame_results:
                # Use the latest frame suggestions as immediate next actions.
                top_suggestions = frame_results[-1].get("suggestions", [])[:3]
            
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
            analysis_results["issues"] = top_issues
            analysis_results["suggestions"] = top_suggestions
            
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

        # Derive injury risk from frame-level rules.
        risk_rank = {"Low": 0, "Medium": 1, "High": 2}
        injury_risk = "Low"
        for frame in frame_results:
            fr = frame.get("injury_risk", "Low")
            if risk_rank.get(fr, 0) > risk_rank[injury_risk]:
                injury_risk = fr
        
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
            'performance': round(avg_score, 2),
            'injury_risk': injury_risk,
            'score_std': round(score_std, 2),
            'angle_std': round(angle_std, 2),
            'reps_per_minute': round((total_reps / duration) * 60, 2) if duration > 0 else 0
        }

    def _update_rep_counter(self, knee_angle: float) -> Tuple[int, str]:
        """
        Simple rep state machine based on knee flexion-extension cycle.
        """
        down_threshold = 100.0
        up_threshold = 150.0

        if self.rep_state == "up" and knee_angle <= down_threshold:
            self.rep_state = "down"
        elif self.rep_state == "down" and knee_angle >= up_threshold:
            self.rep_state = "up"
            self.rep_count += 1

        return self.rep_count, self.rep_state
    
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


