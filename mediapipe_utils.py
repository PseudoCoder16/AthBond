#!/usr/bin/env python3
"""
MediaPipe Utilities for EthBond
===============================

This module handles pose detection and keypoint extraction using MediaPipe.
It provides utilities for pose detection, landmark extraction, and pose analysis.

Author: EthBond Team
Date: 2025
"""

import cv2
import numpy as np
import mediapipe as mp
import logging
from typing import List, Tuple, Optional, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class PoseLandmarks:
    """
    Data class for storing pose landmarks and metadata.
    """
    landmarks: List[Tuple[float, float, float]]  # (x, y, z) coordinates
    visibility: List[float]  # Visibility scores
    world_landmarks: Optional[List[Tuple[float, float, float]]] = None
    timestamp: Optional[float] = None
    frame_id: Optional[int] = None


@dataclass
class PoseResults:
    """
    Data class for storing complete pose detection results.
    """
    pose_landmarks: Optional[PoseLandmarks] = None
    pose_world_landmarks: Optional[PoseLandmarks] = None
    segmentation_mask: Optional[np.ndarray] = None
    confidence: float = 0.0
    frame_id: Optional[int] = None


class PoseDetector:
    """
    MediaPipe pose detection wrapper with enhanced functionality.
    """
    
    def __init__(self, 
                 static_image_mode: bool = False,
                 model_complexity: int = 1,
                 smooth_landmarks: bool = True,
                 enable_segmentation: bool = False,
                 smooth_segmentation: bool = True,
                 min_detection_confidence: float = 0.5,
                 min_tracking_confidence: float = 0.5):
        """
        Initialize MediaPipe pose detection.
        
        Args:
            static_image_mode (bool): Whether to treat input as static images
            model_complexity (int): Model complexity (0, 1, or 2)
            smooth_landmarks (bool): Whether to smooth landmarks
            enable_segmentation (bool): Whether to enable segmentation
            smooth_segmentation (bool): Whether to smooth segmentation
            min_detection_confidence (float): Minimum detection confidence
            min_tracking_confidence (float): Minimum tracking confidence
        """
        self.static_image_mode = static_image_mode
        self.model_complexity = model_complexity
        self.smooth_landmarks = smooth_landmarks
        self.enable_segmentation = enable_segmentation
        self.smooth_segmentation = smooth_segmentation
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        
        # Initialize MediaPipe pose
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            smooth_landmarks=smooth_landmarks,
            enable_segmentation=enable_segmentation,
            smooth_segmentation=smooth_segmentation,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        
        logger.info("MediaPipe pose detector initialized")
    
    def detect_pose(self, image: np.ndarray, frame_id: Optional[int] = None) -> PoseResults:
        """
        Detect pose in the given image.
        
        Args:
            image (np.ndarray): Input image (RGB format)
            frame_id (Optional[int]): Frame identifier
            
        Returns:
            PoseResults: Pose detection results
        """
        try:
            # Process image with MediaPipe
            results = self.pose.process(image)
            
            # Extract pose landmarks
            pose_landmarks = None
            pose_world_landmarks = None
            segmentation_mask = None
            confidence = 0.0
            
            if results.pose_landmarks:
                # Extract 2D landmarks
                landmarks = []
                visibility = []
                
                for landmark in results.pose_landmarks.landmark:
                    landmarks.append((landmark.x, landmark.y, landmark.z))
                    visibility.append(landmark.visibility)
                
                pose_landmarks = PoseLandmarks(
                    landmarks=landmarks,
                    visibility=visibility,
                    timestamp=results.pose_landmarks.timestamp if hasattr(results.pose_landmarks, 'timestamp') else None,
                    frame_id=frame_id
                )
                
                # Extract world landmarks if available
                if results.pose_world_landmarks:
                    world_landmarks = []
                    for landmark in results.pose_world_landmarks.landmark:
                        world_landmarks.append((landmark.x, landmark.y, landmark.z))
                    
                    pose_world_landmarks = PoseLandmarks(
                        landmarks=world_landmarks,
                        visibility=visibility,
                        timestamp=results.pose_world_landmarks.timestamp if hasattr(results.pose_world_landmarks, 'timestamp') else None,
                        frame_id=frame_id
                    )
                
                # Calculate average confidence
                confidence = np.mean(visibility) if visibility else 0.0
            
            # Extract segmentation mask if available
            if self.enable_segmentation and results.segmentation_mask is not None:
                segmentation_mask = results.segmentation_mask
            
            return PoseResults(
                pose_landmarks=pose_landmarks,
                pose_world_landmarks=pose_world_landmarks,
                segmentation_mask=segmentation_mask,
                confidence=confidence,
                frame_id=frame_id
            )
            
        except Exception as e:
            logger.error(f"Pose detection failed: {str(e)}")
            return PoseResults(frame_id=frame_id)
    
    def draw_landmarks(self, image: np.ndarray, pose_results: PoseResults, 
                      draw_connections: bool = True) -> np.ndarray:
        """
        Draw pose landmarks on the image.
        
        Args:
            image (np.ndarray): Input image
            pose_results (PoseResults): Pose detection results
            draw_connections (bool): Whether to draw connections between landmarks
            
        Returns:
            np.ndarray: Image with drawn landmarks
        """
        try:
            if pose_results.pose_landmarks is None:
                return image
            
            # Simple landmark drawing without MediaPipe's complex structure
            landmarks = pose_results.pose_landmarks.landmarks
            h, w = image.shape[:2]
            
            # Draw landmarks as circles
            for i, landmark in enumerate(landmarks):
                if i < len(pose_results.pose_landmarks.visibility):
                    visibility = pose_results.pose_landmarks.visibility[i]
                    if visibility > 0.5:  # Only draw visible landmarks
                        x = int(landmark[0] * w)
                        y = int(landmark[1] * h)
                        
                        # Draw landmark as a circle
                        cv2.circle(image, (x, y), 3, (0, 255, 0), -1)
                        
                        # Draw landmark number
                        cv2.putText(image, str(i), (x+5, y-5), 
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255, 255, 255), 1)
            
            # Draw connections if requested
            if draw_connections:
                # Define key connections for pose
                connections = [
                    (11, 12), (11, 13), (12, 14), (13, 15), (14, 16),  # Arms
                    (11, 23), (12, 24), (23, 24),  # Torso
                    (23, 25), (24, 26), (25, 27), (26, 28),  # Legs
                    (0, 1), (0, 4), (1, 2), (2, 3), (4, 5), (5, 6),  # Face
                    (7, 8), (9, 10)  # Ears and mouth
                ]
                
                for start_idx, end_idx in connections:
                    if (start_idx < len(landmarks) and end_idx < len(landmarks) and
                        start_idx < len(pose_results.pose_landmarks.visibility) and
                        end_idx < len(pose_results.pose_landmarks.visibility)):
                        
                        start_vis = pose_results.pose_landmarks.visibility[start_idx]
                        end_vis = pose_results.pose_landmarks.visibility[end_idx]
                        
                        if start_vis > 0.5 and end_vis > 0.5:
                            start_point = (int(landmarks[start_idx][0] * w), 
                                         int(landmarks[start_idx][1] * h))
                            end_point = (int(landmarks[end_idx][0] * w), 
                                       int(landmarks[end_idx][1] * h))
                            
                            cv2.line(image, start_point, end_point, (0, 255, 0), 2)
            
            return image
            
        except Exception as e:
            logger.error(f"Landmark drawing failed: {str(e)}")
            return image
    
    def get_landmark_coordinates(self, pose_results: PoseResults, 
                                landmark_indices: List[int]) -> List[Tuple[float, float, float]]:
        """
        Get coordinates of specific landmarks.
        
        Args:
            pose_results (PoseResults): Pose detection results
            landmark_indices (List[int]): Indices of landmarks to extract
            
        Returns:
            List[Tuple[float, float, float]]: Coordinates of specified landmarks
        """
        if pose_results.pose_landmarks is None:
            return []
        
        coordinates = []
        for idx in landmark_indices:
            if 0 <= idx < len(pose_results.pose_landmarks.landmarks):
                coordinates.append(pose_results.pose_landmarks.landmarks[idx])
        
        return coordinates


