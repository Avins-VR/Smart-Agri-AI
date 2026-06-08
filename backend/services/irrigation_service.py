# backend/services/irrigation_service.py
"""
Irrigation intelligence service.
Exact port of calculate_irrigation_need() from app.py — no logic changes.
"""

from services.constants import VARIETY_WATER_REQ


def calculate_irrigation_need(
    moisture_numeric: float,
    rain: str,
    temp: float,
    humidity: float,
    crop: str,
    variety: str,
    crop_stage: str,
    crop_age_days: int,
) -> dict:
    """
    Calculate irrigation recommendation based on live sensor data.
    Exact port of calculate_irrigation_need() from app.py — no logic changes.

    Returns
    -------
    dict with keys:
        status, reason, urgency, daily_req_mm, daily_usage_L,
        efficiency, next_timing
    """
    base_req   = VARIETY_WATER_REQ.get(variety, 5.5)
    stage_mult = {
        "Seedling": 0.6, "Vegetative": 1.0, "Flowering": 1.2,
        "Fruiting": 1.1, "Harvest":    0.4,
    }.get(crop_stage, 1.0)

    temp_adj     = 1.0 + max(0, (temp - 28) * 0.03)
    hum_adj      = 1.0 - max(0, (humidity - 60) * 0.005)
    daily_req_mm = round(base_req * stage_mult * temp_adj * hum_adj, 1)

    # ── Status determination ──────────────────────────────────────────────────
    if rain == "Yes":
        status  = "OFF"
        reason  = "Rain provides sufficient water today"
        urgency = "Low"
    elif moisture_numeric < 30:
        status  = "ON"
        reason  = "Critical: Soil is very dry — irrigate immediately"
        urgency = "Critical"
    elif moisture_numeric < 45:
        status  = "ON"
        reason  = "Soil moisture below threshold — irrigation needed"
        urgency = "High"
    elif moisture_numeric < 60:
        status  = "ON"
        reason  = "Scheduled irrigation to maintain optimal moisture"
        urgency = "Medium"
    else:
        status  = "OFF"
        reason  = "Soil moisture is sufficient — skip irrigation"
        urgency = "Low"

    # ── Efficiency calculation ────────────────────────────────────────────────
    if 40 <= moisture_numeric <= 70:
        efficiency = min(100, 75 + (100 - temp) * 0.5)
    elif moisture_numeric < 40:
        efficiency = max(40, moisture_numeric * 1.2)
    else:
        efficiency = max(50, 100 - (moisture_numeric - 70) * 2)
    efficiency = round(efficiency, 1)

    # ── Next irrigation timing ────────────────────────────────────────────────
    if status == "OFF":
        next_irr = "Tomorrow morning 6:00 AM" if rain == "No" else "Day after tomorrow"
    elif urgency == "Critical":
        next_irr = "Immediately"
    else:
        next_irr = "Today evening 5:00 PM"

    daily_usage_L = round(daily_req_mm * 4046 / 1000, 0)

    return {
        "status":        status,
        "reason":        reason,
        "urgency":       urgency,
        "daily_req_mm":  daily_req_mm,
        "daily_usage_L": daily_usage_L,
        "efficiency":    efficiency,
        "next_timing":   next_irr,
    }