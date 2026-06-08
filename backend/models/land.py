from datetime import datetime, timezone

# ══════════════════════════════════════════════════════════════════════════════
# LAND MODEL  (new)
# ══════════════════════════════════════════════════════════════════════════════

def build_land_document(
    user_id: str,
    name: str,
    location: str,
    crop: str,
    soil: str,
    acres: float,
    farming_type: str,
    planting_date: str,
) -> dict:
    """
    Build a ready-to-insert MongoDB document for a new land entry.

    Parameters
    ----------
    user_id       : String representation of the owning user's _id.
    name          : Land display name (e.g. "North Field").
    location      : Village / district / state string.
    crop          : Crop category (e.g. "Rice").
    soil          : Soil type (e.g. "Clay").
    acres         : Farm size in acres (float).
    farming_type  : Farming method (e.g. "Organic").
    planting_date : ISO date string "YYYY-MM-DD".

    MongoDB collection : "lands"
    """
    return {
        "user_id":      user_id,
        "name":         name.strip(),
        "location":     location.strip(),
        "crop":         crop.strip(),
        "soil":         soil.strip(),
        "acres":        float(acres),
        "farming_type": farming_type.strip(),
        "planting_date": planting_date,        # stored as plain string "YYYY-MM-DD"
        "created_at":   datetime.now(timezone.utc),
        "updated_at":   datetime.now(timezone.utc),
    }


def serialize_land(land: dict) -> dict:
    """
    Convert a raw MongoDB land document to a JSON-safe dict.
    Maps MongoDB field names to the exact keys expected by Home.jsx / Dashboard.jsx.

    Home.jsx uses  : id, name, crop, soil, location, acres, farmingType,
                     plantingDate, configured, createdAt
    Streamlit uses : land_id, name, crop, soil, location, acres,
                     farming_type, planting_date
    """
    return {
        # ── identifiers ──────────────────────────────────────────────────────
        "id": str(land.get("_id", "")),
        "user_id":      land.get("user_id", ""),

        # ── core fields (React camelCase) ─────────────────────────────────────
        "name":         land.get("name", ""),
        "location":     land.get("location", ""),
        "crop":         land.get("crop", ""),
        "soil":         land.get("soil", ""),
        "acres":        land.get("acres", 0),
        "farmingType":  land.get("farming_type", ""),
        "plantingDate": land.get("planting_date", ""),

        # ── flag expected by Home.jsx LandCard ───────────────────────────────
        "configured":   True,

        # ── timestamps ───────────────────────────────────────────────────────
        "createdAt": (
            land.get("created_at").isoformat()
            if isinstance(land.get("created_at"), datetime)
            else None
        ),
        "updatedAt": (
            land.get("updated_at").isoformat()
            if isinstance(land.get("updated_at"), datetime)
            else None
        ),
    }