class KeypointExtractor:
    """
    Keypoint extraction and analysis utilities.
    """
    
    def __init__(self):
        """Initialize keypoint extractor."""
        self.mp_pose = mp.solutions.pose
        self.landmark_names = self._get_landmark_names()
        logger.info("Keypoint extractor initialized")
    
    def _get_landmark_names(self) -> List[str]:
        """Get list of landmark names."""
        return [
            'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
            'right_eye_inner', 'right_eye', 'right_eye_outer',
            'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
            'left_index', 'right_index', 'left_thumb', 'right_thumb',
            'left_hip', 'right_hip', 'left_knee', 'right_knee',
            'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
            'left_foot_index', 'right_foot_index'
        ]
    
    def extract_keypoints(self, pose_results: PoseResults) -> np.ndarray:
        """
        Extract keypoints as a numpy array for machine learning.
        
        Args:
            pose_results (PoseResults): Pose detection results
            
        Returns:
            np.ndarray: Keypoints array (33, 4) - (x, y, z, visibility)
        """
        if pose_results.pose_landmarks is None:
            # Return zero array if no pose detected
            return np.zeros((33, 4), dtype=np.float32)
        
        keypoints = np.zeros((33, 4), dtype=np.float32)
        
        for i, (landmark, visibility) in enumerate(zip(
            pose_results.pose_landmarks.landmarks,
            pose_results.pose_landmarks.visibility
        )):
            keypoints[i] = [landmark[0], landmark[1], landmark[2], visibility]
        
        return keypoints
    
    def extract_normalized_keypoints(self, pose_results: PoseResults) -> np.ndarray:
        """
        Extract normalized keypoints (relative to hip center).
        
        Args:
            pose_results (PoseResults): Pose detection results
            
        Returns:
            np.ndarray: Normalized keypoints array
        """
        keypoints = self.extract_keypoints(pose_results)
        
        if np.all(keypoints == 0):
            return keypoints
        
        # Get hip center (average of left and right hip)
        left_hip = keypoints[23]  # left_hip
        right_hip = keypoints[24]  # right_hip
        hip_center = (left_hip[:3] + right_hip[:3]) / 2
        
        # Normalize all keypoints relative to hip center
        normalized_keypoints = keypoints.copy()
        for i in range(33):
            normalized_keypoints[i, :3] = keypoints[i, :3] - hip_center
        
        return normalized_keypoints
    
    def get_pose_angles(self, pose_results: PoseResults) -> Dict[str, float]:
        """
        Calculate key pose angles.
        
        Args:
            pose_results (PoseResults): Pose detection results
            
        Returns:
            Dict[str, float]: Dictionary of calculated angles
        """
        if pose_results.pose_landmarks is None:
            return {}
        
        angles = {}
        landmarks = pose_results.pose_landmarks.landmarks
        
        # Define key angle calculations
        angle_definitions = {
            'left_elbow': [11, 13, 15],  # shoulder, elbow, wrist
            'right_elbow': [12, 14, 16],
            'left_shoulder': [13, 11, 23],  # elbow, shoulder, hip
            'right_shoulder': [14, 12, 24],
            'left_hip': [11, 23, 25],  # shoulder, hip, knee
            'right_hip': [12, 24, 26],
            'left_knee': [23, 25, 27],  # hip, knee, ankle
            'right_knee': [24, 26, 28]
        }
        
        for angle_name, indices in angle_definitions.items():
            if all(0 <= idx < len(landmarks) for idx in indices):
                angle = self._calculate_angle(
                    landmarks[indices[0]], landmarks[indices[1]], landmarks[indices[2]]
                )
                angles[angle_name] = angle
        
        return angles
    
    def _calculate_angle(self, point1: Tuple[float, float, float], 
                        point2: Tuple[float, float, float], 
                        point3: Tuple[float, float, float]) -> float:
        """
        Calculate angle between three points.
        
        Args:
            point1, point2, point3: Three points forming the angle
            
        Returns:
            float: Angle in degrees
        """
        # Convert to numpy arrays
        p1 = np.array(point1[:2])  # Use only x, y coordinates
        p2 = np.array(point2[:2])
        p3 = np.array(point3[:2])
        
        # Calculate vectors
        v1 = p1 - p2
        v2 = p3 - p2
        
        # Calculate angle
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        cos_angle = np.clip(cos_angle, -1.0, 1.0)  # Avoid numerical errors
        angle = np.arccos(cos_angle)
        
        return np.degrees(angle)
    
    def get_pose_center(self, pose_results: PoseResults) -> Tuple[float, float]:
        """
        Calculate pose center (center of mass of all landmarks).
        
        Args:
            pose_results (PoseResults): Pose detection results
            
        Returns:
            Tuple[float, float]: Pose center coordinates (x, y)
        """
        if pose_results.pose_landmarks is None:
            return (0.0, 0.0)
        
        landmarks = pose_results.pose_landmarks.landmarks
        x_coords = [landmark[0] for landmark in landmarks]
        y_coords = [landmark[1] for landmark in landmarks]
        
        center_x = np.mean(x_coords)
        center_y = np.mean(y_coords)
        
        return (center_x, center_y)
    
    def get_pose_bounds(self, pose_results: PoseResults) -> Tuple[float, float, float, float]:
        """
        Get bounding box of the pose.
        
        Args:
            pose_results (PoseResults): Pose detection results
            
        Returns:
            Tuple[float, float, float, float]: (min_x, min_y, max_x, max_y)
        """
        if pose_results.pose_landmarks is None:
            return (0.0, 0.0, 0.0, 0.0)
        
        landmarks = pose_results.pose_landmarks.landmarks
        x_coords = [landmark[0] for landmark in landmarks]
        y_coords = [landmark[1] for landmark in landmarks]
        
        return (min(x_coords), min(y_coords), max(x_coords), max(y_coords))


