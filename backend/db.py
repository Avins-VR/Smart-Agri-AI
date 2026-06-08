# backend/db.py
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config import get_config

_client: MongoClient | None = None
_db: Database | None = None


def get_db() -> Database:
    """
    Return a singleton MongoDB database instance.
    Raises RuntimeError if the connection cannot be established.
    """
    global _client, _db

    if _db is not None:
        return _db

    cfg = get_config()
    try:
        _client = MongoClient(cfg.MONGO_URI, serverSelectionTimeoutMS=5000)
        # Ping to verify the connection is alive
        _client.admin.command("ping")
        _db = _client[cfg.DB_NAME]
        print(f"[DB] Connected to MongoDB — database: '{cfg.DB_NAME}'")
        _ensure_indexes(_db)
        return _db
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise RuntimeError(f"[DB] Could not connect to MongoDB: {exc}") from exc


def _ensure_indexes(db: Database) -> None:
    """Create indexes once at startup so lookups are always fast."""
    db["users"].create_index("email", unique=True)
    db["users"].create_index("phone")
    db["lands"].create_index("user_id")
    db["lands"].create_index("created_at")
    print("[DB] Indexes verified.")