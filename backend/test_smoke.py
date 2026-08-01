"""Chequeos de la app: permisos de escritura, ruteo y headers de los assets.

    python3 test_smoke.py

Necesita el frontend compilado (cd ../frontend && npm run build).
Si pasa no imprime nada salvo el OK final; si algo se rompe, revienta el assert.
"""
import os
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite://"  # base en memoria, no toca disco
os.environ["ADMIN_TOKEN"] = "token-de-prueba"

from app import create_app  # noqa: E402  (necesita el env ya seteado)
from extensions import db  # noqa: E402
from models import Sport  # noqa: E402

app = create_app()
with app.app_context():
    db.create_all()
    db.session.add(Sport(slug="handball", name="Handball"))
    db.session.commit()
client = app.test_client()

# Leer es publico.
assert client.get("/api/sports").status_code == 200

# Escribir sin token, o con uno equivocado, se rechaza.
assert client.post("/api/events", json={}).status_code == 401
assert client.post("/api/events", json={}, headers={"X-Admin-Token": ""}).status_code == 401
assert client.post("/api/events", json={}, headers={"X-Admin-Token": "otro"}).status_code == 401
assert client.delete("/api/posts/1").status_code == 401

# Con el token correcto el guard deja pasar (despues falla por payload vacio, no por auth).
ok = {"X-Admin-Token": "token-de-prueba"}
assert client.delete("/api/posts/1", headers=ok).status_code == 404

# Sin ADMIN_TOKEN configurado se bloquea todo: el default es cerrado, no abierto.
os.environ.pop("ADMIN_TOKEN")
sin_token = create_app().test_client()
assert sin_token.post("/api/events", json={}).status_code == 401
assert sin_token.post("/api/events", json={}, headers=ok).status_code == 401

# El 308 por barra final estaba haciendo que cada llamada del frontend viajara dos veces.
assert client.get("/api/events?sport=handball").status_code == 200

# Flask sirve el frontend compilado (lo mismo que hace el contenedor en produccion).
# Si esto falla, falta correr `npm run build` en frontend/.
home = client.get("/")
assert home.status_code == 200, "no hay frontend/dist compilado"
assert b"og:image" in home.data, "se perdieron los meta tags de compartir"
# index.html no se cachea: es lo que apunta a los assets nuevos tras cada deploy.
assert "immutable" not in home.headers.get("Cache-Control", "")

# El contenedor no reconocia .webp y servia las fotos como octet-stream.
foto = client.get("/images/logo-newen.webp")
assert foto.status_code == 200
assert foto.headers["Content-Type"] == "image/webp", foto.headers["Content-Type"]
assert foto.headers["Cache-Control"] == "public, max-age=86400"

# Los assets de Vite llevan hash en el nombre, asi que se cachean para siempre.
dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
css = next(dist.glob("assets/*.css"), None)
assert css, "no hay assets compilados en frontend/dist"
assert "immutable" in client.get(f"/assets/{css.name}").headers["Cache-Control"]

print("OK: escritura protegida, lectura publica, sin redirects, frontend servido, cache y MIME correctos.")
