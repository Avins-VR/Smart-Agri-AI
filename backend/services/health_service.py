# backend/services/health_service.py
"""
Crop health score computation.
Exact port of compute_health_score() and get_health_status() from app.py
— no logic changes.
"""


def compute_health_score(
    pest_prediction: str,
    moisture_numeric: float,
    temp: float,
    humidity: float,
    n: float,
    p: float,
    k: float,
) -> int:
    """
    Compute crop health score using the weighted formula.
    Exact port of compute_health_score() from app.py — no logic changes.

    Weights
    -------
    Classification  50%
    Soil Moisture   15%
    Temperature     10%
    Humidity        10%
    NPK Balance     15%

    Returns
    -------
    int  Health score 0–100.
    """
    # 1. Classification score (50%)
    classification_score = 100 if pest_prediction == "Healthy" else 25

    # 2. Soil Moisture score (15%)
    if 40 <= moisture_numeric <= 70:
        moisture_score = 100
    elif (30 <= moisture_numeric < 40) or (71 <= moisture_numeric <= 80):
        moisture_score = 70
    else:
        moisture_score = 40

    # 3. Temperature score (10%)
    if 25 <= temp <= 32:
        temp_score = 100
    elif (20 <= temp < 25) or (33 <= temp <= 36):
        temp_score = 70
    else:
        temp_score = 40

    # 4. Humidity score (10%)
    if 50 <= humidity <= 75:
        humidity_score = 100
    elif (40 <= humidity < 50) or (76 <= humidity <= 85):
        humidity_score = 70
    else:
        humidity_score = 40

    # 5. NPK Balance score (15%)
    avg_npk = (n + p + k) / 3
    if 55 <= avg_npk <= 75:
        npk_score = 100
    elif (40 <= avg_npk < 55) or (76 <= avg_npk <= 85):
        npk_score = 70
    else:
        npk_score = 40

    # Weighted sum
    health_score = (
        classification_score * 0.50
        + moisture_score     * 0.15
        + temp_score         * 0.10
        + humidity_score     * 0.10
        + npk_score          * 0.15
    )
    return int(round(health_score))


def get_health_status(score: int) -> dict:
    """
    Return status label and badge colour from health score.
    Exact port of get_health_status() from app.py — no logic changes.
    """
    if score >= 85:
        return {"label": "Excellent", "color": "#61ba6a", "badge": "green"}
    elif score >= 70:
        return {"label": "Good",      "color": "#61ba6a", "badge": "green"}
    elif score >= 50:
        return {"label": "Moderate",  "color": "#f5c842", "badge": "yellow"}
    elif score >= 30:
        return {"label": "Risk",      "color": "#f5c842", "badge": "yellow"}
    else:
        return {"label": "Critical",  "color": "#fa5d5d", "badge": "red"}