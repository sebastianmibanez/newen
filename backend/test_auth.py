"""Chequeo del guard de escritura de la API.

    python3 test_auth.py

Si pasa no imprime nada salvo el OK final. Si el guard se rompe, revienta el assert.
"""
import os

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

print("OK: escritura protegida, lectura publica, sin redirects, frontend servido.")
