from pathlib import Path
from typing import Any

from ..utils.json_store import ensure_json_file, read_json, write_json

DEFAULT_HUMANOID = {"icon": "bi-flower2", "rows": []}


class HumanoidService:
    def __init__(self, data_file: Path) -> None:
        self.data_file = data_file
        ensure_json_file(self.data_file, DEFAULT_HUMANOID)

    def load(self) -> dict[str, Any]:
        return read_json(self.data_file, DEFAULT_HUMANOID)

    def add_row(self, title: str, description: str) -> None:
        title = title.strip()
        description = description.strip()
        if not title and not description:
            return

        payload = self.load()
        rows = payload.get("rows", [])
        if not isinstance(rows, list):
            rows = []
        rows.append({"title": title, "description": description})
        payload["rows"] = rows
        write_json(self.data_file, payload)
