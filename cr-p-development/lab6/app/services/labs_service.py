import re
import secrets
import time
from pathlib import Path
from typing import Any, Optional, Union

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from ..models.entities import Lab
from ..models.repositories import LabsRepository
from .errors import ServiceError


class LabsService:
    def __init__(self, labs_repo: LabsRepository, img_dir: Path) -> None:
        self.labs_repo = labs_repo
        self.img_dir = img_dir
        self.img_dir.mkdir(parents=True, exist_ok=True)

    def list_labs(self) -> list[dict[str, Any]]:
        return [lab.to_dict() for lab in self.labs_repo.get_all()]

    def add_lab(
        self,
        *,
        number: Optional[Union[str, int]],
        title: str,
        theme: str,
        year: str,
        url: str,
        image_file: Optional[FileStorage],
    ) -> list[dict[str, Any]]:
        number_value = self._validate_number(number)
        title = title.strip()
        theme = theme.strip()
        year = year.strip()
        url = url.strip()

        if len(title) < 3 or len(title) > 80:
            raise ServiceError("Название: от 3 до 80 символов.", 422)
        if len(theme) < 3 or len(theme) > 120:
            raise ServiceError("Тема: от 3 до 120 символов.", 422)
        if not re.fullmatch(r"\d{4}(-\d{4})?", year):
            raise ServiceError("Год: формат 2026 или 2025-2026.", 422)
        if url and not re.fullmatch(r"[a-zA-Z0-9_\-/.]+", url):
            raise ServiceError("Ссылка содержит недопустимые символы.", 422)

        image_path = self._save_image(image_file)
        labs = self.labs_repo.get_all()
        next_id = max((lab.id for lab in labs), default=0) + 1
        labs.append(
            Lab(
                id=next_id,
                number=number_value,
                title=title,
                theme=theme,
                year=year,
                url=url,
                image=image_path,
            )
        )
        labs.sort(key=lambda item: item.number)
        self.labs_repo.save_all(labs)
        return [lab.to_dict() for lab in labs]

    def delete_lab(self, lab_id: Optional[Union[str, int]]) -> list[dict[str, Any]]:
        try:
            lab_id_value = int(lab_id)  # type: ignore[arg-type]
        except (TypeError, ValueError):
            raise ServiceError("Некорректный id лабораторной.", 422) from None

        if lab_id_value < 1:
            raise ServiceError("Некорректный id лабораторной.", 422)

        labs = self.labs_repo.get_all()
        deleted_lab = next((item for item in labs if item.id == lab_id_value), None)
        if not deleted_lab:
            raise ServiceError("Лабораторная не найдена.", 404)

        updated = [item for item in labs if item.id != lab_id_value]
        self.labs_repo.save_all(updated)
        self._delete_image_if_needed(deleted_lab.image)
        return [lab.to_dict() for lab in updated]

    def _validate_number(self, number: Optional[Union[str, int]]) -> int:
        try:
            value = int(number)  # type: ignore[arg-type]
        except (TypeError, ValueError):
            raise ServiceError("Номер: целое число от 1 до 30.", 422) from None

        if value < 1 or value > 30:
            raise ServiceError("Номер: целое число от 1 до 30.", 422)
        return value

    def _save_image(self, image_file: Optional[FileStorage]) -> str:
        if image_file is None or image_file.filename is None or image_file.filename == "":
            raise ServiceError("Не удалось загрузить изображение.", 422)

        original_name = secure_filename(image_file.filename)
        ext = Path(original_name).suffix.lower().lstrip(".")
        allowed = {"png", "jpg", "jpeg", "webp", "gif"}
        if ext not in allowed:
            raise ServiceError("Допустимые форматы изображения: PNG/JPG/WEBP/GIF.", 422)

        image_file.stream.seek(0, 2)
        size = image_file.stream.tell()
        image_file.stream.seek(0)
        if size > 5 * 1024 * 1024:
            raise ServiceError("Файл изображения слишком большой (максимум 5MB).", 422)

        file_name = f"lab-{int(time.time())}-{secrets.token_hex(4)}.{ext}"
        target = self.img_dir / file_name
        image_file.save(target)
        return f"img/{file_name}"

    def _delete_image_if_needed(self, image: str) -> None:
        if not image.startswith("img/"):
            return
        path = self.img_dir.parent / image
        if path.exists() and path.is_file():
            path.unlink(missing_ok=True)
