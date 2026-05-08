from pathlib import Path
from typing import Any

from flask import Blueprint, current_app, jsonify, request, session

from ..models.repositories import LabsRepository, RecordsRepository, UsersRepository
from ..services.auth_service import AuthService
from ..services.errors import ServiceError
from ..services.labs_service import LabsService
from ..services.records_service import RecordsService

api_bp = Blueprint("api", __name__)


def _base_dir() -> Path:
    return Path(current_app.config["BASE_DIR"])


def _get_input_data() -> dict[str, Any]:
    if request.method == "GET":
        return {}

    if request.is_json:
        payload = request.get_json(silent=True)
        return payload if isinstance(payload, dict) else {}

    return request.form.to_dict()


def _require_auth() -> str:
    user = session.get("user")
    if not user:
        raise ServiceError("Требуется авторизация.", 401)
    return str(user)


def _respond_ok(payload: dict[str, Any], status: int = 200):
    data = {"ok": True}
    data.update(payload)
    return jsonify(data), status


def _respond_error(error: ServiceError):
    return jsonify({"ok": False, "error": error.message}), error.status_code


def _build_services() -> tuple[AuthService, RecordsService, LabsService]:
    base = _base_dir()
    users_repo = UsersRepository(base / "storage" / "users.json")
    records_repo = RecordsRepository(base / "storage" / "records.json")
    labs_repo = LabsRepository(base / "storage" / "labs.json")
    return (
        AuthService(users_repo),
        RecordsService(records_repo),
        LabsService(labs_repo, base / "img"),
    )


def _status_response(auth_service: AuthService):
    user = session.get("user")
    role = auth_service.get_role(str(user)) if user else None
    return _respond_ok(
        {
            "authorized": bool(user),
            "user": user,
            "role": role,
            "isAdmin": role == "admin",
        }
    )


@api_bp.route("/openapi.json", methods=["GET"])
def openapi_spec():
    return jsonify(
        {
            "openapi": "3.0.3",
            "info": {
                "title": "Lab5 API",
                "version": "1.0.0",
                "description": "API for auth, records, and labs management. Includes legacy action-based endpoint and explicit REST-style routes.",
            },
            "paths": {
                "/api/status": {
                    "get": {"summary": "Session status", "responses": {"200": {"description": "Auth status"}}}
                },
                "/api/register": {
                    "post": {"summary": "Register user", "responses": {"200": {"description": "Registration result"}}}
                },
                "/api/login": {
                    "post": {"summary": "Login", "responses": {"200": {"description": "Login result"}}}
                },
                "/api/logout": {
                    "post": {"summary": "Logout", "responses": {"200": {"description": "Logout result"}}}
                },
                "/api/records": {
                    "get": {"summary": "List records", "responses": {"200": {"description": "Records list"}}},
                    "post": {"summary": "Add record", "responses": {"200": {"description": "Record add result"}}},
                },
                "/api/labs": {
                    "get": {"summary": "List labs (admin)", "responses": {"200": {"description": "Labs list"}}},
                    "post": {"summary": "Add lab (multipart, admin)", "responses": {"200": {"description": "Labs list after add"}}},
                },
                "/api/labs/public": {
                    "get": {"summary": "List public labs", "responses": {"200": {"description": "Public labs list"}}}
                },
                "/api/labs/{id}": {
                    "delete": {
                        "summary": "Delete lab (admin)",
                        "parameters": [
                            {
                                "name": "id",
                                "in": "path",
                                "required": True,
                                "schema": {"type": "integer"},
                            }
                        ],
                        "responses": {"200": {"description": "Labs list after delete"}},
                    }
                },
                "/api": {
                    "get": {
                        "summary": "GET actions",
                        "description": "Runs action from query param. Supported: status, records_list, labs_list, labs_public.",
                        "parameters": [
                            {
                                "name": "action",
                                "in": "query",
                                "required": True,
                                "schema": {"type": "string"},
                                "example": "status",
                            }
                        ],
                        "responses": {"200": {"description": "OK response envelope"}},
                    },
                    "post": {
                        "summary": "POST actions",
                        "description": "Runs action from JSON/form body. Supported: register, login, logout, records_add, labs_add, labs_delete.",
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "action": {"type": "string"},
                                            "login": {"type": "string"},
                                            "password": {"type": "string"},
                                            "title": {"type": "string"},
                                            "category": {"type": "string"},
                                            "value": {"type": "number"},
                                            "note": {"type": "string"},
                                            "number": {"type": "integer"},
                                            "theme": {"type": "string"},
                                            "year": {"type": "string"},
                                            "url": {"type": "string"},
                                            "id": {"type": "integer"},
                                        },
                                        "required": ["action"],
                                    },
                                    "examples": {
                                        "register": {
                                            "value": {
                                                "action": "register",
                                                "login": "new_user",
                                                "password": "123456",
                                            }
                                        },
                                        "login": {
                                            "value": {
                                                "action": "login",
                                                "login": "admin",
                                                "password": "123456",
                                            }
                                        },
                                    },
                                },
                                "multipart/form-data": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "action": {"type": "string", "example": "labs_add"},
                                            "number": {"type": "integer"},
                                            "title": {"type": "string"},
                                            "theme": {"type": "string"},
                                            "year": {"type": "string"},
                                            "url": {"type": "string"},
                                            "imageFile": {"type": "string", "format": "binary"},
                                        },
                                        "required": ["action"],
                                    }
                                },
                            },
                        },
                        "responses": {"200": {"description": "OK response envelope"}},
                    },
                }
            },
        }
    )


