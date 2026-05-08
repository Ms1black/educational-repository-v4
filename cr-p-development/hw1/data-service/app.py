import os
from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from extensions import db, jwt

SWAGGER_CONFIG = {
    'title': 'TIAR Data Service',
    'uiversion': 3,
    'version': '1.0.0',
    'description': 'Микросервис данных — управление лабораторными работами и категориями.',
    'securityDefinitions': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'Введите токен в формате: Bearer <token>',
        }
    },
}


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 'postgresql://tiar:tiar_secret@db:5432/tiar_db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'dev-secret-change-me')

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    Swagger(app, config=SWAGGER_CONFIG)

    from blueprints.lab_works import lab_works_bp
    from blueprints.categories import categories_bp
    app.register_blueprint(lab_works_bp, url_prefix='/lab-works')
    app.register_blueprint(categories_bp, url_prefix='/categories')

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    application = create_app()
    application.run(host='0.0.0.0', port=5001)
