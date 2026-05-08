import json
from pathlib import Path
from typing import Any

import fcntl


def ensure_json_file(path: Path, fallback: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        write_json(path, fallback)


def read_json(path: Path, fallback: dict[str, Any]) -> dict[str, Any]:
    if not path.exists():
        return fallback

    with path.open("r", encoding="utf-8") as file:
        fcntl.flock(file.fileno(), fcntl.LOCK_SH)
        raw = file.read()
        fcntl.flock(file.fileno(), fcntl.LOCK_UN)

    if not raw.strip():
        return fallback

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return fallback

    return payload if isinstance(payload, dict) else fallback


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        fcntl.flock(file.fileno(), fcntl.LOCK_EX)
        json.dump(payload, file, ensure_ascii=False, indent=2)
        file.flush()
        fcntl.flock(file.fileno(), fcntl.LOCK_UN)
