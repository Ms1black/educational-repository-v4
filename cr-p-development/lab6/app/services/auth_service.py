import re
from datetime import datetime
from typing import Dict, Optional, Union

from werkzeug.security import check_password_hash, generate_password_hash

from ..models.entities import User
from ..models.repositories import UsersRepository
from .errors import ServiceError


class AuthService:
    @staticmethod
    def _verify_password(password_hash: str, password: str) -> bool:
        try:
            return check_password_hash(password_hash, password)
        except (ValueError, TypeError):
            return False

    def __init__(self, users_repo: UsersRepository) -> None:
        self.users_repo = users_repo

    def _find_user(self, login: str) -> Optional[User]:
        for user in self.users_repo.get_all():
            if user.login == login:
                return user
        return None

    def get_role(self, login: str) -> Optional[str]:
        user = self._find_user(login)
        return user.role if user else None

    def register(self, login: str, password: str) -> None:
        if not re.fullmatch(r"[a-zA-Z0-9_]{3,20}", login):
            raise ServiceError("Логин: 3-20 символов, латиница, цифры, _.", 422)
        if len(password) < 6:
            raise ServiceError("Пароль должен содержать минимум 6 символов.", 422)

        users = self.users_repo.get_all()
        for user in users:
            if user.login == login:
                raise ServiceError("Пользователь с таким логином уже существует.", 409)

        admin_exists = any(user.role == "admin" for user in users)
        role = "admin" if login == "admin" and not admin_exists else "user"
        users.append(
            User(
                login=login,
                password_hash=generate_password_hash(password, method="pbkdf2:sha256"),
                role=role,
                created_at=datetime.now().isoformat(),
            )
        )
        self.users_repo.save_all(users)

    def login(self, login: str, password: str) -> Dict[str, Union[str, bool]]:
        user = self._find_user(login)
        if not user or not self._verify_password(user.password_hash, password):
            raise ServiceError("Неверный логин или пароль.", 401)

        return {"user": user.login, "role": user.role, "isAdmin": user.role == "admin"}

    def require_admin(self, login: Optional[str]) -> str:
        if not login:
            raise ServiceError("Требуется авторизация.", 401)

        user = self._find_user(login)
        if not user:
            raise ServiceError("Пользователь не найден.", 401)
        if user.role != "admin":
            raise ServiceError("Недостаточно прав (требуется admin).", 403)
        return user.login
