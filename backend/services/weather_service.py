# backend/services/weather_service.py
"""
Weather data fetching from Open-Meteo API.
Exact port of get_weather_data(), get_past_7day_temperature(),
get_rain_history_14days() from app.py — no logic changes.
"""

import time
import requests
from datetime import datetime, timedelta
from services.constants import WEATHER_LAT, WEATHER_LON


def get_weather_data() -> dict:
    """
    Fetch current weather from Open-Meteo.
    Exact port of get_weather_data() from app.py — no logic changes.

    Returns
    -------
    dict with keys: temp, humidity, rain, sunlight
    Raises RuntimeError on failure.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={WEATHER_LAT}&longitude={WEATHER_LON}"
        f"&hourly=temperature_2m,relativehumidity_2m,precipitation,shortwave_radiation"
        f"&timezone=Asia/Kolkata"
    )
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    hourly = resp.json()["hourly"]
    idx    = -1   # last available hour — same as app.py

    return {
        "temp":     round(float(hourly["temperature_2m"][idx]), 1),
        "humidity": int(hourly["relativehumidity_2m"][idx]),
        "rain":     "Yes" if hourly["precipitation"][idx] > 0 else "No",
        "sunlight": "Low" if hourly["shortwave_radiation"][idx] < 200 else (
            "Moderate" if hourly["shortwave_radiation"][idx] <= 600 else "High"),
    }


def get_past_7day_temperature() -> list[dict]:
    """
    Fetch max daily temperature for last 7 days from Open-Meteo.
    Exact port of get_past_7day_temperature() from app.py — no logic changes.

    Returns
    -------
    list of {"date": "DD Mon", "temp": float} dicts.
    Raises RuntimeError after 3 failed attempts.
    """
    end_date   = datetime.now().date()
    start_date = end_date - timedelta(days=6)

    for attempt in range(3):
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={WEATHER_LAT}&longitude={WEATHER_LON}"
                f"&daily=temperature_2m_max"
                f"&start_date={start_date}&end_date={end_date}"
                f"&timezone=auto"
            )
            resp  = requests.get(url, timeout=15)
            resp.raise_for_status()
            d     = resp.json()
            dates = d["daily"]["time"]
            temps = d["daily"]["temperature_2m_max"]

            if not dates or any(t is None for t in temps):
                raise ValueError("Incomplete daily temperature data")

            return [
                {
                    "date": datetime.strptime(dt, "%Y-%m-%d").strftime("%d %b"),
                    "temp": t,
                }
                for dt, t in zip(dates, temps)
            ]
        except Exception:
            time.sleep(1)

    raise RuntimeError("Failed to fetch 7-day temperature after 3 attempts")


def get_rain_history_14days() -> list[dict]:
    """
    Fetch daily precipitation sum for last 14 days from Open-Meteo.
    Exact port of get_rain_history_14days() from app.py — no logic changes.

    Returns
    -------
    list of {"date": "DD Mon", "rain_mm": float, "event": str} dicts.
    Raises RuntimeError after 3 failed attempts.
    """
    end_date   = datetime.now().date()
    start_date = end_date - timedelta(days=13)

    for attempt in range(3):
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={WEATHER_LAT}&longitude={WEATHER_LON}"
                f"&daily=precipitation_sum"
                f"&start_date={start_date}&end_date={end_date}"
                f"&timezone=auto"
            )
            resp   = requests.get(url, timeout=15)
            resp.raise_for_status()
            daily  = resp.json().get("daily", {})
            dates  = daily.get("time", [])
            precip = daily.get("precipitation_sum", [])

            if not dates:
                raise ValueError("Empty daily precipitation data")

            records = []
            for d, mm in zip(dates, precip):
                mm_val = round(float(mm), 1) if mm is not None else 0.0
                records.append({
                    "date":     datetime.strptime(d, "%Y-%m-%d").strftime("%d %b"),
                    "rain_mm":  mm_val,
                    "event":    "Rain" if mm_val > 0 else "Clear",
                })
            return records

        except Exception:
            time.sleep(1)

    raise RuntimeError("Failed to fetch 14-day rain history after 3 attempts")