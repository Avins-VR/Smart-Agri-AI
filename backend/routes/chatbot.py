# backend/routes/chatbot.py
"""
AI Chatbot endpoint.

Endpoints
---------
POST /api/chatbot/message   — Send a message and receive a Mistral AI reply
"""

from flask import Blueprint, request, jsonify
from routes.lands import jwt_required
from services.chatbot_service import process_chat_message

chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/api/chatbot")


@chatbot_bp.route("/message", methods=["POST"])
@jwt_required
def chat_message():
    """
    Process a chatbot message with agriculture topic filtering.

    Request JSON
    ------------
    {
        "message": "How much water does my Rice crop need today?",
        "live_data": { ... },     // same shape as /api/advisory/generate
        "crop_info": { ... },     // same shape as /api/advisory/generate
        "conversation_history": [  // ongoing Mistral conversation
            { "role": "user",      "content": "..." },
            { "role": "assistant", "content": "..." }
        ]
    }

    Response 200
    ------------
    {
        "success":    true,
        "reply":      "Based on your current moisture of 54%...",
        "is_agri":    true,
        "updated_history": [
            { "role": "user",      "content": "..." },
            { "role": "assistant", "content": "..." }
        ]
    }
    """
    body = request.get_json(silent=True) or {}

    message              = body.get("message", "").strip()
    live_data            = body.get("live_data")
    crop_info            = body.get("crop_info")
    conversation_history = body.get("conversation_history", [])

    if not message:
        return jsonify({"success": False, "message": "Field 'message' is required."}), 400

    if not live_data or not crop_info:
        return jsonify({
            "success": False,
            "message": "Both 'live_data' and 'crop_info' are required.",
        }), 400

    try:
        reply, is_agri = process_chat_message(
            user_input           = message,
            data                 = live_data,
            crop_info            = crop_info,
            conversation_history = conversation_history,
        )

        # Append new exchange to history only for agri messages
        updated_history = list(conversation_history)
        if is_agri:
            updated_history.append({"role": "user",      "content": message})
            updated_history.append({"role": "assistant", "content": reply})

        return jsonify({
            "success":          True,
            "reply":            reply,
            "is_agri":          is_agri,
            "updated_history":  updated_history,
        }), 200

    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500