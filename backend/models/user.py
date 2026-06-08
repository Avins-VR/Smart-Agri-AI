# backend/models/user.py
"""
User model — thin layer between raw MongoDB documents and the application.
Responsible for:
  • Building the document that is inserted into the 'users' collection
  • Serialising a stored document to a safe public dict (no password hash)
"""

from datetime import datetime, timezone

# ── Helpers ──────────────────────────────────────────────────────────────────

def build_user_document(
    full_name: str,
    email: str,
    phone: str,
    password_hash: str,
) -> dict:
    """
    Return a ready-to-insert MongoDB document for a new user.

    Parameters
    ----------
    full_name     : Validated full name string.
    email         : Normalised (lowercase) email address.
    phone         : Validated phone number string.
    password_hash : Werkzeug-hashed password.

    Returns
    -------
    dict  MongoDB document (without _id — Mongo adds it on insert).
    """
    return {
        "full_name":    full_name.strip(),
        "email":        email.lower().strip(),
        "phone":        phone.strip(),
        "password":     password_hash,
        "role":         "farmer",           # default role
        "is_active":    True,
        "created_at":   datetime.now(timezone.utc),
        "updated_at":   datetime.now(timezone.utc),
    }


def serialize_user(user: dict) -> dict:
    """
    Convert a raw MongoDB user document to a JSON-safe public dict.
    Removes the password hash and converts ObjectId / datetime fields.

    Parameters
    ----------
    user : Raw document returned by PyMongo (contains _id, password, …).

    Returns
    -------
    dict  Safe representation suitable for API responses.
    """
    return {
        "id":         str(user["_id"]),
        "full_name":  user.get("full_name", ""),
        "email":      user.get("email", ""),
        "phone":      user.get("phone", ""),
        "role":       user.get("role", "farmer"),
        "is_active":  user.get("is_active", True),
        "created_at": user["created_at"].isoformat() if isinstance(user.get("created_at"), datetime) else None,
    }