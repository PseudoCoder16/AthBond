#!/usr/bin/env python3
"""
Biomechanics analysis utilities for pose-driven sports evaluation.
"""

from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np
import mediapipe as mp


def calculate_angle(point_a: np.ndarray, point_b: np.ndarray, point_c: np.ndarray) -> float:
    """
    Calculate angle ABC in degrees using vector math.
    """
    ba = point_a - point_b
    bc = point_c - point_b

    ba_norm = np.linalg.norm(ba)
    bc_norm = np.linalg.norm(bc)
    if ba_norm < 1e-6 or bc_norm < 1e-6:
        return 0.0

    cosine = float(np.dot(ba, bc) / (ba_norm * bc_norm))
    cosine = float(np.clip(cosine, -1.0, 1.0))
    return float(np.degrees(np.arccos(cosine)))


@dataclass
class BiomechanicsResult:
    angles: Dict[str, float]
    posture_score: float
    balance_score: float
    asymmetry: float
    issues: List[str]


class BiomechanicsAnalyzer:
    def __init__(self, visibility_threshold: float = 0.5):
        self.visibility_threshold = visibility_threshold
        self.pose_lm = mp.solutions.pose.PoseLandmark

    def _is_visible(self, vis: np.ndarray, idx: int) -> bool:
        return idx < len(vis) and vis[idx] >= self.visibility_threshold

    def _point(self, landmarks: np.ndarray, idx: int) -> np.ndarray:
        return landmarks[idx][:2]

    def analyze(self, landmarks: np.ndarray, visibility: np.ndarray) -> BiomechanicsResult:
        angles: Dict[str, float] = {}
        issues: List[str] = []

        # Landmark indices
        ls = self.pose_lm.LEFT_SHOULDER.value
        rs = self.pose_lm.RIGHT_SHOULDER.value
        le = self.pose_lm.LEFT_ELBOW.value
        re = self.pose_lm.RIGHT_ELBOW.value
        lw = self.pose_lm.LEFT_WRIST.value
        rw = self.pose_lm.RIGHT_WRIST.value
        lh = self.pose_lm.LEFT_HIP.value
        rh = self.pose_lm.RIGHT_HIP.value
        lk = self.pose_lm.LEFT_KNEE.value
        rk = self.pose_lm.RIGHT_KNEE.value
        la = self.pose_lm.LEFT_ANKLE.value
        ra = self.pose_lm.RIGHT_ANKLE.value

        # Joint angles
        if self._is_visible(visibility, lh) and self._is_visible(visibility, lk) and self._is_visible(visibility, la):
            angles["left_knee"] = calculate_angle(self._point(landmarks, lh), self._point(landmarks, lk), self._point(landmarks, la))
        if self._is_visible(visibility, rh) and self._is_visible(visibility, rk) and self._is_visible(visibility, ra):
            angles["right_knee"] = calculate_angle(self._point(landmarks, rh), self._point(landmarks, rk), self._point(landmarks, ra))

        if self._is_visible(visibility, ls) and self._is_visible(visibility, le) and self._is_visible(visibility, lw):
            angles["left_elbow"] = calculate_angle(self._point(landmarks, ls), self._point(landmarks, le), self._point(landmarks, lw))
        if self._is_visible(visibility, rs) and self._is_visible(visibility, re) and self._is_visible(visibility, rw):
            angles["right_elbow"] = calculate_angle(self._point(landmarks, rs), self._point(landmarks, re), self._point(landmarks, rw))

        if self._is_visible(visibility, le) and self._is_visible(visibility, ls) and self._is_visible(visibility, lh):
            angles["left_shoulder"] = calculate_angle(self._point(landmarks, le), self._point(landmarks, ls), self._point(landmarks, lh))
        if self._is_visible(visibility, re) and self._is_visible(visibility, rs) and self._is_visible(visibility, rh):
            angles["right_shoulder"] = calculate_angle(self._point(landmarks, re), self._point(landmarks, rs), self._point(landmarks, rh))

        if self._is_visible(visibility, ls) and self._is_visible(visibility, lh) and self._is_visible(visibility, lk):
            angles["left_hip"] = calculate_angle(self._point(landmarks, ls), self._point(landmarks, lh), self._point(landmarks, lk))
        if self._is_visible(visibility, rs) and self._is_visible(visibility, rh) and self._is_visible(visibility, rk):
            angles["right_hip"] = calculate_angle(self._point(landmarks, rs), self._point(landmarks, rh), self._point(landmarks, rk))

        # Back / posture angle against vertical axis.
        posture_score = 50.0
        if self._is_visible(visibility, ls) and self._is_visible(visibility, rs) and self._is_visible(visibility, lh) and self._is_visible(visibility, rh):
            shoulder_center = (self._point(landmarks, ls) + self._point(landmarks, rs)) / 2.0
            hip_center = (self._point(landmarks, lh) + self._point(landmarks, rh)) / 2.0
            torso = shoulder_center - hip_center
            vertical = np.array([0.0, -1.0], dtype=np.float32)
            back_angle = calculate_angle(hip_center + vertical, hip_center, shoulder_center)
            angles["back_angle"] = back_angle

            posture_deviation = abs(back_angle - 180.0)
            posture_score = max(0.0, 100.0 - posture_deviation * 2.0)
            if posture_deviation > 20:
                issues.append("Back posture deviates from neutral alignment")

        # Symmetry / balance proxy.
        asymmetry = 0.0
        if "left_knee" in angles and "right_knee" in angles:
            asymmetry = abs(angles["left_knee"] - angles["right_knee"])
        if "left_elbow" in angles and "right_elbow" in angles:
            asymmetry = max(asymmetry, abs(angles["left_elbow"] - angles["right_elbow"]))

        balance_score = max(0.0, 100.0 - asymmetry * 2.0)
        if asymmetry > 15:
            issues.append("Left/right asymmetry detected")

        return BiomechanicsResult(
            angles=angles,
            posture_score=posture_score,
            balance_score=balance_score,
            asymmetry=asymmetry,
            issues=issues,
        )
