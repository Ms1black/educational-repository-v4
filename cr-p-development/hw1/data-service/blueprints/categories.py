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
    return jsonify(categories=CATEGORIES, statuses=STATUSES)
