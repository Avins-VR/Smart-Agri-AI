# backend/services/soil_moisture_service.py
"""
Soil moisture prediction service.
Exact port of load_rf_model() and predict_soil_moisture_rf() from app.py.
No logic changes.
"""

import os
import joblib
import pandas as pd

# ── Lazy singleton cache (mirrors @st.cache_resource) ────────────────────────
_rf_model   = None
_rf_encoder = None


def load_rf_model():
    """
    Load Random-Forest soil-moisture model and encoder from disk.
    Downloads model from Google Drive if not present.
    Returns (rf_model, rf_encoder) — same as app.py load_rf_model().
    """
    global _rf_model, _rf_encoder

    if _rf_model is not None and _rf_encoder is not None:
        return _rf_model, _rf_encoder

    import gdown

    project_root = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

    model_path = os.path.join(
        project_root,
        "ml_models",
        "soil_moisture",
        "soil_moisture_model.pkl"
    )

    encoder_path = os.path.join(
        project_root,
        "ml_models",
        "soil_moisture",
        "encoders.pkl"
    )
    
    # Download model from Google Drive if missing
    if not os.path.exists(model_path):
        file_id = "1AMyomHLT0s9TkeyZPXYo1QHMGMp3Ja1x"
        url = f"https://drive.google.com/uc?id={file_id}"
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        gdown.download(url, model_path, quiet=False)

    if not os.path.exists(encoder_path):
        raise FileNotFoundError(f"Encoder file not found: {encoder_path}")

    _rf_model   = joblib.load(model_path)
    _rf_encoder = joblib.load(encoder_path)

    return _rf_model, _rf_encoder


def predict_soil_moisture_rf(
    temp: float,
    humidity: float,
    rain_str: str,
    sunlight: str,
    crop: str,
    stage: str,
) -> tuple[float, str]:
    """
    Predict soil moisture percentage and status label.
    Exact port of predict_soil_moisture_rf() from app.py — no logic changes.

    Returns
    -------
    (predicted_moisture_pct: float, label: str)
    label ∈ {"Dry", "Optimal", "Wet"}
    """
    rf_model, rf_encoder = load_rf_model()

    rainfall = 10.0 if rain_str == "Yes" else 0.0

    input_df = pd.DataFrame([{
        "Temperature": float(temp),
        "Humidity":    float(humidity),
        "Rainfall":    rainfall,
        "Sunlight":    sunlight,
        "Crop_Type":   crop,
        "Crop_Stage":  stage,
    }])

    categorical_cols = ["Sunlight", "Crop_Type", "Crop_Stage"]
    numerical_cols   = ["Temperature", "Humidity", "Rainfall"]

    encoded    = rf_encoder.transform(input_df[categorical_cols])
    encoded_df = pd.DataFrame(
        encoded,
        columns=rf_encoder.get_feature_names_out(categorical_cols)
    )

    final_input = pd.concat(
        [input_df[numerical_cols].reset_index(drop=True),
         encoded_df.reset_index(drop=True)],
        axis=1,
    )

    predicted = round(float(rf_model.predict(final_input)[0]), 2)
    label     = "Dry" if predicted < 30 else ("Optimal" if predicted <= 70 else "Wet")

    return predicted, label