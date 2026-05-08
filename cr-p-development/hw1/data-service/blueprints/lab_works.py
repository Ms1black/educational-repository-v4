from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import LabWork

lab_works_bp = Blueprint('lab_works', __name__)

VALID_STATUSES = ('Not Started', 'In Progress', 'Completed')


def serialize(lw):
    return {
        'id': lw.id,
        'title': lw.title,
        'description': lw.description,
        'category': lw.category,
        'status': lw.status,
        'due_date': lw.due_date,
        'created_at': lw.created_at.isoformat() if lw.created_at else None,
    }


@lab_works_bp.get('/')
@jwt_required()
def get_all():
    """
    Получить список всех лабораторных работ
    ---
    tags:
      - Lab Works
    security:
      - Bearer: []
    responses:
      200:
        description: Список лабораторных работ
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
                example: 1
              title:
                type: string
                example: Haptic Feedback Calibration
              description:
                type: string
                example: Calibration of haptic sensors
              category:
                type: string
                example: Neural Haptics
              status:
                type: string
                example: In Progress
              due_date:
                type: string
                example: "2025-12-31"
              created_at:
                type: string
                example: "2025-05-08T10:00:00"
      401:
        description: Отсутствует или недействителен JWT-токен
    """
    items = LabWork.query.order_by(LabWork.id).all()
    return jsonify([serialize(lw) for lw in items])


@lab_works_bp.post('/')
@jwt_required()
def create():
    """
    Создать новую лабораторную работу
    ---
    tags:
      - Lab Works
    security:
      - Bearer: []
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - title
            - description
            - category
          properties:
            title:
              type: string
              example: Haptic Feedback Calibration
            description:
              type: string
              example: Calibration of haptic sensors using neural feedback
            category:
              type: string
              enum:
                - Neural Haptics
                - Kinetic Logic
                - Fluid Dynamics
                - Autonomous Flight
                - Bio-Cybernetics
                - Soft Robotics
              example: Neural Haptics
            status:
              type: string
              enum:
                - Not Started
                - In Progress
                - Completed
              example: Not Started
            due_date:
              type: string
              example: "2025-12-31"
    responses:
      201:
        description: Лабораторная работа создана
        schema:
          type: object
          properties:
            id:
              type: integer
              example: 1
            title:
              type: string
              example: Haptic Feedback Calibration
            description:
              type: string
              example: Calibration of haptic sensors
            category:
              type: string
              example: Neural Haptics
            status:
              type: string
              example: Not Started
            due_date:
              type: string
              example: "2025-12-31"
            created_at:
              type: string
              example: "2025-05-08T10:00:00"
      400:
        description: Не переданы обязательные поля или неверный статус
      401:
        description: Отсутствует или недействителен JWT-токен
    """
    data = request.get_json(silent=True) or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    category = data.get('category', '').strip()
    status = data.get('status', 'Not Started')
    due_date = data.get('due_date') or None

    if not title or not description or not category:
        return jsonify(error='Title, description and category are required'), 400
    if status not in VALID_STATUSES:
        return jsonify(error='Invalid status'), 400

    lw = LabWork(title=title, description=description, category=category,
                 status=status, due_date=due_date)
    db.session.add(lw)
    db.session.commit()
    return jsonify(serialize(lw)), 201


@lab_works_bp.delete('/<int:item_id>')
@jwt_required()
def delete(item_id):
    """
    Удалить лабораторную работу по ID
    ---
    tags:
      - Lab Works
    security:
      - Bearer: []
    parameters:
      - in: path
        name: item_id
        type: integer
        required: true
        description: ID лабораторной работы
        example: 1
    responses:
      200:
        description: Лабораторная работа удалена
        schema:
          type: object
          properties:
            message:
              type: string
              example: Deleted
      401:
        description: Отсутствует или недействителен JWT-токен
      404:
        description: Лабораторная работа не найдена
    """
    lw = LabWork.query.get_or_404(item_id)
    db.session.delete(lw)
    db.session.commit()
    return jsonify(message='Deleted'), 200
