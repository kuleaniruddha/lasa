import os
import json
from flask import Blueprint, jsonify, request
from backend.config import Config
from backend.services.bda_service import bda_service
from backend.services.drug_service import drug_service
from backend.services.audit_service import audit_service
from backend.scripts.train_all_models import train_all

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/stats", methods=["GET"])
@admin_bp.route("/bda-metrics", methods=["GET"])
def get_admin_stats():
    """Retrieve real-time Big Data Analytics metrics, stream counts, and system metrics."""
    try:
        bda_metrics = bda_service.get_dashboard_metrics()
        recent_interactions = drug_service.get_recent_interactions(limit=20)
        overrides = audit_service.get_logs(limit=20)

        # Count total checks and high risk alerts from recent interactions
        high_risk_count = sum(1 for item in recent_interactions if item.get("risk_level") in ["High", "HIGH"])
        total_checks = len(recent_interactions)

        # Load metrics.json if exists
        metrics_file = os.path.join(Config.MODEL_DIR, "metrics.json")
        model_metrics = {}
        if os.path.exists(metrics_file):
            with open(metrics_file, "r") as f:
                model_metrics = json.load(f)

        return jsonify({
            "success": True,
            "data": {
                "bda_metrics": bda_metrics,
                "total_checks": total_checks,
                "high_risk_alerts": high_risk_count,
                "model_metrics": model_metrics,
                "pca_plot_url": "/api/stats/pca_plot.png"
            },
            "error": None
        }), 200

    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500


@admin_bp.route("/interactions", methods=["GET"])
def get_interactions():
    """Retrieve recent clinical check interaction logs."""
    try:
        limit = int(request.args.get("limit", 20))
        logs = drug_service.get_recent_interactions(limit=limit)
        return jsonify({"success": True, "data": logs, "error": None}), 200
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500


@admin_bp.route("/overrides", methods=["GET"])
def get_overrides():
    """Retrieve audit trail of clinician risk overrides."""
    try:
        limit = int(request.args.get("limit", 50))
        logs = audit_service.get_logs(limit=limit)
        override_logs = [l for l in logs if l.get("event_type") == "RISK_OVERRIDE"]
        return jsonify({"success": True, "data": override_logs, "error": None}), 200
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500


@admin_bp.route("/retrain", methods=["POST"])
def trigger_retrain():
    """Trigger ML model retraining pipeline asynchronously/synchronously."""
    try:
        train_all()
        return jsonify({
            "success": True,
            "data": {"message": "All ML models retrained successfully and metrics updated."},
            "error": None
        }), 200
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": f"Retraining failed: {str(e)}"}), 500
