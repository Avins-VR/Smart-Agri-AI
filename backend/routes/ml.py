# backend/routes/ml.py
"""
ML inference endpoints.

Endpoints
---------
POST /api/ml/soil-moisture   — Predict soil moisture percentage
POST /api/ml/pest-predict    — Classify crop image as Healthy / Pest Attack
POST /api/ml/health-score    — Compute crop health score
POST /api/ml/crop-stage      — Calculate crop age and growth stage
POST /api/ml/irrigation      — Calculate irrigation recommendation
"""

from flask import Blueprint, request, jsonify
from PIL import Image

from routes.lands import jwt_required          # reuse existing decorator
from services.soil_moisture_service import predict_soil_moisture_rf
from services.npk_service import predict_npk
from services.pest_service          import predict_pest
from services.health_service import (compute_health_score,get_health_status)
from services.crop_stage_service    import calculate_crop_age_and_stage, get_stage_for_age
from services.irrigation_service    import calculate_irrigation_need

from datetime import date as date_cls
from datetime import datetime
import time

# Simple in-memory cache
NPK_HISTORY_CACHE = {}
SOIL_HISTORY_CACHE = {}

CACHE_TTL = 300  # 5 minutes

ml_bp = Blueprint("ml", __name__, url_prefix="/api/ml")


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/soil-moisture
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/soil-moisture", methods=["POST"])
@jwt_required
def soil_moisture_endpoint():
    """
    Predict soil moisture using the RF model.

    Request JSON
    ------------
    { "temp": 28.5, "humidity": 65, "rain": "No",
      "sunlight": "High", "crop": "Rice", "stage": "Vegetative" }

    Response 200
    ------------
    { "success": true, "moisture": 54.32, "label": "Optimal" }
    """
    d = request.get_json(silent=True) or {}

    required = ["temp", "humidity", "rain", "sunlight", "crop", "stage"]
    missing  = [k for k in required if k not in d]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {missing}"}), 400

    try:
        moisture, label = predict_soil_moisture_rf(
            temp     = float(d["temp"]),
            humidity = float(d["humidity"]),
            rain_str = d["rain"],
            sunlight = d["sunlight"],
            crop     = d["crop"],
            stage    = d["stage"],
        )
        return jsonify({"success": True, "moisture": moisture, "label": label}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500
    
# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/soil-moisture-history
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/soil-moisture-history", methods=["POST"])
@jwt_required
def soil_moisture_history():

    d = request.get_json()

    cache_key = str(d)

    cached = SOIL_HISTORY_CACHE.get(cache_key)

    if cached:
        timestamp, data = cached

        if time.time() - timestamp < CACHE_TTL:
            return jsonify(data)

    weather_history = d["weather_history"]
    crop = d["crop"]
    variety = d["variety"]
    planting_date = d["planting_date"]

    results = []

    planting_date_obj = date_cls.fromisoformat(planting_date)

    for day in weather_history:

        day_date = datetime.strptime(
            day["date"],
            "%Y-%m-%d"
        ).date()

        offset_days = max(
            0,
            (day_date - planting_date_obj).days
        )

        historical_stage = get_stage_for_age(
            planting_date_obj,
            variety,
            offset_days
        )

        moisture, label = predict_soil_moisture_rf(
            temp=day["temp"],
            humidity=day["humidity"],
            rain_str=day["rain"],
            sunlight=day["sunlight"],
            crop=crop,
            stage=historical_stage
        )

        results.append({
            "date": day["date"],
            "stage": historical_stage,
            "moisture": moisture,
            "label": label
        })
    response = {
        "success": True,
        "history": results
    }

    SOIL_HISTORY_CACHE[cache_key] = (
        time.time(),
        response
    )

    return jsonify(response)


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/npk-predict
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/npk-predict", methods=["POST"])
@jwt_required
def npk_predict_endpoint():
    """
    Predict NPK (Nitrogen, Phosphorus, Potassium) levels using the trained
    Random Forest pipeline.

    Replaces the random NPK seed generation from Streamlit app.py with
    proper ML-based prediction tied to real farm conditions.

    Request JSON
    ------------
    {
        "temperature":   29.1,
        "humidity":      68.0,
        "rainfall":      0.0,
        "crop":          "Rice",
        "soil_type":     "Clay",
        "variety":       "Basmati",
        "soil_moisture": 54.32
    }

    Notes on rainfall
    -----------------
    Pass 10.0 if rain == "Yes", pass 0.0 if rain == "No".
    This matches the convention used by predict_soil_moisture_rf() so both
    ML models receive rainfall in the same format they were trained on.

    Response 200
    ------------
    {
        "success":  true,
        "n":        75.81,
        "p":        95.13,
        "k":        160.83,
        "n_status": "Optimal",
        "p_status": "Optimal",
        "k_status": "Optimal"
    }

    Error 400 — missing fields
    --------------------------
    { "success": false, "message": "Missing fields: ['crop']" }

    Error 500 — model or prediction failure
    ----------------------------------------
    { "success": false, "message": "<exception message>" }
    """
    d = request.get_json(silent=True) or {}

    required = [
        "temperature", "humidity", "rainfall",
        "crop", "soil_type", "variety", "soil_moisture",
    ]
    missing = [k for k in required if k not in d]
    if missing:
        return jsonify({
            "success": False,
            "message": f"Missing fields: {missing}",
        }), 400

    try:
        result = predict_npk(
            temperature   = float(d["temperature"]),
            humidity      = float(d["humidity"]),
            rainfall      = float(d["rainfall"]),
            crop          = d["crop"],
            soil_type     = d["soil_type"],
            variety       = d["variety"],
            soil_moisture = float(d["soil_moisture"]),
        )
        return jsonify({"success": True, **result}), 200

    except FileNotFoundError as exc:
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 503

    except Exception as exc:
        return jsonify({
            "success": False,
            "message": str(exc),
        }), 500

# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/npk-predict history
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/npk-history", methods=["POST"])
@jwt_required
def npk_history():

    d = request.get_json()
    cache_key = str(d)
    cached = NPK_HISTORY_CACHE.get(cache_key)

    if cached:
        timestamp, data = cached

        if time.time() - timestamp < CACHE_TTL:
            return jsonify(data)

    weather_history = d["weather_history"]
    crop = d["crop"]
    variety = d["variety"]
    soil_type = d["soil_type"]
    planting_date = d["planting_date"]

    results = []

    planting_date_obj = date_cls.fromisoformat(
        planting_date
    )

    for day in weather_history:

        day_date = datetime.strptime(
            day["date"],
            "%Y-%m-%d"
        ).date()

        offset_days = max(
            0,
            (day_date - planting_date_obj).days
        )

        historical_stage = get_stage_for_age(
            planting_date_obj,
            variety,
            offset_days
        )

        moisture, _ = predict_soil_moisture_rf(
            temp=day["temp"],
            humidity=day["humidity"],
            rain_str=day["rain"],
            sunlight=day["sunlight"],
            crop=crop,
            stage=historical_stage
        )

        npk = predict_npk(
            temperature=day["temp"],
            humidity=day["humidity"],
            rainfall=10 if day["rain"] == "Yes" else 0,
            crop=crop,
            soil_type=soil_type,
            variety=variety,
            soil_moisture=moisture
        )

        results.append({
            "date": day["date"],
            "moisture": moisture,
            "n": npk["n"],
            "p": npk["p"],
            "k": npk["k"]
        })

    response = {
        "success": True,
        "history": results
    }

    NPK_HISTORY_CACHE[cache_key] = (
        time.time(),
        response
    )

    return jsonify(response)
    
# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/pest-predict
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/pest-predict", methods=["POST"])
@jwt_required
def pest_predict_endpoint():
    """
    Classify crop image as Healthy or Pest Attack.

    Request: multipart/form-data with field "image" (JPG/PNG/JPEG)

    Response 200
    ------------
    { "success": true, "prediction": "Healthy", "confidence": 97.43 }
    """
    if "image" not in request.files:
        return jsonify({"success": False, "message": "No image file provided. Send as multipart field 'image'."}), 400

    try:
        img  = Image.open(request.files["image"])
        pred, conf = predict_pest(img)
        return jsonify({"success": True, "prediction": pred, "confidence": conf}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/health-score
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/health-score", methods=["POST"])
@jwt_required
def health_score_endpoint():
    """
    Compute the crop health score.

    Request JSON
    ------------
    { "pest_prediction": "Healthy", "moisture_numeric": 54.3,
      "temp": 29.1, "humidity": 68, "n": 55, "p": 60, "k": 48 }

    Response 200
    ------------
    { "success": true, "health": 82, "status": {...} }
    """
    d = request.get_json(silent=True) or {}

    required = ["pest_prediction", "moisture_numeric", "temp", "humidity", "n", "p", "k"]
    missing  = [k for k in required if k not in d]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {missing}"}), 400

    try:
        score  = compute_health_score(
            pest_prediction  = d["pest_prediction"],
            moisture_numeric = float(d["moisture_numeric"]),
            temp             = float(d["temp"]),
            humidity         = float(d["humidity"]),
            n                = float(d["n"]),
            p                = float(d["p"]),
            k                = float(d["k"]),
        )
        status = get_health_status(score)
        return jsonify({"success": True, "health": score, "status": status}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500

# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/health-score-history
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/health-history", methods=["POST"])
@jwt_required
def health_history():

    d = request.get_json()

    weather_history = d["weather_history"]
    crop = d["crop"]
    variety = d["variety"]
    soil_type = d["soil_type"]
    planting_date = d["planting_date"]
    pest_prediction = d["pest_prediction"]

    results = []

    planting_date_obj = date_cls.fromisoformat(
        planting_date
    )

    for day in weather_history:

        day_date = datetime.strptime(
            day["date"],
            "%Y-%m-%d"
        ).date()

        offset_days = max(
            0,
            (day_date - planting_date_obj).days
        )

        historical_stage = get_stage_for_age(
            planting_date_obj,
            variety,
            offset_days
        )

        moisture, _ = predict_soil_moisture_rf(
            temp=day["temp"],
            humidity=day["humidity"],
            rain_str=day["rain"],
            sunlight=day["sunlight"],
            crop=crop,
            stage=historical_stage
        )

        npk = predict_npk(
            temperature=day["temp"],
            humidity=day["humidity"],
            rainfall=10 if day["rain"] == "Yes" else 0,
            crop=crop,
            soil_type=soil_type,
            variety=variety,
            soil_moisture=moisture
        )

        health = compute_health_score(
            pest_prediction=pest_prediction,
            moisture_numeric=moisture,
            temp=day["temp"],
            humidity=day["humidity"],
            n=npk["n"],
            p=npk["p"],
            k=npk["k"]
        )

        results.append({
            "date": day["date"],
            "health": health
        })

    return jsonify({
        "success": True,
        "history": results
    })

# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/crop-stage
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/crop-stage", methods=["POST"])
@jwt_required
def crop_stage_endpoint():
    """
    Calculate crop age and current growth stage.

    Request JSON
    ------------
    { "planting_date": "2026-01-15", "crop": "Rice", "variety": "Basmati" }

    Response 200
    ------------
    { "success": true, "crop_age_days": 45, "crop_stage": "Vegetative",
      "days_in_current_stage": 25, "days_to_next_stage": 25,
      "next_stage": "Flowering", "total_duration": 150,
      "estimated_harvest_date": "2026-06-14",
      "stage_progress_pct": 50.0, "lifecycle": {...} }
    """
    d = request.get_json(silent=True) or {}

    required = ["planting_date", "crop", "variety"]
    missing  = [k for k in required if k not in d]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {missing}"}), 400

    try:
        planting_date = date_cls.fromisoformat(d["planting_date"])
        result        = calculate_crop_age_and_stage(planting_date, d["crop"], d["variety"])
        return jsonify({"success": True, **result}), 200
    except ValueError as exc:
        return jsonify({"success": False, "message": str(exc)}), 400
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/irrigation
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/irrigation", methods=["POST"])
@jwt_required
def irrigation_endpoint():
    """
    Calculate irrigation recommendation.

    Request JSON
    ------------
    { "moisture_numeric": 42.1, "rain": "No", "temp": 30.2,
      "humidity": 65, "crop": "Rice", "variety": "Basmati",
      "crop_stage": "Vegetative", "crop_age_days": 45 }

    Response 200
    ------------
    { "success": true, "status": "ON", "reason": "...", "urgency": "High",
      "daily_req_mm": 5.8, "daily_usage_L": 23484.0,
      "efficiency": 82.4, "next_timing": "Today evening 5:00 PM" }
    """
    d = request.get_json(silent=True) or {}

    required = ["moisture_numeric", "rain", "temp", "humidity",
                "crop", "variety", "crop_stage", "crop_age_days"]
    missing  = [k for k in required if k not in d]
    if missing:
        return jsonify({"success": False, "message": f"Missing fields: {missing}"}), 400

    try:
        result = calculate_irrigation_need(
            moisture_numeric = float(d["moisture_numeric"]),
            rain             = d["rain"],
            temp             = float(d["temp"]),
            humidity         = float(d["humidity"]),
            crop             = d["crop"],
            variety          = d["variety"],
            crop_stage       = d["crop_stage"],
            crop_age_days    = int(d["crop_age_days"]),
        )
        return jsonify({"success": True, **result}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500
    
# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ml/irrigation-history
# ══════════════════════════════════════════════════════════════════════════════

@ml_bp.route("/irrigation-history", methods=["POST"])
@jwt_required
def irrigation_history():

    d = request.get_json()

    weather_history = d["weather_history"]
    crop = d["crop"]
    variety = d["variety"]
    planting_date = d["planting_date"]

    results = []

    planting_date_obj = date_cls.fromisoformat(
        planting_date
    )

    for day in weather_history:

        day_date = datetime.strptime(
            day["date"],
            "%Y-%m-%d"
        ).date()

        offset_days = max(
            0,
            (day_date - planting_date_obj).days
        )

        historical_stage = get_stage_for_age(
            planting_date_obj,
            variety,
            offset_days
        )

        moisture, _ = predict_soil_moisture_rf(
            temp=day["temp"],
            humidity=day["humidity"],
            rain_str=day["rain"],
            sunlight=day["sunlight"],
            crop=crop,
            stage=historical_stage
        )

        irrigation = calculate_irrigation_need(
            moisture_numeric=moisture,
            rain=day["rain"],
            temp=day["temp"],
            humidity=day["humidity"],
            crop=crop,
            variety=variety,
            crop_stage=historical_stage,
            crop_age_days=offset_days
        )

        results.append({
            "date": day["date"],
            "stage": historical_stage,
            "moisture": moisture,
            "status": irrigation["status"],
            "reason": irrigation["reason"],
            "daily_req_mm": irrigation["daily_req_mm"],
            "daily_usage_L": irrigation["daily_usage_L"]
        })

    return jsonify({
        "success": True,
        "history": results
    })