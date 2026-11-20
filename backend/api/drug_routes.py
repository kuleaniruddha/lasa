from flask import Blueprint, request, jsonify
from backend.services.drug_service import drug_service
from backend.utils.decorators import admin_required
from backend.utils.validators import validate_drug_name

drug_bp = Blueprint("drugs", __name__, url_prefix="/api/drugs")

@drug_bp.route("", methods=["GET"])
def get_all_drugs():
    """Get all drug names or query autocomplete suggestions."""
    try:
        q = request.args.get("q", "").strip().lower()
        all_names = drug_service.find_all_drug_names()

        if q:
            filtered = [name for name in all_names if q in name.lower()][:15]
            return jsonify({"success": True, "data": filtered, "error": None}), 200

        return jsonify({"success": True, "data": all_names, "error": None}), 200
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500


@drug_bp.route("/<string:name>", methods=["GET"])
def get_drug_by_name(name):
    """Retrieve complete clinical details for a drug by name."""
    try:
        drug = drug_service.find_drug(name)
        if not drug:
            return jsonify({"success": False, "data": None, "error": f"Drug '{name}' not found in database."}), 404
        return jsonify({"success": True, "data": drug, "error": None}), 200
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500


@drug_bp.route("", methods=["POST"])
@admin_required()
def create_drug():
    """Create a new drug entry in database (Admin only)."""
    try:
        data = request.get_json() or {}
        bname = data.get("brand_name")
        gname = data.get("generic_name")

        if not validate_drug_name(bname) or not validate_drug_name(gname):
            return jsonify({"success": False, "data": None, "error": "Invalid brand or generic drug name"}), 400

        drug_record = {
            "brand_name": bname,
            "generic_name": gname,
            "drug_class": data.get("drug_class", "General Therapeutic"),
            "therapeutic_use": data.get("therapeutic_use", "General Use"),
            "common_indications": data.get("common_indications", ["General Indications"]),
            "dosage_forms": data.get("dosage_forms", ["Tablet", "Oral Solution"]),
            "lasa_warnings": data.get("lasa_warnings", [])
        }

        drug_service.insert_drugs([drug_record])
        return jsonify({"success": True, "data": drug_record, "error": None}), 201
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500
