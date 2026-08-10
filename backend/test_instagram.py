"""Chequeos de la conexion con Instagram, sin tocar la API real.

    python3 test_instagram.py

Verifica los limites que importan: que el estado de la cuenta no sea publico,
que los callbacks de Meta si lo sean, y que ni un state falso ni una firma
falsa alcancen para conectar o desconectar nada.
"""
import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlparse

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["ADMIN_TOKEN"] = "token-de-prueba"
os.environ["INSTAGRAM_APP_ID"] = "123456"
os.environ["INSTAGRAM_APP_SECRET"] = "secreto-de-prueba"
os.environ["PUBLIC_BASE_URL"] = "https://ejemplo.test"

from app import create_app  # noqa: E402
from extensions import db  # noqa: E402
from models import InstagramAccount, MediaAsset  # noqa: E402

app = create_app()
with app.app_context():
    db.create_all()
client = app.test_client()
ok = {"X-Admin-Token": "token-de-prueba"}

# El estado de la cuenta no es publico: dice si esta conectada y con que usuario.
# Ojo que esto es un GET, que en el resto de la API si es abierto.
assert client.get("/api/instagram/status").status_code == 401
assert client.get("/api/instagram/media").status_code == 401
assert client.post("/api/instagram/disconnect").status_code == 401

estado = client.get("/api/instagram/status", headers=ok)
assert estado.status_code == 200
assert estado.get_json()["connected"] is False

# El link de autorizacion tiene que apuntar a Instagram con el scope justo.
url = client.post("/api/instagram/connect", headers=ok).get_json()["url"]
partes = urlparse(url)
query = parse_qs(partes.query)
assert partes.netloc == "www.instagram.com", partes.netloc
assert query["scope"] == ["instagram_business_basic"]
assert query["redirect_uri"] == ["https://ejemplo.test/auth/instagram/callback"]
assert query["response_type"] == ["code"]
state_real = query["state"][0]
assert len(state_real) > 20

# El callback es publico (Instagram no puede mandar nuestro header) pero exige
# el state correcto: sin esto, cualquiera que descubra la URL podria enchufar
# su propia cuenta encima de la del club.
sin_state = client.get("/auth/instagram/callback?code=abc")
assert sin_state.status_code == 302, "el callback no puede pedir token"
assert "instagram=error" in sin_state.headers["Location"]

falso = client.get("/auth/instagram/callback?code=abc&state=inventado")
assert "instagram=error" in falso.headers["Location"]

with app.app_context():
    assert db.session.get(InstagramAccount, 1).access_token is None, "se conecto sin autorizacion valida"

# Un state vencido tampoco sirve.
with app.app_context():
    fila = db.session.get(InstagramAccount, 1)
    fila.oauth_state = "vigente"
    fila.oauth_state_at = datetime.utcnow() - timedelta(hours=2)
    db.session.commit()
vencido = client.get("/auth/instagram/callback?code=abc&state=vigente")
assert "instagram=error" in vencido.headers["Location"]

# Los avisos de Meta van firmados con el app secret. Sin verificar la firma,
# cualquiera podria mandar un POST y cortar la integracion.
assert client.post("/auth/instagram/deauthorize", data={"signed_request": "basura"}).status_code == 400
assert client.post("/auth/instagram/delete", data={"signed_request": "a.b"}).status_code == 400


def firmar(payload):
    cuerpo = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    firma = hmac.new(b"secreto-de-prueba", cuerpo.encode(), hashlib.sha256).digest()
    return f"{base64.urlsafe_b64encode(firma).decode().rstrip('=')}.{cuerpo}"


with app.app_context():
    fila = db.session.get(InstagramAccount, 1)
    fila.access_token = "token-vivo"
    fila.expires_at = datetime.utcnow() + timedelta(days=60)
    db.session.commit()

firmado = {"signed_request": firmar({"user_id": "1"})}
assert client.post("/auth/instagram/deauthorize", data=firmado).status_code == 200
with app.app_context():
    assert db.session.get(InstagramAccount, 1).access_token is None, "no se desconecto"

# Sin cuenta conectada, pedir publicaciones da un error claro y no un 500.
media = client.get("/api/instagram/media", headers=ok)
assert media.status_code == 400
assert "conectado" in media.get_json()["error"]

# Las fotos importadas se sirven desde la base, con su tipo y cache larga.
with app.app_context():
    asset = MediaAsset(data=b"\x89PNG-falso", content_type="image/png")
    db.session.add(asset)
    db.session.commit()
    asset_id = asset.id

foto = client.get(f"/media/{asset_id}")
assert foto.status_code == 200
assert foto.data == b"\x89PNG-falso"
assert foto.headers["Content-Type"] == "image/png"
assert "immutable" in foto.headers["Cache-Control"]
assert client.get("/media/9999").status_code == 404

print("OK: estado privado, callbacks publicos pero verificados, fotos servidas desde la base.")
