"""
Run this script ONCE locally after doing 'notebooklm login'
It will print the NOTEBOOKLM_AUTH_JSON value you need to set on Railway.

Steps:
  1. pip install notebooklm-py[browser]
  2. notebooklm login          (opens browser, log in with Google)
  3. python export_auth.py     (copy the output)
  4. Paste it in Railway as the NOTEBOOKLM_AUTH_JSON env variable
"""

import json
from pathlib import Path

# Try new path first, then fall back to legacy
candidates = [
    Path.home() / ".notebooklm" / "profiles" / "default" / "storage_state.json",
    Path.home() / ".notebooklm" / "storage_state.json",
]

storage_file = None
for c in candidates:
    if c.exists():
        storage_file = c
        break

if not storage_file:
    print("❌ No auth file found. Did you run 'notebooklm login' first?")
    raise SystemExit(1)

raw = storage_file.read_text(encoding="utf-8")

# Validate it's real JSON
try:
    parsed = json.loads(raw)
    cookie_count = len(parsed.get("cookies", []))
except json.JSONDecodeError:
    print("❌ Auth file is not valid JSON. Try logging in again.")
    raise SystemExit(1)

print(f"✅ Found auth file: {storage_file}")
print(f"✅ Contains {cookie_count} cookies\n")
print("=" * 60)
print("Copy everything between the dashes and set it as the")
print("NOTEBOOKLM_AUTH_JSON environment variable on Railway:")
print("=" * 60)
print(raw)
print("=" * 60)
