import time
from typing import Dict, Any

class RiskOverride:
    """Model for recording clinician risk overrides for high-risk LASA alerts."""
    def __init__(self, drug1: str, drug2: str, reason: str, clinician_name: str, clinician_license: str, user_id: str):
        self.drug1 = drug1
        self.drug2 = drug2
        self.reason = reason
        self.clinician_name = clinician_name
        self.clinician_license = clinician_license
        self.user_id = user_id
        self.timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "drug1": self.drug1,
            "drug2": self.drug2,
            "reason": self.reason,
            "clinician_name": self.clinician_name,
            "clinician_license": self.clinician_license,
            "user_id": self.user_id,
            "timestamp": self.timestamp
        }
