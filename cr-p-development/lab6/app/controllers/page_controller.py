import json
from pathlib import Path

from flask import Blueprint, Response, current_app, redirect, render_template, request, send_from_directory, url_for

from ..services.humanoid_service import HumanoidService

pages_bp = Blueprint("pages", __name__)


def _base_dir() -> Path:
    return Path(current_app.config["BASE_DIR"])


@pages_bp.route("/")
def home():
    return send_from_directory(_base_dir(), "index.html")


@pages_bp.route("/admin.php")
def admin_page():
    return render_template("admin.html")


@pages_bp.route("/docs")
def docs_page():
    return render_template("docs.html")


@pages_bp.route("/humanoid", methods=["GET", "POST"])
@pages_bp.route("/humanoid.php", methods=["GET", "POST"])
def humanoid_page():
    service = HumanoidService(_base_dir() / "data" / "ghost-01.json")

    if request.method == "POST" and request.form.get("action") == "add":
        service.add_row(
            title=request.form.get("title", ""),
            description=request.form.get("description", ""),
        )
        return redirect(url_for("pages.humanoid_page"))

    if request.args.get("action") == "download":
        payload = service.load()
        raw = json.dumps(payload, ensure_ascii=False, indent=2)
        return Response(
            raw,
            mimetype="application/json; charset=utf-8",
            headers={"Content-Disposition": 'attachment; filename="ghost-01.json"'},
        )

    payload = service.load()
    return render_template("humanoid.html", payload=payload)
