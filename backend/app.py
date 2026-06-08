# backend/app.py
"""
Smart Agri AI — Flask application entry point.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os

from config import get_config
from db import get_db
from routes.auth import auth_bp
from routes.lands import lands_bp

from routes.ml        import ml_bp
from routes.weather   import weather_bp
from routes.advisory  import advisory_bp
from routes.chatbot   import chatbot_bp
from routes.dashboard import dashboard_bp

def create_app() -> Flask:
    """Application factory — creates and configures the Flask app."""

    cfg = get_config()
    app = Flask(__name__)
    app.config.from_object(cfg)

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS(
        app,
        resources={r"/*": {"origins": [
            "http://localhost:5173",
            os.getenv("FRONTEND_URL")
        ]}},
        supports_credentials=True
    )

    # ── Database (eager connect so startup fails fast on bad URI) ─────────────
    with app.app_context():
        get_db()

    # ── Blueprints ────────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(lands_bp)
    app.register_blueprint(ml_bp)         # new
    app.register_blueprint(weather_bp)    # new
    app.register_blueprint(advisory_bp)   # new
    app.register_blueprint(chatbot_bp)    # new
    app.register_blueprint(dashboard_bp)  # new

    # ── Global error handlers ─────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"success": False, "message": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(_err):
        return jsonify({"success": False, "message": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(_err):
        return jsonify({"success": False, "message": "Internal server error."}), 500

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "Smart Agri AI API"}), 200

    return app


# ── Entry point ───────────────────────────────────────────────────────────────
# Create application for Gunicorn
application = create_app()

# Local development
if __name__ == "__main__":
    application.run(
        host="0.0.0.0",
        port=5000,
        debug=application.config.get("DEBUG", False)
    )