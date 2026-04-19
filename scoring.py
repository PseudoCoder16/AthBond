#!/usr/bin/env python3
"""
Rule-based scoring and injury risk for biomechanics output.
"""

from typing import Dict, List, Tuple


def _range_score(value: float, low: float, high: float, tolerance: float = 30.0) -> float:
    """
    Score a metric based on distance to ideal range.
    """
    if low <= value <= high:
        return 100.0
    if value < low:
        distance = low - value
    else:
        distance = value - high
    return max(0.0, 100.0 - (distance / tolerance) * 100.0)


class PoseScoringEngine:
    def __init__(self):
        # Tunable ideal biomechanical ranges.
        self.ideal_ranges = {
            "knee": (80.0, 100.0),
            "elbow": (70.0, 120.0),
            "shoulder": (70.0, 130.0),
            "hip": (150.0, 180.0),
        }
        self.weights = {
            "knee": 0.30,
            "elbow": 0.20,
            "posture": 0.25,
            "balance": 0.25,
        }

    def _pair_average(self, angles: Dict[str, float], left: str, right: str) -> float:
        vals: List[float] = []
        if left in angles:
            vals.append(angles[left])
        if right in angles:
            vals.append(angles[right])
        return sum(vals) / len(vals) if vals else 0.0

    def evaluate(
        self,
        angles: Dict[str, float],
        posture_score: float,
        balance_score: float,
        asymmetry: float,
    ) -> Dict:
        issues: List[str] = []
        suggestions: List[str] = []

        knee_angle = self._pair_average(angles, "left_knee", "right_knee")
        elbow_angle = self._pair_average(angles, "left_elbow", "right_elbow")
        shoulder_angle = self._pair_average(angles, "left_shoulder", "right_shoulder")
        hip_angle = self._pair_average(angles, "left_hip", "right_hip")

        knee_score = _range_score(knee_angle, *self.ideal_ranges["knee"]) if knee_angle else 0.0
        elbow_score = _range_score(elbow_angle, *self.ideal_ranges["elbow"]) if elbow_angle else 0.0
        _ = _range_score(shoulder_angle, *self.ideal_ranges["shoulder"]) if shoulder_angle else 0.0
        _ = _range_score(hip_angle, *self.ideal_ranges["hip"]) if hip_angle else 0.0

        form_quality = (
            knee_score * self.weights["knee"]
            + elbow_score * self.weights["elbow"]
            + posture_score * self.weights["posture"]
            + balance_score * self.weights["balance"]
        )

        # Performance includes form, control and symmetry effect.
        performance = form_quality * 0.75 + (100.0 - min(100.0, asymmetry * 3.0)) * 0.25

        # Injury risk rules.
        injury_risk = "Low"
        risk_explanations: List[str] = []

        if knee_angle and knee_angle < 60.0:
            injury_risk = "High"
            risk_explanations.append("Knee angle is below 60°, indicating high joint stress.")
            issues.append("Knee flexion is too deep under load")
            suggestions.append("Reduce knee stress and improve controlled knee tracking")

        back_angle = angles.get("back_angle", 180.0)
        posture_deviation = abs(back_angle - 180.0)
        if posture_deviation > 25.0:
            if injury_risk != "High":
                injury_risk = "Medium"
            risk_explanations.append("Back angle indicates posture instability.")
            issues.append("Posture is unstable through torso")
            suggestions.append("Maintain neutral spine and core engagement")

        if asymmetry > 15.0:
            if injury_risk == "Low":
                injury_risk = "Medium"
            risk_explanations.append("Significant movement asymmetry detected.")
            issues.append("Left-right movement asymmetry")
            suggestions.append("Include unilateral drills to reduce asymmetry")

        if knee_score < 70.0 and "Knee angle slightly off" not in issues:
            issues.append("Knee angle slightly off")
            suggestions.append("Improve knee bend consistency")
        if balance_score < 70.0 and "Balance unstable" not in issues:
            issues.append("Balance unstable")
            suggestions.append("Stabilize stance and weight transfer")

        if not risk_explanations:
            risk_explanations.append("No major biomechanical risk rules triggered.")
        if not suggestions:
            suggestions.append("Maintain current movement quality and consistency")

        return {
            "form_quality": round(float(form_quality), 2),
            "performance": round(float(performance), 2),
            "injury_risk": injury_risk,
            "issues": issues,
            "suggestions": suggestions,
            "risk_explanation": " ".join(risk_explanations),
            "angles": {
                "knee": round(knee_angle, 2) if knee_angle else 0.0,
                "elbow": round(elbow_angle, 2) if elbow_angle else 0.0,
                "shoulder": round(shoulder_angle, 2) if shoulder_angle else 0.0,
                "hip": round(hip_angle, 2) if hip_angle else 0.0,
                "back": round(back_angle, 2),
            },
            "component_scores": {
                "knee_score": round(knee_score, 2),
                "elbow_score": round(elbow_score, 2),
                "posture_score": round(float(posture_score), 2),
                "balance_score": round(float(balance_score), 2),
            },
        }
