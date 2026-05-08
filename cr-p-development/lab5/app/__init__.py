import os
from pathlib import Path

from flask import Flask

from .controllers.api_controller import api_bp
from .controllers.page_controller import pages_bp


def create_app() -> Flask:
    base_dir = Path(__file__).resolve().parent.parent
    app = Flask(
        __name__,
        static_folder=str(base_dir),
        static_url_path="",
        template_folder=str(base_dir / "templates"),
    )

    app.config["BASE_DIR"] = base_dir
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "lab5-dev-secret")

    app.register_blueprint(api_bp)
    app.register_blueprint(pages_bp)

    return app
