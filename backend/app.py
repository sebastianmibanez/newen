import hmac
import mimetypes
import os
from flask import Flask, request, send_from_directory
from dotenv import load_dotenv
from extensions import db, migrate

load_dotenv()

# python:3.12-slim no trae /etc/mime.types, asi que mimetypes no reconoce .webp
# y Flask servia todas las fotos como application/octet-stream.
mimetypes.add_type("image/webp", ".webp")


def create_app():
    # static_folder=None a proposito. Con static_url_path="" Flask registraba su
    # propia regla /<path:filename> que le ganaba a serve_react, y toda URL que no
    # fuera un archivo real moria en 404: /handball, /basketball y /futbol daban
    # 404 al entrar directo o al refrescar. Navegando dentro del sitio no se veia
    # porque ahi rutea React. Ahora serve_react atiende todo.
    app = Flask(__name__, static_folder=None)

    # Sin esto, GET /api/events responde un 308 hacia /api/events/ y el frontend
    # paga un viaje de ida y vuelta extra en cada llamada.
    app.url_map.strict_slashes = False

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

    database_url = os.getenv("DATABASE_URL", "sqlite:///newen.db")
    # Render entrega la URL como postgres://, un esquema que SQLAlchemy 2 dejo de
    # reconocer. Sin esta linea el contenedor no arranca y el error no dice por que.
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if database_url.startswith("postgresql://"):
        # El plan free duerme el servicio y Postgres corta las conexiones ociosas.
        # Sin pre_ping, la primera consulta despues de un rato revienta con
        # "server closed the connection unexpectedly".
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True, "pool_recycle": 300}
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))

    db.init_app(app)
    migrate.init_app(app, db)

    # Crear y borrar contenido exige el token del admin. Se aplica aca y no en cada
    # ruta para que un endpoint nuevo nazca protegido sin que haya que acordarse.
    # Si ADMIN_TOKEN no esta seteado, toda escritura queda bloqueada.
    admin_token = os.getenv("ADMIN_TOKEN")

    def needs_token(path, method):
        # /api/instagram/ expone el estado de la cuenta conectada, asi que se
        # protege tambien en GET. Los callbacks de Meta viven en /auth/, fuera
        # de aca, porque Instagram no puede mandar nuestro header.
        if path.startswith("/api/instagram/"):
            return True
        return method not in ("GET", "HEAD", "OPTIONS") and path.startswith("/api/")

    @app.before_request
    def require_admin_token():
        if not needs_token(request.path, request.method):
            return None
        sent = request.headers.get("X-Admin-Token", "")
        if not admin_token or not hmac.compare_digest(sent, admin_token):
            return {"error": "No autorizado"}, 401
        return None

    # Flask manda no-cache por defecto, asi que el visitante que vuelve se
    # re-descargaba todas las fotos. index.html queda sin cachear a proposito:
    # es lo que apunta a los assets nuevos despues de cada deploy.
    @app.after_request
    def cache_headers(response):
        if request.path.startswith("/assets/") or request.path.startswith("/media/"):
            # Vite le pone hash al nombre y /media/<id> siempre devuelve los
            # mismos bytes: en ambos casos, si cambia el contenido cambia la URL.
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif request.path.startswith("/images/") or request.path in ("/favicon.png", "/og-image.jpg"):
            # Sin hash en el nombre: un dia de cache es el techo razonable para
            # que una foto reemplazada aparezca sin tener que renombrarla.
            response.headers["Cache-Control"] = "public, max-age=86400"
        return response

    from routes.sports import bp as sports_bp
    from routes.posts import bp as posts_bp
    from routes.events import bp as events_bp
    from routes.instagram import bp as instagram_bp, media_bp, public_bp as instagram_public_bp
    app.register_blueprint(sports_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(instagram_bp)
    app.register_blueprint(instagram_public_bp)
    app.register_blueprint(media_bp)

    # Serve React app for all non-API routes
    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def serve_react(path):
        if path.startswith("api/"):
            return {"error": "Not found"}, 404
        dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")
        if path and os.path.exists(os.path.join(dist, path)):
            return send_from_directory(dist, path)
        return send_from_directory(dist, "index.html")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
