from datetime import datetime
from typing import Optional, Union

from ..models.repositories import RecordsRepository
from .errors import ServiceError


class RecordsService:
    def __init__(self, records_repo: RecordsRepository) -> None:
        self.records_repo = records_repo

    def list_records(self) -> list[dict]:
        return self.records_repo.get_all()

    def add_record(
        self,
        *,
        title: str,
        category: str,
        value: Optional[Union[str, float, int]],
        note: str,
        author: str,
    ) -> None:
        title = title.strip()
        category = category.strip()
        note = note.strip()

        if len(title) < 2 or len(title) > 60:
            raise ServiceError("Название: от 2 до 60 символов.", 422)
        if len(category) < 2 or len(category) > 30:
            raise ServiceError("Категория: от 2 до 30 символов.", 422)

        try:
            value_num = float(value)  # type: ignore[arg-type]
        except (TypeError, ValueError):
            raise ServiceError("Значение: число от 0 до 1000.", 422) from None

        if value_num < 0 or value_num > 1000:
            raise ServiceError("Значение: число от 0 до 1000.", 422)
        if len(note) > 120:
            raise ServiceError("Комментарий: не более 120 символов.", 422)

        records = self.records_repo.get_all()
        next_id = max((int(item.get("id", 0)) for item in records), default=0) + 1
        records.append(
            {
                "id": next_id,
                "title": title,
                "category": category,
                "value": value_num,
                "note": note,
                "author": author,
                "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }
        )
        self.records_repo.save_all(records)
