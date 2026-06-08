# backend/routes/advisory.py
"""
AI Advisory endpoint.

Endpoints
---------
POST /api/advisory/generate   — Generate AI advisory sections via Mistral
"""

from flask import Blueprint, request, jsonify
from routes.lands import jwt_required
from services.advisory_service import generate_ai_advisory

advisory_bp = Blueprint("advisory", __name__, url_prefix="/api/advisory")


@advisory_bp.route("/generate", methods=["POST"])
@jwt_required
def generate_advisory():
    """
    Generate AI-powered farm advisory using Mistral.

    Request JSON
    ------------
    {
        "live_data": {
            "moisture":         "Optimal",
            "moisture_numeric": 54.3,
            "temp":             29.1,
            "humidity":         68,
            "rain":             "No",
            "sunlight":         "High",
            "crop_stage":       "Vegetative",
            "pest":             "Not Detected",
            "pest_prediction":  "Healthy",
            "health":           82,
            "n":                55,
            "p":                60,
            "k":                48
        },
        "crop_info": {
            "crop":                   "Rice",
            "variety":                "Basmati",
            "acres":                  23,
            "planting_date":          "2026-01-15",
            "crop_age_days":          45,
            "crop_stage":             "Vegetative",
            "estimated_harvest_date": "2026-06-14",
            "total_duration":         150,
            "irr_status":             "ON",
            "daily_req_mm":           5.8
        },
        "pest_confidence": 0.0
    }

    Response 200
    ------------
    {
        "success": true,
        "sections": [
            { "icon": "💧", "title": "Irrigation Advisory", "body": "..." },
            ...
        ]
    }
    """
    body = request.get_json(silent=True) or {}

    live_data       = body.get("live_data")
    crop_info       = body.get("crop_info")
    pest_confidence = float(body.get("pest_confidence", 0.0))

    if not live_data or not crop_info:
        return jsonify({
            "success": False,
            "message": "Both 'live_data' and 'crop_info' are required.",
        }), 400

    try:
        sections = generate_ai_advisory(live_data, crop_info, pest_confidence)
        return jsonify({"success": True, "sections": sections}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500