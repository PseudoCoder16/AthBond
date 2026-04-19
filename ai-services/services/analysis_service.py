import random
from typing import Dict


class AnalysisService:
    def analyze_video(self, metadata: Dict) -> Dict:
        # This keeps compatibility with current pose pipeline while exposing AI endpoint contract.
        return {
            "pose_score": round(random.uniform(60, 95), 2),
            "metrics": {
                "kneeAngle": round(random.uniform(120, 170), 2),
                "speed": round(random.uniform(3.2, 7.5), 2),
                "balance": round(random.uniform(50, 92), 2),
                "posture": round(random.uniform(55, 95), 2)
            },
            "metadata": metadata or {}
        }
