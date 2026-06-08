# backend/routes/auth.py
"""
Authentication routes for Smart Agri AI.

Endpoints
---------
POST /api/auth/register   — Create a new user account.  (existing — unchanged)
POST /api/auth/login      — Authenticate and return a JWT. (new)
"""

import re
import os
import jwt
import datetime

from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.errors import DuplicateKeyError

from db import get_db
from models.user import build_user_document, serialize_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ── Shared validation helpers ─────────────────────────────────────────────────

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_PHONE_RE = re.compile(r"^\+?[\d\s\-\(\)]{7,15}$")


# ═════════════════════════════════════════════════════════════════════════════
# REGISTER  (existing — no changes made)
# ═════════════════════════════════════════════════════════════════════════════

def _validate_registration_payload(data: dict) -> dict[str, str]:
    errors: dict[str, str] = {}

    name: str = (data.get("full_name") or "").strip()
    if not name:
        errors["full_name"] = "Full name is required."
    elif len(name.split()) < 2:
        errors["full_name"] = "Please enter your first and last name."
    elif len(name) > 100:
        errors["full_name"] = "Full name must not exceed 100 characters."

    email: str = (data.get("email") or "").strip().lower()
    if not email:
        errors["email"] = "Email address is required."
    elif not _EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."
    elif len(email) > 254:
        errors["email"] = "Email address is too long."

    phone: str = (data.get("phone") or "").strip()
    if not phone:
        errors["phone"] = "Phone number is required."
    elif not _PHONE_RE.match(phone):
        errors["phone"] = "Enter a valid phone number (7–15 digits)."

    password: str = data.get("password") or ""
    if not password:
        errors["password"] = "Password is required."
    elif len(password) < 8:
        errors["password"] = "Password must be at least 8 characters."
    elif not re.search(r"[A-Z]", password):
        errors["password"] = "Password must include at least one uppercase letter."
    elif not re.search(r"[0-9]", password):
        errors["password"] = "Password must include at least one number."

    confirm: str = data.get("confirm_password") or ""
    if not confirm:
        errors["confirm_password"] = "Please confirm your password."
    elif confirm != password and "password" not in errors:
        errors["confirm_password"] = "Passwords do not match."

    return errors


@auth_bp.route("/register", methods=["POST"])
def register():
    data: dict = request.get_json(silent=True) or {}
    errors = _validate_registration_payload(data)
    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed. Please correct the errors below.",
            "errors":  errors,
        }), 400

    full_name = data["full_name"].strip()
    email     = data["email"].strip().lower()
    phone     = data["phone"].strip()
    password  = data["password"]

    db = get_db()

    if db["users"].find_one({"email": email}):
        return jsonify({
            "success": False,
            "message": "An account with this email address already exists.",
            "errors":  {"email": "Email is already registered."},
        }), 409

    password_hash = generate_password_hash(password, method="pbkdf2:sha256", salt_length=16)
    user_doc = build_user_document(full_name, email, phone, password_hash)

    try:
        result = db["users"].insert_one(user_doc)
    except DuplicateKeyError:
        return jsonify({
            "success": False,
            "message": "An account with this email address already exists.",
            "errors":  {"email": "Email is already registered."},
        }), 409
    except Exception:
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again later.",
        }), 500

    created_user = db["users"].find_one({"_id": result.inserted_id})
    return jsonify({
        "success": True,
        "message": "Account created successfully. Welcome to Smart Agri AI!",
        "user":    serialize_user(created_user),
    }), 201


# ═════════════════════════════════════════════════════════════════════════════
# LOGIN  (new)
# ═════════════════════════════════════════════════════════════════════════════

