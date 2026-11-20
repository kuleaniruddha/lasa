import time
from typing import Dict, Any

class InteractionLog:
    """Model representing a recorded drug check interaction."""
    def __init__(self, drug_name: str, matched_drug: str, similarity_score: float, risk_level: str, user_id: str = "anonymous"):
        self.drug_name = drug_name
        self.matched_drug = matched_drug
        self.similarity_score = similarity_score
        self.risk_level = risk_level
        self.user_id = user_id
        self.timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "drug_name": self.drug_name,
            "matched_drug": self.matched_drug,
            "similarity_score": self.similarity_score,
            "risk_level": self.risk_level,
            "user_id": self.user_id,
            "timestamp": self.timestamp
        }