class PoseAnalyzer:
    """
    Advanced pose analysis utilities.
    """
    
    def __init__(self):
        """Initialize pose analyzer."""
        self.keypoint_extractor = KeypointExtractor()
        logger.info("Pose analyzer initialized")
    
    def analyze_pose_stability(self, pose_results: PoseResults) -> Dict[str, float]:
        """
        Analyze pose stability metrics.
        
        Args:
            pose_results (PoseResults): Pose detection results
            
        Returns:
            Dict[str, float]: Stability metrics
        """
        if pose_results.pose_landmarks is None:
            return {}
        
        landmarks = pose_results.pose_landmarks.landmarks
        visibility = pose_results.pose_landmarks.visibility
        
        # Calculate stability metrics
        metrics = {}
        
        # Overall visibility score
        metrics['visibility_score'] = np.mean(visibility)
        
        # Key landmark visibility
        key_landmarks = [11, 12, 23, 24, 25, 26, 27, 28]  # shoulders, hips, knees, ankles
        key_visibility = [visibility[i] for i in key_landmarks if i < len(visibility)]
        metrics['key_landmark_visibility'] = np.mean(key_visibility) if key_visibility else 0.0
        
        # Pose symmetry (left vs right)
        left_landmarks = [11, 13, 15, 23, 25, 27]  # left side
        right_landmarks = [12, 14, 16, 24, 26, 28]  # right side
        
        left_coords = np.array([landmarks[i][:2] for i in left_landmarks if i < len(landmarks)])
        right_coords = np.array([landmarks[i][:2] for i in right_landmarks if i < len(landmarks)])
        
        if len(left_coords) == len(right_coords) and len(left_coords) > 0:
            # Calculate symmetry by comparing distances from center
            center_x = (np.mean(left_coords[:, 0]) + np.mean(right_coords[:, 0])) / 2
            left_distances = np.abs(left_coords[:, 0] - center_x)
            right_distances = np.abs(right_coords[:, 0] - center_x)
            symmetry_score = 1.0 - np.mean(np.abs(left_distances - right_distances))
            metrics['symmetry_score'] = max(0.0, symmetry_score)
        else:
            metrics['symmetry_score'] = 0.0
        
        return metrics
    
    def detect_pose_anomalies(self, pose_results: PoseResults) -> List[str]:
        """
        Detect potential pose anomalies.
        
        Args:
            pose_results (PoseResults): Pose detection results
            
        Returns:
            List[str]: List of detected anomalies
        """
        anomalies = []
        
        if pose_results.pose_landmarks is None:
            anomalies.append("No pose detected")
            return anomalies
        
        landmarks = pose_results.pose_landmarks.landmarks
        visibility = pose_results.pose_landmarks.visibility
        
        # Check for low visibility
        if np.mean(visibility) < 0.5:
            anomalies.append("Low overall visibility")
        
        # Check for missing key landmarks
        key_landmarks = [11, 12, 23, 24]  # shoulders and hips
        for idx in key_landmarks:
            if idx < len(visibility) and visibility[idx] < 0.3:
                anomalies.append(f"Low visibility for landmark {idx}")
        
        # Check for unrealistic joint angles
        angles = self.keypoint_extractor.get_pose_angles(pose_results)
        for angle_name, angle in angles.items():
            if angle < 0 or angle > 180:
                anomalies.append(f"Unrealistic angle for {angle_name}: {angle:.1f}°")
        
        return anomalies


def test_mediapipe_utils():
    """
    Test function for MediaPipe utilities.
    """
    logger.info("Testing MediaPipe utilities...")
    
    try:
        # Test pose detector
        pose_detector = PoseDetector()
        keypoint_extractor = KeypointExtractor()
        pose_analyzer = PoseAnalyzer()
        
        # Create a test image (you would normally load a real image)
        test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Test pose detection
        pose_results = pose_detector.detect_pose(test_image)
        logger.info(f"Pose detection test completed. Confidence: {pose_results.confidence}")
        
        # Test keypoint extraction
        keypoints = keypoint_extractor.extract_keypoints(pose_results)
        logger.info(f"Keypoint extraction test completed. Shape: {keypoints.shape}")
        
        # Test pose analysis
        stability_metrics = pose_analyzer.analyze_pose_stability(pose_results)
        logger.info(f"Pose analysis test completed. Metrics: {len(stability_metrics)}")
        
        logger.info("MediaPipe utilities test completed successfully")
        
    except Exception as e:
        logger.error(f"MediaPipe utilities test failed: {str(e)}")


if __name__ == "__main__":
    # Configure logging for testing
    logging.basicConfig(level=logging.INFO)
    test_mediapipe_utils()
