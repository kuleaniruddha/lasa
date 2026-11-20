import re

def validate_drug_name(name: str) -> bool:
    """
    Validate that a drug name string is non-empty, contains alphanumeric characters,
    hyphens, or slashes, and is under 100 characters.
    """
    if not name or not isinstance(name, str):
        return False
    name = name.strip()
    if len(name) < 2 or len(name) > 100:
        return False
    return bool(re.match(r'^[a-zA-Z0-9\s\-\/\.]+$', name))

def validate_user_payload(data: dict) -> tuple[bool, str | None]:
    """
    Validate user registration request payload.
    """
    if not data or not isinstance(data, dict):
        return False, "Invalid payload format"
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or len(username) < 3:
        return False, "Username must be at least 3 characters long"
    if not email or "@" not in email:
        return False, "Valid email address is required"
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters long"
    
    return True, None
