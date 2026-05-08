from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/register')
def register():
    """
    Регистрация нового пользователя
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              example: john_doe
            password:
              type: string
              example: secret123
    responses:
      201:
        description: Пользователь успешно зарегистрирован
        schema:
          type: object
          properties:
            message:
              type: string
              example: Registered successfully
      400:
        description: Не передан username или password
      409:
        description: Пользователь с таким именем уже существует
    """
    data = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify(error='Username and password are required'), 400

    if User.query.filter_by(username=username).first():
        return jsonify(error='Username already taken'), 409

    user = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return jsonify(message='Registered successfully'), 201


@auth_bp.post('/login')
def login():
    """
    Вход пользователя
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              example: john_doe
            password:
              type: string
              example: secret123
    responses:
      200:
        description: Успешный вход, возвращает JWT-токен
        schema:
          type: object
          properties:
            token:
              type: string
              example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
            username:
              type: string
              example: john_doe
      401:
        description: Неверный логин или пароль
    """
    data = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify(error='Invalid username or password'), 401

    token = create_access_token(identity=str(user.id))
    return jsonify(token=token, username=username)
