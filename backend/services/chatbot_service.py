# backend/services/chatbot_service.py
"""
AI Chatbot service using Mistral AI.
Exact port of build_farm_context(), check_agriculture_topic(),
get_mistral_response(), process_chat_message() from app.py
— no prompt, classification, or restriction changes.
"""

import time
import requests
from services.constants import MISTRAL_API_KEY, MISTRAL_MODEL, MISTRAL_URL


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


def build_farm_context(data: dict, crop_info: dict) -> str:
    """
    Build the system-level farm context prompt for the chatbot.
    Exact port of build_farm_context() from app.py — prompt unchanged.
    """
    return f"""You are Smart Agri AI, an expert agriculture assistant integrated into a real-time smart farm monitoring system.

Current live farm sensor data:
- Crop Category: {crop_info['crop']} | Variety: {crop_info['variety']} | Farm size: {crop_info['acres']} acres | Location: Tamil Nadu, India
- Planting Date: {crop_info['planting_date']} | Crop Age: {crop_info['crop_age_days']} days | Crop Stage: {data['crop_stage']}
- Estimated Harvest: {crop_info['estimated_harvest_date']} | Total Duration: {crop_info['total_duration']} days
- Soil Moisture: {data['moisture']} ({data['moisture_numeric']}%)
- Temperature: {data['temp']}°C | Humidity: {data['humidity']}%
- Rain History: {data['rain']} | Sunlight: {data['sunlight']}
- Pest Detection: {data['pest']} | Crop Health Score: {data['health']}/100
- Nitrogen (N): {data['n']}% | Phosphorus (P): {data['p']}% | Potassium (K): {data['k']}%
- Irrigation Status: {crop_info.get('irr_status', 'Unknown')} | Daily Water Req: {crop_info.get('daily_req_mm', '—')} mm/day

Use this real-time data to give precise, actionable farming advice.
Answer ONLY agriculture-related questions. Use bullet points or numbered steps when explaining processes.
Keep responses concise and practical."""


def check_agriculture_topic(question: str) -> bool:
    """
    Classify whether a question is agriculture-related using Mistral.
    Exact port of check_agriculture_topic() from app.py — classifier prompt unchanged.
    """
    try:
        time.sleep(0.5)
        classify_prompt = f"""You are a strict topic classifier. Reply with EXACTLY one word: YES or NO.
Is the following question related to agriculture, farming, crops, soil, fertilizers, irrigation, plant diseases, livestock, pests, weather for farming, or any farm-related topic?
Question: {question}
Reply only YES or NO."""
        result = call_mistral([{"role": "user", "content": classify_prompt}])
        return result.strip().upper().startswith("YES")
    except Exception:
        return True  # default to True on error — same as app.py


def get_mistral_response(
    user_question: str,
    data: dict,
    crop_info: dict,
    conversation_history: list[dict],
) -> str:
    """
    Generate a Mistral AI response in the context of the current farm.
    Exact port of get_mistral_response() from app.py — no logic changes.

    Parameters
    ----------
    conversation_history : List of {"role": ..., "content": ...} dicts
                           from the ongoing conversation session.
    """
    try:
        time.sleep(0.5)
        system_msg = {
            "role":    "system",
            "content": build_farm_context(data, crop_info),
        }
        ack_msg = {
            "role":    "assistant",
            "content": "Understood! I am Smart Agri AI with access to your live farm data. "
                       "I will provide accurate, data-driven agricultural advice based on your real-time sensor readings.",
        }
        messages = [system_msg, ack_msg] + conversation_history + [
            {"role": "user", "content": user_question}
        ]
        return call_mistral(messages)
    except Exception as e:
        return f"⚠️ AI response error: {e}. Please check your API key and try again."


def process_chat_message(
    user_input: str,
    data: dict,
    crop_info: dict,
    conversation_history: list[dict],
) -> tuple[str, bool]:
    """
    Process a user chat message: classify topic, generate response.
    Exact port of process_chat_message() from app.py — rejection message unchanged.

    Returns
    -------
    (reply: str, is_agri: bool)
    """
    is_agri = check_agriculture_topic(user_input)

    if not is_agri:
        rejection = (
            "❌ I can only answer agriculture-related questions.\n\n"
            "Try asking about:\n"
            "• 🌱 Crops & planting techniques\n"
            "• 🪱 Soil health & fertilizers\n"
            "• 💧 Irrigation & water management\n"
            "• 🐛 Pest control & plant diseases\n"
            "• 🌾 Harvesting & post-harvest storage\n"
            "• 🌡️ Temperature & weather impact on crops"
        )
        return rejection, False

    reply = get_mistral_response(user_input, data, crop_info, conversation_history)
    return reply, True