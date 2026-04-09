import os
from flask import Flask, send_from_directory
from dotenv import load_dotenv
from extensions import db, migrate

load_dotenv()


def create_app():
    app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///newen.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))

    db.init_app(app)
    migrate.init_app(app, db)

    from flask_cors import CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from routes.sports import bp as sports_bp
    from routes.posts import bp as posts_bp
    from routes.events import bp as events_bp
    app.register_blueprint(sports_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(events_bp)

    # Serve uploaded files
    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Serve React app for all non-API routes
    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def serve_react(path):
        if path.startswith("api/") or path.startswith("uploads/"):
            return {"error": "Not found"}, 404
        dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")
        if path and os.path.exists(os.path.join(dist, path)):
            return send_from_directory(dist, path)
        return send_from_directory(dist, "index.html")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
