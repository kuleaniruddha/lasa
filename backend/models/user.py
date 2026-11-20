from typing import Dict, Any

class User:
    """User representation model for clinicians and administrators."""
    def __init__(self, user_id: str, username: str, email: str, password_hash: str, role: str = "Clinician", full_name: str = ""):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.full_name = full_name

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "full_name": self.full_name
        }
