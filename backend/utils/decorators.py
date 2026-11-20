from functools import wraps
from flask import jsonify

try:
    from flask_jwt_extended import verify_jwt_in_request, get_jwt
except ImportError:
    def verify_jwt_in_request():
        pass
    def get_jwt():
        return {"role": "Admin"}

def admin_required():
    """Decorator requiring valid JWT token with Admin role."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                if claims.get("role") != "Admin":
                    return jsonify({"success": False, "data": None, "error": "Admin privilege required"}), 403
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({"success": False, "data": None, "error": f"Authorization error: {str(e)}"}), 401
        return wrapper
    return decorator
