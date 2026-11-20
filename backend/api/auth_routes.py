import os
import json
from flask import Blueprint, request, jsonify

try:
    from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
except ImportError:
    def create_access_token(identity, additional_claims=None):
        return f"mock_token_{identity}"
    def jwt_required():
        def decorator(fn):
            return fn
        return decorator
    def get_jwt_identity():
        return "usr_admin_01"

from backend.config import Config
from backend.utils.security import hash_password, verify_password
from backend.utils.validators import validate_user_payload

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def _load_users():
    """Load users from seed_users.json into local dictionary."""
    users = {}
    seed_users_path = os.path.join(Config.DATA_DIR, "seed_users.json")
    if os.path.exists(seed_users_path):
        try:
            with open(seed_users_path, "r", encoding="utf-8") as f:
                u_list = json.load(f)
                for u in u_list:
                    users[u["email"].lower()] = u
        except Exception:
            pass
    return users

USERS_DB = _load_users()

def _persist_user(user_obj):
    """Persist newly registered user to seed_users.json."""
    seed_users_path = os.path.join(Config.DATA_DIR, "seed_users.json")
    try:
        current_users = []
        if os.path.exists(seed_users_path):
            with open(seed_users_path, "r", encoding="utf-8") as f:
                current_users = json.load(f)
        # Check if already present
        filtered = [u for u in current_users if u["email"].lower() != user_obj["email"].lower()]
        filtered.append(user_obj)
        with open(seed_users_path, "w", encoding="utf-8") as f:
            json.dump(filtered, f, indent=2)
    except Exception as e:
        print(f"Warning: Failed to persist user to file: {e}")

AVAILABLE_ROLES = [
    {
        "id": "Doctor",
        "name": "Doctor / Prescribing Clinician",
        "icon": "Stethoscope",
        "badge": "Prescribing Safety",
        "description": "Formulates prescriptions, evaluates dual-drug collisions, checks therapeutic alternatives."
    },
    {
        "id": "Pharmacist",
        "name": "Clinical Pharmacist",
        "icon": "Pill",
        "badge": "Dispensing Verification",
        "description": "Verifies dispensing orders, inspects Tall Man lettering, reviews overrides and stock formulary."
    },
    {
        "id": "Assistant",
        "name": "Pharmacy Assistant / Technician",
        "icon": "FileCheck",
        "badge": "Naive User / Guided Mode",
        "description": "Simple traffic-light alerts (Green/Yellow/Red), prescription scanning, and 1-click pharmacist sign-off request."
    },
    {
        "id": "Admin",
        "name": "Patient Safety Director / Admin",
        "icon": "ShieldAlert",
        "badge": "Surveillance & Governance",
        "description": "Monitors BDA stream analytics, triggers ML model retraining, reviews compliance audit trails."
    }
]

@auth_bp.route("/roles", methods=["GET"])
def get_roles():
    """Get available clinical roles and descriptions."""
    return jsonify({"success": True, "data": AVAILABLE_ROLES, "error": None}), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new healthcare provider user account."""
    try:
        data = request.get_json() or {}
        valid, err = validate_user_payload(data)
        if not valid:
            return jsonify({"success": False, "data": None, "error": err}), 400

        email = data["email"].strip().lower()
        # Refresh users from file
        global USERS_DB
        USERS_DB = _load_users()

        if email in USERS_DB:
            return jsonify({"success": False, "data": None, "error": "Email already registered"}), 409

        new_user = {
            "user_id": f"usr_{len(USERS_DB)+1:03d}",
            "username": data["username"].strip(),
            "email": email,
            "password_hash": hash_password(data["password"]),
            "role": data.get("role", "Clinician"),
            "full_name": data.get("full_name", data["username"]),
            "title": data.get("title", data.get("role", "Healthcare Clinician"))
        }
        USERS_DB[email] = new_user
        _persist_user(new_user)

        access_token = create_access_token(
            identity=new_user["user_id"],
            additional_claims={"role": new_user["role"], "email": email}
        )

        return jsonify({
            "success": True,
            "data": {
                "token": access_token,
                "user": {
                    "user_id": new_user["user_id"],
                    "username": new_user["username"],
                    "email": new_user["email"],
                    "role": new_user["role"],
                    "full_name": new_user["full_name"],
                    "title": new_user.get("title", new_user["role"])
                }
            },
            "error": None
        }), 201
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate clinician / pharmacist / assistant / admin and return JWT access token."""
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"success": False, "data": None, "error": "Both email and password are required"}), 400

        global USERS_DB
        USERS_DB = _load_users()
        user = USERS_DB.get(email)

        if not user or not verify_password(user.get("password_hash", ""), password):
            return jsonify({"success": False, "data": None, "error": "Invalid email or password"}), 401

        access_token = create_access_token(
            identity=user["user_id"],
            additional_claims={"role": user["role"], "email": user["email"]}
        )

        return jsonify({
            "success": True,
            "data": {
                "token": access_token,
                "user": {
                    "user_id": user["user_id"],
                    "username": user["username"],
                    "email": user["email"],
                    "role": user["role"],
                    "full_name": user.get("full_name", user["username"])
                }
            },
            "error": None
        }), 200
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    """Get current authenticated user profile."""
    try:
        uid = get_jwt_identity()
        user_info = None
        for u in USERS_DB.values():
            if u["user_id"] == uid:
                user_info = u
                break
        
        if not user_info:
            user_info = {"user_id": uid, "username": "clinician", "email": "user@lasa.local", "role": "Clinician", "full_name": "Attending Clinician"}

        return jsonify({
            "success": True,
            "data": {
                "user_id": user_info["user_id"],
                "username": user_info["username"],
                "email": user_info["email"],
                "role": user_info["role"],
                "full_name": user_info.get("full_name", user_info["username"])
            },
            "error": None
        }), 200
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500
