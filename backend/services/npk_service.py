# backend/services/npk_service.py
"""
NPK prediction service using the trained Random Forest pipeline.

Replaces the random NPK generation from Streamlit app.py with proper
ML-based prediction using the trained model at:
    ml_models/npk/npk_random_forest_model.pkl

Model architecture (from NPK_Model.ipynb, exactly as trained):
    Pipeline([
        ("preprocessor", ColumnTransformer([
            ("cat", OneHotEncoder(handle_unknown="ignore"),
                    ["Crop", "Soil_Type", "Variety"]),
            ("num", "passthrough",
                    ["Temperature", "Humidity", "Rainfall", "Soil_Moisture"]),
        ])),
        ("regressor", MultiOutputRegressor(RandomForestRegressor(
            n_estimators=300, max_depth=12,
            min_samples_split=10, min_samples_leaf=4,
            max_features="sqrt", random_state=42, n_jobs=-1
        )))
    ])

    Targets: Nitrogen, Phosphorus, Potassium  (in that order)
    Input features (7 total):
        Temperature   float  — degrees Celsius
        Humidity      float  — percentage 0–100
        Rainfall      float  — mm
        Crop          str    — e.g. "Rice"
        Soil_Type     str    — e.g. "Clay"
        Variety       str    — e.g. "Basmati"
        Soil_Moisture float  — percentage 0–100

No separate encoder file is required — the ColumnTransformer is embedded
inside the pipeline and saved together in the single .pkl file.
"""

import os
import joblib
import pandas as pd

# ── Lazy singleton cache (mirrors existing ML service pattern) ─────────────────
_npk_model = None


def load_npk_model():
    """
    Load the trained NPK RandomForest pipeline from disk.
    Uses lazy loading — model is loaded once and cached for subsequent calls.

    The pipeline object contains both the preprocessor (ColumnTransformer with
    OneHotEncoder) and the MultiOutputRegressor, exactly as saved in the
    training notebook.

    Returns
    -------
    sklearn.pipeline.Pipeline  Trained NPK prediction pipeline.

    Raises
    ------
    FileNotFoundError  If the .pkl file is not found at the expected path.
    """
    global _npk_model

    if _npk_model is not None:
        return _npk_model

    
    project_root =os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

    model_path = os.path.join(
        project_root,
        "ml_models",
        "npk",
        "npk_random_forest_model.pkl"
    )
   
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"NPK model not found at: {model_path}\n"
            f"Expected file: npk_random_forest_model.pkl\n"
            f"Train the model using NPK_Model.ipynb and save the output there."
        )

    _npk_model = joblib.load(model_path)
    return _npk_model


def predict_npk(
    temperature:    float,
    humidity:       float,
    rainfall:       float,
    crop:           str,
    soil_type:      str,
    variety:        str,
    soil_moisture:  float,
) -> dict:
    """
    Predict Nitrogen, Phosphorus, and Potassium levels using the trained
    Random Forest pipeline.

    Input features match the training notebook exactly:
        Temperature, Humidity, Rainfall, Crop, Soil_Type, Variety, Soil_Moisture

    Parameters
    ----------
    temperature   : Air temperature in °C.
    humidity      : Relative humidity percentage (0–100).
    rainfall      : Rainfall in mm (use 10.0 for rain="Yes", 0.0 for "No",
                    matching the soil moisture service convention).
    crop          : Crop category string, e.g. "Rice".
    soil_type     : Soil type string, e.g. "Clay".
    variety       : Crop variety string, e.g. "Basmati".
    soil_moisture : Predicted or measured soil moisture percentage (0–100).

    Returns
    -------
    dict with keys:
        n  (float)  Predicted Nitrogen   level, rounded to 2 decimal places.
        p  (float)  Predicted Phosphorus level, rounded to 2 decimal places.
        k  (float)  Predicted Potassium  level, rounded to 2 decimal places.
        n_status  (str)   "Optimal" / "Moderate" / "Low"
        p_status  (str)   "Optimal" / "Moderate" / "Low"
        k_status  (str)   "Optimal" / "Moderate" / "Low"

    Notes
    -----
    The OneHotEncoder inside the pipeline uses handle_unknown="ignore",
    so unseen crop/soil/variety values will be silently zero-encoded rather
    than raising an error.
    """
    model = load_npk_model()

    # Build input DataFrame with EXACTLY the same column names used in training
    input_df = pd.DataFrame([{
        "Temperature":   float(temperature),
        "Humidity":      float(humidity),
        "Rainfall":      float(rainfall),
        "Crop":          str(crop),
        "Soil_Type":     str(soil_type),
        "Variety":       str(variety),
        "Soil_Moisture": float(soil_moisture),
    }])

    # Run the pipeline (preprocessing + prediction in one call)
    prediction = model.predict(input_df)

    # prediction shape: (1, 3)  →  [Nitrogen, Phosphorus, Potassium]
    n_val = round(float(prediction[0][0]), 2)
    p_val = round(float(prediction[0][1]), 2)
    k_val = round(float(prediction[0][2]), 2)

    return {
        "n":        n_val,
        "p":        p_val,
        "k":        k_val,
        "n_status": _npk_status(n_val),
        "p_status": _npk_status(p_val),
        "k_status": _npk_status(k_val),
    }


def _npk_status(value: float) -> str:
    """
    Classify an NPK value into a human-readable status label.
    Thresholds mirror the npk_status_badge() logic in Streamlit app.py:
        >= 60  →  Optimal
        >= 40  →  Moderate
        <  40  →  Low
    """
    if value >= 60.0:
        return "Optimal"
    elif value >= 40.0:
        return "Moderate"
    else:
        return "Low"