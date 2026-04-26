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
    items = LabWork.query.order_by(LabWork.id).all()
    return jsonify([serialize(lw) for lw in items])


@lab_works_bp.post('/')
@jwt_required()
def create():
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
    lw = LabWork.query.get_or_404(item_id)
    db.session.delete(lw)
    db.session.commit()
    return jsonify(message='Deleted'), 200
