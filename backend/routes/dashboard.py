# backend/routes/dashboard.py
"""
Dashboard live-data endpoint.

Endpoint
--------
POST /api/dashboard/live-data   — Returns the same payload as get_live_data()
                                   in app.py, computed from live weather + ML.
"""

from flask import Blueprint, request, jsonify
from datetime import date as date_cls

from routes.lands           import jwt_required
from services.weather_service      import get_weather_data
from services.soil_moisture_service import predict_soil_moisture_rf
from services.health_service       import compute_health_score, get_health_status
from services.crop_stage_service   import calculate_crop_age_and_stage
from services.irrigation_service   import calculate_irrigation_need

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/live-data", methods=["POST"])
@jwt_required
def live_data():
    """
    Compute and return the complete live dashboard data object.
    Produces the same output as get_live_data() in app.py — no logic changes.

    Request JSON
    ------------
    {
        "crop":            "Rice",
        "variety":         "Basmati",
        "planting_date":   "2026-01-15",
        "crop_stage":      "Vegetative",
        "pest_prediction": "Healthy",
        "n_level":         55,
        "p_level":         60,
        "k_level":         48
    }

    Response 200
    ------------
    {
        "success": true,
        "data": {
            "moisture":         "Optimal",
            "moisture_numeric": 54.32,
            "temp":             29.1,
            "rain":             "No",
            "sunlight":         "High",
            "humidity":         68,
            "crop_stage":       "Vegetative",
            "pest":             "Not Detected",
            "pest_prediction":  "Healthy",
            "health":           82,
            "n":                55,
            "p":                60,
            "k":                48,
            "weather":          { "temp": 29.1, ... }
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
        }
    }
    """
    body = request.get_json(silent=True) or {}

    required = ["crop", "variety", "planting_date", "crop_stage",
                "pest_prediction", "n_level", "p_level", "k_level"]
    missing  = [k for k in required if k not in body]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {missing}"}), 400

    crop            = body["crop"]
    variety         = body["variety"]
    planting_date   = body["planting_date"]
    crop_stage      = body["crop_stage"]
    pest_prediction = body["pest_prediction"]
    n_level         = float(body["n_level"])
    p_level         = float(body["p_level"])
    k_level         = float(body["k_level"])
    acres           = float(body.get("acres", 10))

    # ── 1. Fetch live weather ─────────────────────────────────────────────────
    try:
        weather = get_weather_data()
    except Exception as exc:
        return jsonify({"success": False, "message": f"Weather API failed: {exc}"}), 503

    # ── 2. Predict soil moisture (mirrors get_live_data logic exactly) ────────
    try:
        moisture_numeric, moisture_label = predict_soil_moisture_rf(
            temp     = weather["temp"],
            humidity = weather["humidity"],
            rain_str = weather["rain"],
            sunlight = weather["sunlight"],
            crop     = crop,
            stage    = crop_stage,
        )
    except Exception:
        moisture_numeric = 45.0
        moisture_label   = "Optimal"

    # ── 3. Pest display label ─────────────────────────────────────────────────
    pest_display = "Not Detected" if pest_prediction == "Healthy" else "Detected"

    # ── 4. Health score ───────────────────────────────────────────────────────
    health = compute_health_score(
        pest_prediction  = pest_prediction,
        moisture_numeric = moisture_numeric,
        temp             = weather["temp"],
        humidity         = weather["humidity"],
        n                = n_level,
        p                = p_level,
        k                = k_level,
    )

    # ── 5. Crop age / stage ───────────────────────────────────────────────────
    try:
        planting_date_obj = date_cls.fromisoformat(planting_date)
        crop_age_info     = calculate_crop_age_and_stage(planting_date_obj, crop, variety)
    except Exception:
        crop_age_info = {
            "crop_age_days": 0, "crop_stage": crop_stage,
            "days_in_current_stage": 0, "days_to_next_stage": 0,
            "next_stage": "—", "total_duration": 0,
            "estimated_harvest_date": planting_date,
            "stage_progress_pct": 0.0, "lifecycle": {},
        }

    # ── 6. Irrigation recommendation ─────────────────────────────────────────
    irr_rec = calculate_irrigation_need(
        moisture_numeric = moisture_numeric,
        rain             = weather["rain"],
        temp             = weather["temp"],
        humidity         = weather["humidity"],
        crop             = crop,
        variety          = variety,
        crop_stage       = crop_stage,
        crop_age_days    = crop_age_info["crop_age_days"],
    )

    # ── 7. Assemble live_data dict (same keys as get_live_data return) ────────
    live_data_payload = {
        "moisture":         moisture_label,
        "moisture_numeric": moisture_numeric,
        "temp":             weather["temp"],
        "rain":             weather["rain"],
        "sunlight":         weather["sunlight"],
        "humidity":         weather["humidity"],
        "crop_stage":       crop_stage,
        "pest":             pest_display,
        "pest_prediction":  pest_prediction,
        "health":           health,
        "n":                n_level,
        "p":                p_level,
        "k":                k_level,
        "weather":          weather,
    }

    # ── 8. Assemble crop_info dict (same keys as Streamlit crop_info) ─────────
    crop_info_payload = {
        "crop":                   crop,
        "variety":                variety,
        "acres":                  acres,
        "planting_date":          planting_date,
        "crop_age_days":          crop_age_info["crop_age_days"],
        "crop_stage":             crop_stage,
        "estimated_harvest_date": crop_age_info["estimated_harvest_date"],
        "total_duration":         crop_age_info["total_duration"],
        "irr_status":             irr_rec["status"],
        "daily_req_mm":           irr_rec["daily_req_mm"],
    }

    return jsonify({
        "success":   True,
        "data":      live_data_payload,
        "crop_info": crop_info_payload,
        "irr_rec":   irr_rec,
        "crop_age_info": {
            k: v for k, v in crop_age_info.items()
            if k != "lifecycle"          # lifecycle dict is large; exclude by default
        },
    }), 200