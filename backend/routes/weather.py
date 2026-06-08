# backend/routes/weather.py
"""
Weather data endpoints.

Endpoints
---------
GET /api/weather/current        — Current weather conditions
GET /api/weather/history        — 7-day temperature history
GET /api/weather/rain-history   — 14-day rain history
"""

from flask import Blueprint, jsonify
from routes.lands import jwt_required
from services.weather_service import (
    get_weather_data,
    get_past_7day_temperature,
    get_rain_history_14days,
)

weather_bp = Blueprint("weather", __name__, url_prefix="/api/weather")


@weather_bp.route("/current", methods=["GET"])
@jwt_required
def current_weather():
    """
    Fetch current weather from Open-Meteo (Chennai, Tamil Nadu).

    Response 200
    ------------
    { "success": true, "weather": { "temp": 29.5, "humidity": 68,
                                    "rain": "No", "sunlight": "High" } }
    """
    try:
        weather = get_weather_data()
        return jsonify({"success": True, "weather": weather}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": f"Weather API error: {exc}"}), 503


@weather_bp.route("/history", methods=["GET"])
@jwt_required
def temperature_history():
    """
    Fetch 7-day daily max temperature.

    Response 200
    ------------
    { "success": true, "data": [ {"date": "01 Jun", "temp": 34.2}, ... ] }
    """
    try:
        data = get_past_7day_temperature()
        return jsonify({"success": True, "data": data}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 503


@weather_bp.route("/rain-history", methods=["GET"])
@jwt_required
def rain_history():
    """
    Fetch 14-day daily precipitation.

    Response 200
    ------------
    { "success": true, "data": [ {"date": "01 Jun", "rain_mm": 2.5, "event": "Rain"}, ... ] }
    """
    try:
        data = get_rain_history_14days()
        return jsonify({"success": True, "data": data}), 200
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 503