@api_bp.route("/api/status", methods=["GET"])
def api_status():
    auth_service, _, _ = _build_services()
    try:
        return _status_response(auth_service)
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/register", methods=["POST"])
def api_register():
    auth_service, _, _ = _build_services()
    payload = _get_input_data()
    try:
        auth_service.register(str(payload.get("login", "")).strip(), str(payload.get("password", "")))
        return _respond_ok({"message": "Регистрация успешна."})
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/login", methods=["POST"])
def api_login():
    auth_service, _, _ = _build_services()
    payload = _get_input_data()
    try:
        login_data = auth_service.login(str(payload.get("login", "")).strip(), str(payload.get("password", "")))
        session.clear()
        session["user"] = login_data["user"]
        return _respond_ok(login_data)
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/logout", methods=["POST"])
def api_logout():
    try:
        session.clear()
        return _respond_ok({})
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/records", methods=["GET"])
def api_records_list():
    _, records_service, _ = _build_services()
    try:
        user = _require_auth()
        return _respond_ok({"user": user, "records": records_service.list_records()})
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/records", methods=["POST"])
def api_records_add():
    _, records_service, _ = _build_services()
    payload = _get_input_data()
    try:
        user = _require_auth()
        records_service.add_record(
            title=str(payload.get("title", "")),
            category=str(payload.get("category", "")),
            value=payload.get("value"),
            note=str(payload.get("note", "")),
            author=user,
        )
        return _respond_ok({"message": "Запись добавлена."})
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/labs", methods=["GET"])
def api_labs_list():
    auth_service, _, labs_service = _build_services()
    try:
        user = auth_service.require_admin(session.get("user"))
        return _respond_ok({"user": user, "labs": labs_service.list_labs()})
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/labs/public", methods=["GET"])
def api_labs_public():
    _, _, labs_service = _build_services()
    try:
        return _respond_ok({"labs": labs_service.list_labs()})
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/labs", methods=["POST"])
def api_labs_add():
    auth_service, _, labs_service = _build_services()
    payload = _get_input_data()
    try:
        auth_service.require_admin(session.get("user"))
        labs = labs_service.add_lab(
            number=request.form.get("number", payload.get("number")),
            title=request.form.get("title", payload.get("title", "")),
            theme=request.form.get("theme", payload.get("theme", "")),
            year=request.form.get("year", payload.get("year", "")),
            url=request.form.get("url", payload.get("url", "")),
            image_file=request.files.get("imageFile"),
        )
        return _respond_ok({"labs": labs})
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api/labs/<int:lab_id>", methods=["DELETE"])
def api_labs_delete(lab_id: int):
    auth_service, _, labs_service = _build_services()
    try:
        auth_service.require_admin(session.get("user"))
        labs = labs_service.delete_lab(lab_id)
        return _respond_ok({"labs": labs})
    except ServiceError as error:
        return _respond_error(error)


@api_bp.route("/api", methods=["GET", "POST"])
@api_bp.route("/api.php", methods=["GET", "POST"])
def api_handler():
    auth_service, records_service, labs_service = _build_services()

    payload = _get_input_data()
    action = request.args.get("action", "") if request.method == "GET" else payload.get("action", "")

    try:
        if action == "status":
            return _status_response(auth_service)

        if action == "register":
            if request.method != "POST":
                raise ServiceError("Метод не поддерживается.", 405)
            auth_service.register(str(payload.get("login", "")).strip(), str(payload.get("password", "")))
            return _respond_ok({"message": "Регистрация успешна."})

        if action == "login":
            if request.method != "POST":
                raise ServiceError("Метод не поддерживается.", 405)
            login_data = auth_service.login(str(payload.get("login", "")).strip(), str(payload.get("password", "")))
            session.clear()
            session["user"] = login_data["user"]
            return _respond_ok(login_data)

        if action == "logout":
            if request.method != "POST":
                raise ServiceError("Метод не поддерживается.", 405)
            session.clear()
            return _respond_ok({})

        if action == "records_list":
            user = _require_auth()
            return _respond_ok({"user": user, "records": records_service.list_records()})

        if action == "records_add":
            if request.method != "POST":
                raise ServiceError("Метод не поддерживается.", 405)
            user = _require_auth()
            records_service.add_record(
                title=str(payload.get("title", "")),
                category=str(payload.get("category", "")),
                value=payload.get("value"),
                note=str(payload.get("note", "")),
                author=user,
            )
            return _respond_ok({"message": "Запись добавлена."})

        if action == "labs_list":
            user = auth_service.require_admin(session.get("user"))
            return _respond_ok({"user": user, "labs": labs_service.list_labs()})

        if action == "labs_public":
            return _respond_ok({"labs": labs_service.list_labs()})

        if action == "labs_add":
            if request.method != "POST":
                raise ServiceError("Метод не поддерживается.", 405)
            auth_service.require_admin(session.get("user"))
            labs = labs_service.add_lab(
                number=request.form.get("number", payload.get("number")),
                title=request.form.get("title", payload.get("title", "")),
                theme=request.form.get("theme", payload.get("theme", "")),
                year=request.form.get("year", payload.get("year", "")),
                url=request.form.get("url", payload.get("url", "")),
                image_file=request.files.get("imageFile"),
            )
            return _respond_ok({"labs": labs})

        if action == "labs_delete":
            if request.method != "POST":
                raise ServiceError("Метод не поддерживается.", 405)
            auth_service.require_admin(session.get("user"))
            labs = labs_service.delete_lab(payload.get("id", request.form.get("id")))
            return _respond_ok({"labs": labs})

        raise ServiceError("Неизвестное действие API.", 404)
    except ServiceError as error:
        return _respond_error(error)
