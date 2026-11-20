import os
import sys
import datetime

# Ensure project root is in sys.path
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask, jsonify, send_from_directory, send_file
from backend.config import Config
from backend.extensions import jwt, cors
from backend.api.auth_routes import auth_bp
from backend.api.check_routes import check_bp
from backend.api.drug_routes import drug_bp
from backend.api.admin_routes import admin_bp
from backend.api.stats_routes import stats_bp

FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

def create_app(config_class=Config):
    """Flask Application Factory."""
    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")
    app.config.from_object(config_class)

    # Initialize Extensions
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(check_bp)
    app.register_blueprint(drug_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(stats_bp)

    @app.route("/health", methods=["GET"])
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health check endpoint."""
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        return jsonify({
            "success": True,
            "data": {
                "status": "HEALTHY",
                "ai_engine": "online",
                "service": "LASA Unified AI Healthcare Safety Engine",
                "version": "2.0.0",
                "timestamp": timestamp
            },
            "status": "HEALTHY",
            "ai_engine": "online",
            "service": "LASA Unified AI Healthcare Safety Engine",
            "version": "2.0.0",
            "timestamp": timestamp,
            "error": None
        }), 200

    # Catch-all route to serve React frontend SPA
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path and not path.startswith("api"):
            file_path = os.path.join(FRONTEND_DIST, path)
            if os.path.exists(file_path):
                return send_from_directory(FRONTEND_DIST, path)
        
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return send_file(index_file)
        
        return jsonify({
            "success": True,
            "data": {
                "message": "LASA Guard API Gateway Running",
                "health_check": "/health",
                "note": "Frontend dist not built yet. Run 'npm run build' inside frontend directory."
            },
            "error": None
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "data": None, "error": "Requested resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "data": None, "error": "Internal server error"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
