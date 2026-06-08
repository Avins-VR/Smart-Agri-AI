# backend/services/crop_stage_service.py
"""
Crop age and lifecycle stage calculations.
Exact port of calculate_crop_age_and_stage() and get_stage_for_age()
from app.py — no logic changes.
"""

from datetime import date, timedelta
from services.constants import VARIETY_LIFECYCLE


def calculate_crop_age_and_stage(
    planting_date: date,
    crop: str,
    variety: str,
) -> dict:
    """
    Calculate crop age in days and determine the current growth stage.
    Exact port of calculate_crop_age_and_stage() from app.py — no logic changes.

    Parameters
    ----------
    planting_date : datetime.date object of planting / seeding date.
    crop          : Crop category string (unused in calculation, kept for parity).
    variety       : Crop variety string — must exist in VARIETY_LIFECYCLE.

    Returns
    -------
    dict with keys:
        crop_age_days, crop_stage, days_in_current_stage,
        days_to_next_stage, next_stage, total_duration,
        estimated_harvest_date, stage_progress_pct, lifecycle
    """
    today         = date.today()
    crop_age_days = max(0, (today - planting_date).days)

    if variety not in VARIETY_LIFECYCLE:
        raise ValueError(f"Lifecycle not defined for variety: {variety}")

    lifecycle      = VARIETY_LIFECYCLE[variety]
    stages         = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"]
    total_duration = sum(lifecycle.values())
    estimated_harvest_date = planting_date + timedelta(days=total_duration)

    elapsed               = 0
    current_stage         = "Harvest"
    days_in_current_stage = 0
    days_to_next_stage    = 0
    next_stage            = "—"

    for i, stage in enumerate(stages):
        stage_dur = lifecycle[stage]
        if crop_age_days < elapsed + stage_dur:
            current_stage         = stage
            days_in_current_stage = crop_age_days - elapsed
            days_to_next_stage    = stage_dur - days_in_current_stage
            next_stage            = stages[i + 1] if i + 1 < len(stages) else "—"
            break
        elapsed += stage_dur
    else:
        # Crop has passed all stages — it's in Harvest
        current_stage         = "Harvest"
        days_in_current_stage = crop_age_days - (total_duration - lifecycle["Harvest"])
        days_to_next_stage    = 0
        next_stage            = "—"

    stage_dur          = lifecycle.get(current_stage, 1)
    stage_progress_pct = min(100.0, (days_in_current_stage / stage_dur) * 100)

    return {
        "crop_age_days":          crop_age_days,
        "crop_stage":             current_stage,
        "days_in_current_stage":  days_in_current_stage,
        "days_to_next_stage":     days_to_next_stage,
        "next_stage":             next_stage,
        "total_duration":         total_duration,
        "estimated_harvest_date": str(estimated_harvest_date),
        "stage_progress_pct":     stage_progress_pct,
        "lifecycle":              lifecycle,
    }


def get_stage_for_age(
    planting_date: date,
    variety: str,
    offset_days: int = 0,
) -> str:
    """
    Return the growth stage for a given offset from planting date.
    Exact port of get_stage_for_age() from app.py — no logic changes.
    """
    sim_date = planting_date + timedelta(days=offset_days)
    age      = max(0, (sim_date - planting_date).days)

    if variety not in VARIETY_LIFECYCLE:
        raise ValueError(f"Lifecycle not defined for variety: {variety}")

    lifecycle = VARIETY_LIFECYCLE[variety]
    stages    = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"]
    elapsed   = 0

    for stage in stages:
        if age < elapsed + lifecycle[stage]:
            return stage
        elapsed += lifecycle[stage]

    return "Harvest"