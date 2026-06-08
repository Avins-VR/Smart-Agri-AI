# backend/routes/lands.py
"""
Land management routes for Smart Agri AI.

All routes are protected: a valid JWT must be present in the
Authorization header as  "Bearer <token>".

Endpoints
---------
POST   /api/lands                — Create a new land entry
GET    /api/lands                — List all lands for the current user
GET    /api/lands/<land_id>      — Get a single land by its MongoDB _id
PUT    /api/lands/<land_id>      — Update a land entry
DELETE /api/lands/<land_id>      — Delete a land entry
"""

import os
import re
import jwt

from datetime import datetime, timezone
from functools import wraps

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from config import get_config

from db import get_db
from models.land import build_land_document, serialize_land

lands_bp = Blueprint("lands", __name__, url_prefix="/api/lands")


# ── Allowed field values (mirrors Home.jsx constants exactly) ─────────────────

_CROP_TYPES = {
    "Wheat", "Rice", "Maize", "Cotton",
    "Sugarcane", "Tomato", "Paddy", "Other",
}

_SOIL_TYPES = {
    "Clay", "Sandy", "Loamy", "Silt",
    "Peaty", "Saline", "Other",
}

_FARMING_TYPES = {
    "Conventional", "Organic", "Precision",
    "Hydroponic", "Greenhouse", "Mixed",
    "Sustainable", "Biodynamic",
}

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


# ══════════════════════════════════════════════════════════════════════════════
# JWT AUTH DECORATOR
# ══════════════════════════════════════════════════════════════════════════════

