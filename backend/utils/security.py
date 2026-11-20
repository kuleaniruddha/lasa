from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password: str) -> str:
    """Hash a plaintext password using werkzeug's secure hashing."""
    return generate_password_hash(password)

def verify_password(password_hash: str, password: str) -> bool:
    """Verify a plaintext password against a stored password hash."""
    if not password_hash or not password:
        return False
    return check_password_hash(password_hash, password)
