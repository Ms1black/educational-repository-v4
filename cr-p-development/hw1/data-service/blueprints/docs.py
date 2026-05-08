from flask import Blueprint, jsonify, make_response

docs_bp = Blueprint('docs', __name__)

DOCS_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TIAR Data Service — API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/api/data/openapi.json",
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
        "title": "TIAR Data Service",
        "version": "1.0.0",
        "description": "Микросервис данных — управление лабораторными работами и категориями.",
    },
    "components": {
        "securitySchemes": {
            "Bearer": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "JWT-токен из /api/auth/login",
            }
        }
    },
    "security": [{"Bearer": []}],
    "paths": {
        "/lab-works/": {
            "get": {
                "summary": "Получить список всех лабораторных работ",
                "tags": ["Lab Works"],
                "security": [{"Bearer": []}],
                "responses": {
                    "200": {
                        "description": "Список лабораторных работ",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "id": {"type": "integer", "example": 1},
                                            "title": {"type": "string", "example": "Haptic Feedback Calibration"},
                                            "description": {"type": "string", "example": "Calibration of haptic sensors"},
                                            "category": {"type": "string", "example": "Neural Haptics"},
                                            "status": {"type": "string", "example": "In Progress"},
                                            "due_date": {"type": "string", "example": "2025-12-31"},
                                            "created_at": {"type": "string", "example": "2025-05-08T10:00:00"},
                                        },
                                    },
                                }
                            }
                        },
                    },
                    "401": {"description": "Отсутствует или недействителен JWT-токен"},
                },
            },
            "post": {
                "summary": "Создать новую лабораторную работу",
                "tags": ["Lab Works"],
                "security": [{"Bearer": []}],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["title", "description", "category"],
                                "properties": {
                                    "title": {"type": "string", "example": "Haptic Feedback Calibration"},
                                    "description": {"type": "string", "example": "Calibration of haptic sensors"},
                                    "category": {
                                        "type": "string",
                                        "enum": ["Neural Haptics", "Kinetic Logic", "Fluid Dynamics", "Autonomous Flight", "Bio-Cybernetics", "Soft Robotics"],
                                        "example": "Neural Haptics",
                                    },
                                    "status": {
                                        "type": "string",
                                        "enum": ["Not Started", "In Progress", "Completed"],
                                        "example": "Not Started",
                                    },
                                    "due_date": {"type": "string", "example": "2025-12-31"},
                                },
                            }
                        }
                    },
                },
                "responses": {
                    "201": {"description": "Лабораторная работа создана"},
                    "400": {"description": "Не переданы обязательные поля или неверный статус"},
                    "401": {"description": "Отсутствует или недействителен JWT-токен"},
                },
            },
        },
        "/lab-works/{id}": {
            "delete": {
                "summary": "Удалить лабораторную работу по ID",
                "tags": ["Lab Works"],
                "security": [{"Bearer": []}],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": True,
                        "schema": {"type": "integer"},
                        "example": 1,
                    }
                ],
                "responses": {
                    "200": {"description": "Лабораторная работа удалена"},
                    "401": {"description": "Отсутствует или недействителен JWT-токен"},
                    "404": {"description": "Лабораторная работа не найдена"},
                },
            }
        },
        "/categories/": {
            "get": {
                "summary": "Получить список категорий и статусов",
                "tags": ["Categories"],
                "security": [{"Bearer": []}],
                "responses": {
                    "200": {
                        "description": "Списки категорий и статусов",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "categories": {"type": "array", "items": {"type": "string"}},
                                        "statuses": {"type": "array", "items": {"type": "string"}},
                                    },
                                }
                            }
                        },
                    },
                    "401": {"description": "Отсутствует или недействителен JWT-токен"},
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
