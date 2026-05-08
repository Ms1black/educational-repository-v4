from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

categories_bp = Blueprint('categories', __name__)

CATEGORIES = [
    'Neural Haptics',
    'Kinetic Logic',
    'Fluid Dynamics',
    'Autonomous Flight',
    'Bio-Cybernetics',
    'Soft Robotics',
]

STATUSES = ['Not Started', 'In Progress', 'Completed']


@categories_bp.get('/')
@jwt_required()
def get_categories():
    """
    Получить список категорий и статусов
    ---
    tags:
      - Categories
    security:
      - Bearer: []
    responses:
      200:
        description: Списки категорий и статусов
        schema:
          type: object
          properties:
            categories:
              type: array
              items:
                type: string
              example:
                - Neural Haptics
                - Kinetic Logic
                - Fluid Dynamics
                - Autonomous Flight
                - Bio-Cybernetics
                - Soft Robotics
            statuses:
              type: array
              items:
                type: string
              example:
                - Not Started
                - In Progress
                - Completed
      401:
        description: Отсутствует или недействителен JWT-токен
    """
    return jsonify(categories=CATEGORIES, statuses=STATUSES)
