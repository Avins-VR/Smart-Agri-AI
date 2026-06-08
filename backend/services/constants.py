# backend/services/constants.py
"""
All constants from Streamlit app.py — values unchanged.
"""

# ── Crop varieties ─────────────────────────────────────────────────────────────
CROP_VARIETIES: dict[str, list[str]] = {
    "Rice":      ["Basmati", "Ponni", "IR64", "Sona Masuri", "ADT-43"],
    "Maize":     ["Sweet Corn", "Hybrid Maize", "Dent Corn", "Flint Corn"],
    "Wheat":     ["Durum", "Emmer", "Bread Wheat"],
    "Sugarcane": ["Co 86032", "Co 0238"],
    "Cotton":    ["Bt Cotton", "Hybrid Cotton"],
    "Tomato":    ["Cherry Tomato", "Roma Tomato", "Hybrid Tomato"],
    "Paddy":     ["White Paddy", "Red Paddy"],
}

SOIL_TYPES: list[str] = [
    "Clay",
    "Sandy",
    "Loamy",
    "Silt",
    "Peaty",
    "Saline",
]

CROP_ICONS: dict[str, str] = {
    "Wheat": "🌾", "Rice": "🍚", "Paddy": "🌾",
    "Maize": "🌽", "Sugarcane": "🎋", "Cotton": "🤍", "Tomato": "🍅",
}

# ── Crop lifecycle durations (days per stage) — values unchanged ──────────────
VARIETY_LIFECYCLE: dict[str, dict[str, int]] = {
    "Basmati":       {"Seedling": 20, "Vegetative": 50, "Flowering": 30, "Fruiting": 35, "Harvest": 15},
    "Ponni":         {"Seedling": 18, "Vegetative": 55, "Flowering": 25, "Fruiting": 32, "Harvest": 15},
    "IR64":          {"Seedling": 15, "Vegetative": 40, "Flowering": 20, "Fruiting": 25, "Harvest": 10},
    "Sona Masuri":   {"Seedling": 18, "Vegetative": 50, "Flowering": 25, "Fruiting": 30, "Harvest": 12},
    "ADT-43":        {"Seedling": 15, "Vegetative": 38, "Flowering": 18, "Fruiting": 25, "Harvest": 10},
    "Sweet Corn":    {"Seedling": 10, "Vegetative": 30, "Flowering": 15, "Fruiting": 20, "Harvest": 10},
    "Hybrid Maize":  {"Seedling": 12, "Vegetative": 35, "Flowering": 18, "Fruiting": 25, "Harvest": 10},
    "Dent Corn":     {"Seedling": 10, "Vegetative": 32, "Flowering": 15, "Fruiting": 22, "Harvest": 10},
    "Flint Corn":    {"Seedling": 10, "Vegetative": 30, "Flowering": 15, "Fruiting": 20, "Harvest":  8},
    "Durum":         {"Seedling": 12, "Vegetative": 35, "Flowering": 18, "Fruiting": 25, "Harvest": 10},
    "Emmer":         {"Seedling": 15, "Vegetative": 40, "Flowering": 20, "Fruiting": 28, "Harvest": 12},
    "Bread Wheat":   {"Seedling": 12, "Vegetative": 35, "Flowering": 18, "Fruiting": 25, "Harvest": 10},
    "Co 86032":      {"Seedling": 25, "Vegetative":120, "Flowering": 45, "Fruiting":120, "Harvest": 30},
    "Co 0238":       {"Seedling": 22, "Vegetative":110, "Flowering": 40, "Fruiting":110, "Harvest": 25},
    "Bt Cotton":     {"Seedling": 18, "Vegetative": 50, "Flowering": 30, "Fruiting": 45, "Harvest": 20},
    "Hybrid Cotton": {"Seedling": 20, "Vegetative": 55, "Flowering": 35, "Fruiting": 50, "Harvest": 20},
    "Cherry Tomato": {"Seedling": 12, "Vegetative": 28, "Flowering": 18, "Fruiting": 30, "Harvest": 12},
    "Roma Tomato":   {"Seedling": 14, "Vegetative": 30, "Flowering": 20, "Fruiting": 32, "Harvest": 14},
    "Hybrid Tomato": {"Seedling": 15, "Vegetative": 35, "Flowering": 22, "Fruiting": 35, "Harvest": 15},
    "White Paddy":   {"Seedling": 18, "Vegetative": 50, "Flowering": 25, "Fruiting": 30, "Harvest": 15},
    "Red Paddy":     {"Seedling": 20, "Vegetative": 55, "Flowering": 30, "Fruiting": 35, "Harvest": 15},
}

# ── Water requirements (mm/day at base) — values unchanged ────────────────────
VARIETY_WATER_REQ: dict[str, float] = {
    "Basmati": 6.0, "Ponni": 7.5, "IR64": 7.0, "Sona Masuri": 6.5, "ADT-43": 7.2,
    "Sweet Corn": 5.5, "Hybrid Maize": 5.0, "Dent Corn": 4.8, "Flint Corn": 4.5,
    "Durum": 4.0, "Emmer": 3.8, "Bread Wheat": 4.2,
    "Co 86032": 8.5, "Co 0238": 8.0,
    "Bt Cotton": 5.5, "Hybrid Cotton": 5.0,
    "Cherry Tomato": 4.5, "Roma Tomato": 5.0, "Hybrid Tomato": 5.5,
    "White Paddy": 7.5, "Red Paddy": 7.0,
}

# ── Mistral AI ─────────────────────────────────────────────────────────────────
MISTRAL_API_KEY: str  = "9jh2jbbzvPbUtJT73tuQIxcEAOPdBuKr"
MISTRAL_MODEL:   str  = "mistral-small"
MISTRAL_URL:     str  = "https://api.mistral.ai/v1/chat/completions"

# ── Open-Meteo ─────────────────────────────────────────────────────────────────
WEATHER_LAT: float = 13.08
WEATHER_LON: float = 80.27