import os
from flask import Blueprint, jsonify, send_file
from backend.config import Config
from backend.services.bda_service import bda_service
from backend.services.drug_service import drug_service

stats_bp = Blueprint("stats", __name__, url_prefix="/api/stats")

@stats_bp.route("", methods=["GET"])
def get_public_stats():
    """Retrieve public system metrics for landing page counters."""
    try:
        all_drugs = drug_service.find_all_drug_names()
        bda_stats = bda_service.get_dashboard_metrics()
        
        return jsonify({
            "success": True,
            "data": {
                "total_drugs_cataloged": len(all_drugs),
                "bloom_filter_items": bda_stats["bloom_filter"]["items_added"],
                "distinct_drugs_checked": bda_stats["flajolet_martin"]["estimated_distinct"],
                "high_risk_sliding_count": bda_stats["dgim"]["estimated_high_risk_count"],
                "system_status": "ONLINE",
                "compliance": "FDA / ISMP Compliant"
            },
            "error": None
        }), 200
    except Exception as e:
        return jsonify({"success": False, "data": None, "error": str(e)}), 500


@stats_bp.route("/pca_plot.png", methods=["GET"])
def get_pca_plot():
    """Serve generated PCA 2D embedding scatter plot image."""
    plot_path = os.path.join(Config.MODEL_DIR, "pca_plot.png")
    if os.path.exists(plot_path):
        return send_file(plot_path, mimetype="image/png")
    return jsonify({"success": False, "data": None, "error": "PCA plot image not generated yet"}), 404
