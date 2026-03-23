"""
Promote an existing user to admin.

Usage:
    python promote_user_to_admin.py user@example.com
"""

from __future__ import annotations

import sys
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient

import os
from pathlib import Path


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")


def main() -> int:
    if len(sys.argv) != 2:
      print("Usage: python promote_user_to_admin.py user@example.com")
      return 1

    email = sys.argv[1].strip().lower()
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")

    if not mongo_url or not db_name:
      print("Missing MONGO_URL or DB_NAME in backend/.env")
      return 1

    client = MongoClient(mongo_url)

    try:
      db = client[db_name]
      result = db.users.update_one(
        {"email": email},
        {
          "$set": {
            "is_admin": True,
            "updated_at": datetime.now(timezone.utc).isoformat(),
          }
        },
      )

      if result.matched_count == 0:
        print(f"User not found: {email}")
        return 1

      print(f"Admin access granted to: {email}")
      return 0
    finally:
      client.close()


if __name__ == "__main__":
    raise SystemExit(main())
