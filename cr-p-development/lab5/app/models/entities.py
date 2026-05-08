from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class User:
    login: str
    password_hash: str
    role: str = "user"
    created_at: str = ""

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "User":
        return cls(
            login=str(payload.get("login", "")),
            password_hash=str(payload.get("passwordHash", "")),
            role=str(payload.get("role", "user")),
            created_at=str(payload.get("createdAt", "")),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "login": self.login,
            "passwordHash": self.password_hash,
            "role": self.role,
            "createdAt": self.created_at or datetime.now().isoformat(),
        }


@dataclass
class Record:
    id: int
    title: str
    category: str
    value: float
    note: str
    author: str
    created_at: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "value": self.value,
            "note": self.note,
            "author": self.author,
            "createdAt": self.created_at,
        }


@dataclass
class Lab:
    id: int
    number: int
    title: str
    theme: str
    year: str
    url: str
    image: str

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "Lab":
        return cls(
            id=int(payload.get("id", 0)),
            number=int(payload.get("number", 0)),
            title=str(payload.get("title", "")),
            theme=str(payload.get("theme", "")),
            year=str(payload.get("year", "")),
            url=str(payload.get("url", "")),
            image=str(payload.get("image", "")),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "number": self.number,
            "title": self.title,
            "theme": self.theme,
            "year": self.year,
            "url": self.url,
            "image": self.image,
        }
