from pathlib import Path
from typing import Any

from .entities import Lab, User
from ..utils.json_store import ensure_json_file, read_json, write_json


DEFAULT_LABS = {
    "labs": [
        {
            "id": 1,
            "number": 1,
            "title": "[H-01] Humanoid Systems",
            "theme": "Верстка и структура сайта",
            "year": "2025-2026",
            "url": "humanoid",
            "image": "img/dept-humanoid.png",
        },
        {
            "id": 2,
            "number": 2,
            "title": "[B-02] Bio-Cybernetics Lab",
            "theme": "Формы и валидация",
            "year": "2024-2025",
            "url": "#",
            "image": "img/dept-bio-cybernetics.png",
        },
        {
            "id": 3,
            "number": 3,
            "title": "[A-03] Autonomous Flight",
            "theme": "Интерполяция методом МНК",
            "year": "2024-2025",
            "url": "#",
            "image": "img/dept-flight.png",
        },
        {
            "id": 4,
            "number": 4,
            "title": "[S-04] Soft Robotics",
            "theme": "Авторизация, сессии, AJAX",
            "year": "2022-2023",
            "url": "#",
            "image": "img/dept-soft-robotics.png",
        },
    ]
}


class UsersRepository:
    def __init__(self, path: Path) -> None:
        self.path = path
        ensure_json_file(self.path, {"users": []})

    def get_all(self) -> list[User]:
        payload = read_json(self.path, {"users": []})
        return [User.from_dict(item) for item in payload.get("users", [])]

    def save_all(self, users: list[User]) -> None:
        write_json(self.path, {"users": [item.to_dict() for item in users]})


class RecordsRepository:
    def __init__(self, path: Path) -> None:
        self.path = path
        ensure_json_file(self.path, {"records": []})

    def get_all(self) -> list[dict[str, Any]]:
        payload = read_json(self.path, {"records": []})
        records = payload.get("records", [])
        return records if isinstance(records, list) else []

    def save_all(self, records: list[dict[str, Any]]) -> None:
        write_json(self.path, {"records": records})


class LabsRepository:
    def __init__(self, path: Path) -> None:
        self.path = path
        ensure_json_file(self.path, DEFAULT_LABS)

    def get_all(self) -> list[Lab]:
        payload = read_json(self.path, {"labs": []})
        return [Lab.from_dict(item) for item in payload.get("labs", [])]

    def save_all(self, labs: list[Lab]) -> None:
        write_json(self.path, {"labs": [item.to_dict() for item in labs]})