def _validate_login_payload(data: dict) -> dict[str, str]:
    """
    Lightweight validation for the login payload.
    We intentionally keep error messages vague for security —
    we never confirm whether an email exists or not.
    """
    errors: dict[str, str] = {}

    email: str = (data.get("email") or "").strip().lower()
    if not email:
        errors["email"] = "Email address is required."
    elif not _EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."

    password: str = data.get("password") or ""
    if not password:
        errors["password"] = "Password is required."
    elif len(password) < 8:
        # Mirrors the frontend minimum; avoids unnecessary DB hits
        errors["password"] = "Password must be at least 8 characters."

    return errors


def _build_jwt(user: dict, remember_me: bool) -> str:
    """
    Build a signed JWT for the authenticated user.

    Expiry
    ------
    remember_me = False  →  8 hours  (standard session)
    remember_me = True   →  30 days  (matches "Keep me signed in" checkbox)
    """
    secret  = os.getenv("SECRET_KEY", "fallback-secret")
    hours   = 24 * 30 if remember_me else 8
    expiry  = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=hours)

    payload = {
        "sub":         str(user["_id"]),          # subject = user id
        "email":       user["email"],
        "full_name":   user.get("full_name", ""),
        "role":        user.get("role", "farmer"),
        "remember_me": remember_me,
        "iat":         datetime.datetime.now(datetime.timezone.utc),  # issued at
        "exp":         expiry,                    # expiry
    }
    return jwt.encode(payload, secret, algorithm="HS256")


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate an existing Smart Agri AI user.

    Request body (JSON)
    -------------------
    {
        "email":       "jane@farm.com",
        "password":    "SecurePass1",
        "remember_me": true          // optional — maps to the checkbox
    }

    Success response — 200
    ----------------------
    {
        "success":  true,
        "message":  "Login successful. Welcome back!",
        "token":    "<JWT>",
        "user":     { id, full_name, email, phone, role, is_active, created_at }
    }

    Error responses
    ---------------
    400  Missing / malformed fields  { "success": false, "errors": { ... } }
    401  Wrong credentials           { "success": false, "message": "..." }
    403  Account deactivated         { "success": false, "message": "..." }
    500  Server error                { "success": false, "message": "..." }
    """

    # ── 1. Parse body ─────────────────────────────────────────────────────────
    data: dict = request.get_json(silent=True) or {}

    # ── 2. Field-level validation ─────────────────────────────────────────────
    errors = _validate_login_payload(data)
    if errors:
        return jsonify({
            "success": False,
            "message": "Please correct the errors below.",
            "errors":  errors,
        }), 400

    email:       str  = data["email"].strip().lower()
    password:    str  = data["password"]
    remember_me: bool = bool(data.get("remember_me", False))

    # ── 3. Database lookup ────────────────────────────────────────────────────
    try:
        db   = get_db()
        user = db["users"].find_one({"email": email})
    except Exception:
        return jsonify({
            "success": False,
            "message": "A database error occurred. Please try again later.",
        }), 500

    # ── 4. Credential verification ────────────────────────────────────────────
    # Use the SAME generic message whether the email doesn't exist OR the
    # password is wrong — this prevents user enumeration attacks.
    if user is None or not check_password_hash(user.get("password", ""), password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password. Please try again.",
            "errors":  {
                "email":    "Invalid email or password.",
                "password": "Invalid email or password.",
            },
        }), 401

    # ── 5. Account status check ───────────────────────────────────────────────
    if not user.get("is_active", True):
        return jsonify({
            "success": False,
            "message": "Your account has been deactivated. Please contact support.",
        }), 403

    # ── 6. Update last_login timestamp ───────────────────────────────────────
    try:
        db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.datetime.now(datetime.timezone.utc)}},
        )
    except Exception:
        # Non-critical — don't fail the login if the timestamp update fails
        pass

    # ── 7. Issue JWT ──────────────────────────────────────────────────────────
    token = _build_jwt(user, remember_me)

    # ── 8. Return success ─────────────────────────────────────────────────────
    return jsonify({
        "success":     True,
        "message":     "Login successful. Welcome back!",
        "token":       token,
        "remember_me": remember_me,
        "user":        serialize_user(user),
    }), 200