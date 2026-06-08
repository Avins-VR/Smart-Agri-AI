# backend/services/advisory_service.py
"""
AI Advisory generation service using Mistral AI.
Exact port of build_advisory_prompt(), parse_advisory_sections(),
generate_ai_advisory() from app.py — no prompt or logic changes.
"""

from services.constants import MISTRAL_API_KEY, MISTRAL_MODEL, MISTRAL_URL
import requests


# ── Mistral API call (mirrors call_mistral from app.py) ───────────────────────
def call_mistral(messages: list[dict]) -> str:
    """
    Call Mistral AI chat completions endpoint.
    Exact port of call_mistral() from app.py — no changes.
    """
    hdrs = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type":  "application/json",
    }
    payload  = {"model": MISTRAL_MODEL, "messages": messages}
    response = requests.post(MISTRAL_URL, headers=hdrs, json=payload, timeout=60)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def build_advisory_prompt(
    data: dict,
    crop_info: dict,
    pest_confidence: float = 0.0,
) -> str:
    """
    Build the advisory generation prompt.
    Exact port of build_advisory_prompt() from app.py — prompt unchanged.
    """
    return f"""
You are Smart Agri AI Advisor.

Analyze the realtime farm intelligence data and generate a short professional agriculture advisory.

REALTIME FARM DATA:

CROP:
- Crop: {crop_info['crop']}
- Variety: {crop_info['variety']}
- Farm Size: {crop_info['acres']} acres
- Crop Age: {crop_info['crop_age_days']} days
- Crop Stage: {data['crop_stage']}
- Estimated Harvest: {crop_info['estimated_harvest_date']}

WEATHER:
- Temperature: {data['temp']}°C
- Humidity: {data['humidity']}%
- Rain Status: {data['rain']}
- Sunlight Level: {data['sunlight']}

SOIL & HEALTH:
- Soil Moisture: {data['moisture_numeric']}%
- Moisture Status: {data['moisture']}
- Crop Health Score: {data['health']}/100

PEST ANALYSIS:
- Pest Detection: {data['pest']}
- Pest Model Result: {data['pest_prediction']}
- Pest Confidence: {pest_confidence}%

NPK ANALYSIS:
- Nitrogen (N): {data['n']}%
- Phosphorus (P): {data['p']}%
- Potassium (K): {data['k']}%

IRRIGATION:
- Irrigation Status: {crop_info.get('irr_status', 'Unknown')}
- Daily Water Requirement: {crop_info.get('daily_req_mm', '—')} mm/day

TASK:

Generate EXACTLY these sections:

[IRRIGATION]
2-line irrigation advice based on moisture, rain, humidity, and temperature.

[FERTILIZER]
2-line fertilizer recommendation based on NPK values and crop stage.

[PEST & DISEASE]
2-line pest prevention or treatment recommendation based on pest model result.

[SOIL HEALTH]
2-line soil condition analysis using moisture and health score.

[WEEKLY ACTION]
2-line weekly farming action plan for this crop stage.

[YIELD INSIGHT]
2-line yield improvement suggestion based on overall realtime analysis.

RULES:
- Keep each section under 2 lines
- No bullet points
- Farmer-friendly language
- Give actionable advice
- Mention risks if detected
- Mention irrigation timing if needed
"""


def parse_advisory_sections(raw_text: str) -> list[dict]:
    """
    Parse Mistral advisory response into structured sections.
    Exact port of parse_advisory_sections() from app.py — no logic changes.
    """
    section_meta = {
        "IRRIGATION":    {"icon": "💧",  "display": "Irrigation Advisory"},
        "FERTILIZER":    {"icon": "🌿",  "display": "Fertilizer Recommendation"},
        "PEST & DISEASE":{"icon": "🐛",  "display": "Pest & Disease Management"},
        "SOIL HEALTH":   {"icon": "🌱",  "display": "Soil Health Analysis"},
        "WEEKLY ACTION": {"icon": "📋",  "display": "Weekly Action Plan"},
        "YIELD INSIGHT": {"icon": "📈",  "display": "Yield Optimization Insight"},
    }

    sections      = []
    current_key   = None
    current_lines: list[str] = []

    for line in raw_text.splitlines():
        stripped = line.strip()

        if stripped.startswith("[") and stripped.endswith("]"):
            if current_key and current_lines:
                meta = section_meta.get(
                    current_key,
                    {"icon": "📌", "display": current_key.title()}
                )
                sections.append({
                    "icon":  meta["icon"],
                    "title": meta["display"],
                    "body":  "\n".join(current_lines).strip(),
                })
            current_key   = stripped[1:-1].strip()
            current_lines = []

        elif current_key and stripped:
            current_lines.append(stripped)

    # Flush last section
    if current_key and current_lines:
        meta = section_meta.get(
            current_key,
            {"icon": "📌", "display": current_key.title()}
        )
        sections.append({
            "icon":  meta["icon"],
            "title": meta["display"],
            "body":  "\n".join(current_lines).strip(),
        })

    return sections


def generate_ai_advisory(
    data: dict,
    crop_info: dict,
    pest_confidence: float = 0.0,
) -> list[dict]:
    """
    Generate AI advisory sections using Mistral.
    Exact port of generate_ai_advisory() from app.py — no logic changes.
    """
    prompt = build_advisory_prompt(data, crop_info, pest_confidence)
    try:
        raw_text = call_mistral([{"role": "user", "content": prompt}])
        sections = parse_advisory_sections(raw_text)
        if not sections:
            return [{"icon": "🧠", "title": "AI Advisory", "body": raw_text.strip()}]
        return sections
    except Exception as exc:
        return [{
            "icon":  "⚠️",
            "title": "Advisory Unavailable",
            "body":  f"Could not fetch AI advisory.\nError: {exc}",
        }]