from flask import Blueprint, jsonify, make_response

docs_bp = Blueprint('docs', __name__)

DOCS_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TIAR Auth Service — API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/api/auth/openapi.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis],
    });
  </script>
</body>
</html>"""

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "TIAR Auth Service",
        "version": "1.0.0",
        "description": "Микросервис авторизации — регистрация и вход пользователей, выдача JWT-токенов.",
    },
    "paths": {
        "/register": {
            "post": {
                "summary": "Регистрация нового пользователя",
                "tags": ["Auth"],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["username", "password"],
                                "properties": {
                                    "username": {"type": "string", "example": "john_doe"},
                                    "password": {"type": "string", "example": "secret123"},
                                },
                            }
                        }
                    },
                },
                "responses": {
                    "201": {
                        "description": "Пользователь зарегистрирован",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {"message": {"type": "string", "example": "Registered successfully"}},
                                }
                            }
                        },
                    },
                    "400": {"description": "Не передан username или password"},
                    "409": {"description": "Пользователь с таким именем уже существует"},
                },
            }
        },
        "/login": {
            "post": {
                "summary": "Вход пользователя",
                "tags": ["Auth"],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["username", "password"],
                                "properties": {
                                    "username": {"type": "string", "example": "john_doe"},
                                    "password": {"type": "string", "example": "secret123"},
                                },
                            }
                        }
                    },
                },
                "responses": {
                    "200": {
                        "description": "Успешный вход, возвращает JWT-токен",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "token": {"type": "string", "example": "eyJhbGciOiJIUzI1NiJ9..."},
                                        "username": {"type": "string", "example": "john_doe"},
                                    },
                                }
                            }
                        },
                    },
                    "401": {"description": "Неверный логин или пароль"},
                },
            }
        },
    },
}


@docs_bp.get('/docs')
def swagger_ui():
    return make_response(DOCS_HTML, 200, {'Content-Type': 'text/html'})


@docs_bp.get('/openapi.json')
def openapi_spec():
    return jsonify(OPENAPI_SPEC)
