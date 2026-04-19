#!/usr/bin/env python3
"""
Pose detection and clean visualization pipeline with temporal smoothing.
"""

from collections import deque
from dataclasses import dataclass
from typing import Dict, List, Optional, Set, Tuple

import cv2
import mediapipe as mp
import numpy as np


@dataclass
class PoseFrameResult:
    landmarks: Optional[np.ndarray]  # shape (33, 3), normalized
    visibility: Optional[np.ndarray]  # shape (33,)
    confidence: float


class PoseDetectionPipeline:
    def __init__(
        self,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
        visibility_threshold: float = 0.5,
        smoothing_window: int = 5,
    ):
        self.visibility_threshold = visibility_threshold
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )
        self.connections = set(self.mp_pose.POSE_CONNECTIONS)
        self.history: deque[np.ndarray] = deque(maxlen=max(1, smoothing_window))
        self.visibility_history: deque[np.ndarray] = deque(maxlen=max(1, smoothing_window))

    def detect(self, frame_bgr: np.ndarray) -> PoseFrameResult:
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb)

        if not results.pose_landmarks:
            return PoseFrameResult(None, None, 0.0)

        landmarks = []
        visibility = []
        for lm in results.pose_landmarks.landmark:
            # Keep normalized coordinate space and clamp to valid range.
            x = float(np.clip(lm.x, 0.0, 1.0))
            y = float(np.clip(lm.y, 0.0, 1.0))
            z = float(lm.z)
            landmarks.append([x, y, z])
            visibility.append(float(np.clip(lm.visibility, 0.0, 1.0)))

        lmk_arr = np.asarray(landmarks, dtype=np.float32)
        vis_arr = np.asarray(visibility, dtype=np.float32)

        self.history.append(lmk_arr)
        self.visibility_history.append(vis_arr)

        smooth_landmarks = np.mean(np.stack(list(self.history), axis=0), axis=0)
        smooth_visibility = np.mean(np.stack(list(self.visibility_history), axis=0), axis=0)
        confidence = float(np.mean(smooth_visibility))

        return PoseFrameResult(
            landmarks=smooth_landmarks,
            visibility=smooth_visibility,
            confidence=confidence,
        )

    def draw_pose(
        self,
        frame_bgr: np.ndarray,
        result: PoseFrameResult,
        highlight_joints: Optional[Set[int]] = None,
    ) -> np.ndarray:
        if result.landmarks is None or result.visibility is None:
            return frame_bgr

        h, w = frame_bgr.shape[:2]
        output = frame_bgr.copy()
        highlight_joints = highlight_joints or set()

        # Draw only valid MediaPipe skeleton connections.
        for start_idx, end_idx in self.connections:
            if (
                result.visibility[start_idx] < self.visibility_threshold
                or result.visibility[end_idx] < self.visibility_threshold
            ):
                continue
            x1 = int(result.landmarks[start_idx, 0] * w)
            y1 = int(result.landmarks[start_idx, 1] * h)
            x2 = int(result.landmarks[end_idx, 0] * w)
            y2 = int(result.landmarks[end_idx, 1] * h)
            cv2.line(output, (x1, y1), (x2, y2), (80, 200, 120), 2)

        # Draw joints: red for highlighted (incorrect), green for normal.
        for idx in range(result.landmarks.shape[0]):
            if result.visibility[idx] < self.visibility_threshold:
                continue
            x = int(result.landmarks[idx, 0] * w)
            y = int(result.landmarks[idx, 1] * h)
            color = (0, 0, 255) if idx in highlight_joints else (0, 220, 0)
            cv2.circle(output, (x, y), 4, color, -1)

        return output