def jwt_required(f):
    """
    Decorator that validates the Bearer JWT from the Authorization header.
    On success it sets  g.user_id  to the authenticated user's string ID.
    On failure it returns a 401 JSON response immediately.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header: str = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Missing or malformed Authorization header.",
            }), 401

        token = auth_header.split(" ", 1)[1].strip()

        try:
            cfg = get_config()
            secret = cfg.SECRET_KEY
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            g.user_id = payload["sub"]          # string _id stored in JWT
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired. Please log in again."}), 401
        except Exception:
            return jsonify({"success": False, "message": "Invalid token. Please log in again."}), 401

        return f(*args, **kwargs)
    return wrapper


# ══════════════════════════════════════════════════════════════════════════════
# VALIDATION
# ══════════════════════════════════════════════════════════════════════════════

def _validate_land_payload(data: dict, partial: bool = False) -> dict[str, str]:
    """
    Validate land fields.

    Parameters
    ----------
    data    : Request JSON dict.
    partial : If True (PUT), skip required-field checks for missing keys.
              Only validate fields that ARE present in the payload.

    Returns
    -------
    dict  { field_name: error_message }  — empty dict means valid.
    """
    errors: dict[str, str] = {}

    def check(field, validator):
        """Run validator only when field is present, or required (not partial)."""
        if field in data:
            msg = validator(data[field])
            if msg:
                errors[field] = msg
        elif not partial:
            errors[field] = f"{field} is required."

    # ── name ─────────────────────────────────────────────────────────────────
    check("name", lambda v: (
        "Land name is required."         if not str(v).strip() else
        "Land name must not exceed 100 characters." if len(str(v).strip()) > 100 else ""
    ))

    # ── location ─────────────────────────────────────────────────────────────
    check("location", lambda v: (
        "Location is required."          if not str(v).strip() else
        "Location must not exceed 200 characters." if len(str(v).strip()) > 200 else ""
    ))

    # ── crop ─────────────────────────────────────────────────────────────────
    check("crop", lambda v: (
        "Crop type is required."         if not v else
        f"Invalid crop type. Choose from: {', '.join(sorted(_CROP_TYPES))}."
        if v not in _CROP_TYPES else ""
    ))

    # ── soil ─────────────────────────────────────────────────────────────────
    check("soil", lambda v: (
        "Soil type is required."         if not v else
        f"Invalid soil type. Choose from: {', '.join(sorted(_SOIL_TYPES))}."
        if v not in _SOIL_TYPES else ""
    ))

    # ── acres ─────────────────────────────────────────────────────────────────
    def _check_acres(v):
        try:
            val = float(v)
        except (TypeError, ValueError):
            return "Farm size must be a valid number."
        if val <= 0:
            return "Farm size must be greater than 0."
        if val > 100_000:
            return "Farm size seems unrealistically large (max 100,000 acres)."
        return ""
    check("acres", _check_acres)

    # ── farmingType ──────────────────────────────────────────────────────────
    check("farmingType", lambda v: (
        "Farming type is required."      if not v else
        f"Invalid farming type. Choose from: {', '.join(sorted(_FARMING_TYPES))}."
        if v not in _FARMING_TYPES else ""
    ))

    # ── plantingDate ─────────────────────────────────────────────────────────
    check("plantingDate", lambda v: (
        "Planting date is required."     if not v else
        "Planting date must be in YYYY-MM-DD format."
        if not _DATE_RE.match(str(v)) else ""
    ))

    return errors


# ══════════════════════════════════════════════════════════════════════════════
# HELPER — resolve a land_id string to a verified MongoDB document
# ══════════════════════════════════════════════════════════════════════════════

def _get_land_or_404(land_id: str, user_id: str):
    """
    Fetch a land document that belongs to user_id.

    Returns
    -------
    (land_doc, None)  on success
    (None, response)  with a ready Flask error response if not found / wrong owner
    """
    try:
        oid = ObjectId(land_id)
    except InvalidId:
        return None, (
            jsonify({"success": False, "message": "Invalid land ID format."}), 400
        )

    db   = get_db()
    land = db["lands"].find_one({"_id": oid})

    if land is None:
        return None, (
            jsonify({"success": False, "message": "Land not found."}), 404
        )

    # Ownership check — users can only access their own lands
    if land.get("user_id") != user_id:
        return None, (
            jsonify({"success": False, "message": "Access denied. This land does not belong to you."}), 403
        )

    return land, None


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/lands  — Create a new land
# ══════════════════════════════════════════════════════════════════════════════

@lands_bp.route("", methods=["POST"])
@jwt_required
def create_land():
    """
    Create a new land entry for the authenticated user.

    Request body (JSON)
    -------------------
    {
        "name":         "North Field",
        "location":     "Chennai, Tamil Nadu",
        "crop":         "Rice",
        "soil":         "Clay",
        "acres":        23.5,
        "farmingType":  "Organic",
        "plantingDate": "2026-05-11"
    }

    Success — 201
    -------------
    { "success": true, "message": "...", "land": { ... } }

    Errors
    ------
    400  Validation errors
    500  Database error
    """
    data: dict = request.get_json(silent=True) or {}

    # 1. Validate all fields (full validation, not partial)
    errors = _validate_land_payload(data, partial=False)
    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed. Please correct the errors below.",
            "errors":  errors,
        }), 400

    # 2. Build document
    land_doc = build_land_document(
        user_id      = g.user_id,
        name         = data["name"],
        location     = data["location"],
        crop         = data["crop"],
        soil         = data["soil"],
        acres        = float(data["acres"]),
        farming_type = data["farmingType"],
        planting_date= data["plantingDate"],
    )

    # 3. Insert
    try:
        db     = get_db()
        result = db["lands"].insert_one(land_doc)
    except PyMongoError as exc:
        return jsonify({
            "success": False,
            "message": f"Database error while creating land: {exc}",
        }), 500

    # 4. Return created document
    created = db["lands"].find_one({"_id": result.inserted_id})
    return jsonify({
        "success": True,
        "message": "Land created successfully.",
        "land":    serialize_land(created),
    }), 201


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/lands  — List all lands for the current user
# ══════════════════════════════════════════════════════════════════════════════

@lands_bp.route("", methods=["GET"])
@jwt_required
def get_lands():
    """
    Return all land entries owned by the authenticated user.
    Results are sorted by created_at descending (newest first).

    Success — 200
    -------------
    {
        "success": true,
        "count":   2,
        "lands":   [ { ... }, { ... } ]
    }
    """
    try:
        db    = get_db()
        lands = list(
            db["lands"]
            .find({"user_id": g.user_id})
            .sort("created_at", -1)          # newest first
        )
    except PyMongoError as exc:
        return jsonify({
            "success": False,
            "message": f"Database error while fetching lands: {exc}",
        }), 500

    return jsonify({
        "success": True,
        "count":   len(lands),
        "lands":   [serialize_land(l) for l in lands],
    }), 200


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/lands/<land_id>  — Get a single land
# ══════════════════════════════════════════════════════════════════════════════

@lands_bp.route("/<land_id>", methods=["GET"])
def get_land(land_id: str):

    try:
        oid = ObjectId(land_id)
    except InvalidId:
        return jsonify({
            "success": False,
            "message": "Invalid land ID format."
        }), 400

    db = get_db()

    land = db["lands"].find_one({"_id": oid})

    if not land:
        return jsonify({
            "success": False,
            "message": "Land not found."
        }), 404

    return jsonify({
        "success": True,
        "land": serialize_land(land)
    }), 200


# ══════════════════════════════════════════════════════════════════════════════
# PUT /api/lands/<land_id>  — Update a land entry
# ══════════════════════════════════════════════════════════════════════════════

@lands_bp.route("/<land_id>", methods=["PUT"])
@jwt_required
def update_land(land_id: str):
    """
    Update one or more fields of a land entry.
    Only the fields included in the request body will be updated
    (partial / PATCH-style semantics on a PUT route).

    Request body (JSON) — all fields optional
    -----------------------------------------
    {
        "name":         "South Field",
        "location":     "Coimbatore",
        "crop":         "Cotton",
        "soil":         "Loamy",
        "acres":        45,
        "farmingType":  "Conventional",
        "plantingDate": "2026-03-01"
    }

    Success — 200
    -------------
    { "success": true, "message": "...", "land": { ... } }

    Errors
    ------
    400  Validation errors / invalid ID
    403  Ownership mismatch
    404  Land not found
    500  Database error
    """
    # 1. Verify land exists and belongs to caller
    land, err = _get_land_or_404(land_id, g.user_id)
    if err:
        return err

    data: dict = request.get_json(silent=True) or {}
    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is empty. Provide at least one field to update.",
        }), 400

    # 2. Validate only the fields present in the payload (partial=True)
    errors = _validate_land_payload(data, partial=True)
    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed. Please correct the errors below.",
            "errors":  errors,
        }), 400

    # 3. Build the $set payload — only touched fields
    #    Map React camelCase keys → MongoDB snake_case field names
    field_map = {
        "name":         "name",
        "location":     "location",
        "crop":         "crop",
        "soil":         "soil",
        "acres":        "acres",
        "farmingType":  "farming_type",
        "plantingDate": "planting_date",
    }

    update_fields: dict = {}
    for react_key, mongo_key in field_map.items():
        if react_key in data:
            value = data[react_key]
            # Coerce acres to float
            update_fields[mongo_key] = float(value) if react_key == "acres" else value

    if not update_fields:
        return jsonify({
            "success": False,
            "message": "No recognised fields provided for update.",
        }), 400

    update_fields["updated_at"] = datetime.now(timezone.utc)

    # 4. Persist
    try:
        db = get_db()
        db["lands"].update_one(
            {"_id": land["_id"]},
            {"$set": update_fields},
        )
    except PyMongoError as exc:
        return jsonify({
            "success": False,
            "message": f"Database error while updating land: {exc}",
        }), 500

    # 5. Return updated document
    updated = db["lands"].find_one({"_id": land["_id"]})
    return jsonify({
        "success": True,
        "message": "Land updated successfully.",
        "land":    serialize_land(updated),
    }), 200


# ══════════════════════════════════════════════════════════════════════════════
# DELETE /api/lands/<land_id>  — Delete a land entry
# ══════════════════════════════════════════════════════════════════════════════

@lands_bp.route("/<land_id>", methods=["DELETE"])
@jwt_required
def delete_land(land_id: str):
    """
    Permanently delete a land entry.
    The land must belong to the authenticated user.

    Success — 200
    -------------
    { "success": true, "message": "Land deleted successfully.", "deleted_id": "..." }

    Errors
    ------
    400  Invalid ObjectId format
    403  Ownership mismatch
    404  Land not found
    500  Database error
    """
    # 1. Verify existence and ownership
    land, err = _get_land_or_404(land_id, g.user_id)
    if err:
        return err

    # 2. Delete
    try:
        db = get_db()
        db["lands"].delete_one({"_id": land["_id"]})
    except PyMongoError as exc:
        return jsonify({
            "success": False,
            "message": f"Database error while deleting land: {exc}",
        }), 500

    return jsonify({
        "success":    True,
        "message":    "Land deleted successfully.",
        "deleted_id": str(land["_id"]),
    }), 200