"""Conexion con Instagram: OAuth, importacion de publicaciones y callbacks de Meta.

Dos blueprints a proposito:
  - `bp`       bajo /api/instagram/, protegido por el token de admin.
  - `public_bp` bajo /auth/instagram/, sin proteger, porque a estas URLs las
    llama Instagram (redirect del OAuth) o Meta (avisos de desconexion), y
    ninguna de las dos puede mandar nuestro header.
"""
import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta

from flask import Blueprint, current_app, jsonify, redirect, request

import instagram
from extensions import db
from models import InstagramAccount, MediaAsset, Post, Sport

bp = Blueprint("instagram", __name__, url_prefix="/api/instagram")
public_bp = Blueprint("instagram_public", __name__, url_prefix="/auth/instagram")
media_bp = Blueprint("media", __name__, url_prefix="/media")

STATE_TTL = timedelta(minutes=30)
# Se renueva antes de tiempo: si el token muere, hay que molestar al club de nuevo.
RENEW_WHEN_DAYS_LEFT = 10


def account():
    """La unica fila de la tabla. La crea si no existe."""
    row = db.session.get(InstagramAccount, 1)
    if row is None:
        row = InstagramAccount(id=1)
        db.session.add(row)
        db.session.commit()
    return row


def valid_token(row):
    """Devuelve un token utilizable, renovandolo si esta por vencer."""
    if not row.access_token:
        raise instagram.InstagramError("Instagram no esta conectado todavia.")

    faltan = (row.expires_at - datetime.utcnow()).days if row.expires_at else 0
    if faltan <= RENEW_WHEN_DAYS_LEFT:
        try:
            token, vida = instagram.refresh(row.access_token)
            row.access_token = token
            row.expires_at = datetime.utcnow() + timedelta(seconds=vida)
            db.session.commit()
        except instagram.InstagramError as exc:
            # Si ya vencio no hay vuelta atras: hay que volver a autorizar.
            if faltan <= 0:
                raise instagram.InstagramError(
                    f"El token vencio y no se pudo renovar ({exc}). Hay que volver a conectar la cuenta."
                ) from exc
            current_app.logger.warning("No se pudo renovar el token de Instagram: %s", exc)
    return row.access_token


# ─────────────────────────── admin ───────────────────────────


@bp.get("/status")
def status():
    return jsonify(account().to_dict())


@bp.post("/connect")
def connect():
    """Genera el link de autorizacion para mandarle a quien administra el Instagram."""
    row = account()
    row.oauth_state = secrets.token_urlsafe(24)
    row.oauth_state_at = datetime.utcnow()
    db.session.commit()
    try:
        return jsonify({"url": instagram.authorize_url(row.oauth_state)})
    except instagram.InstagramError as exc:
        return {"error": str(exc)}, 400


@bp.post("/disconnect")
def disconnect():
    row = account()
    row.access_token = None
    row.expires_at = None
    row.username = None
    row.ig_user_id = None
    db.session.commit()
    return jsonify(row.to_dict())


@bp.get("/media")
def media():
    """Publicaciones recientes de Instagram, marcando cuales ya se importaron."""
    row = account()
    try:
        items = instagram.fetch_media(valid_token(row))
    except instagram.InstagramError as exc:
        return {"error": str(exc)}, 400

    ya = {p.instagram_id for p in Post.query.filter(Post.instagram_id.isnot(None)).all()}
    return jsonify(
        [
            {
                "id": item["id"],
                "caption": item.get("caption") or "",
                "media_type": item.get("media_type"),
                "permalink": item.get("permalink"),
                "timestamp": item.get("timestamp"),
                "preview": instagram.preview_url(item),
                "imported": item["id"] in ya,
            }
            for item in items
        ]
    )


@bp.post("/import")
def import_selected():
    """Importa las publicaciones elegidas como noticias.

    Recibe {"items": [{"id", "title", "sport_slug", "pinned"}]}. El titulo lo
    manda el panel ya editado: los captions de Instagram vienen con hashtags y
    emojis y no funcionan como titular del sitio oficial.
    """
    payload = request.get_json(silent=True) or {}
    pedidos = payload.get("items") or []
    if not pedidos:
        return {"error": "No se eligio ninguna publicacion."}, 400

    row = account()
    try:
        disponibles = {i["id"]: i for i in instagram.fetch_media(valid_token(row))}
    except instagram.InstagramError as exc:
        return {"error": str(exc)}, 400

    creados, omitidos = [], []
    for pedido in pedidos:
        ig_id = pedido.get("id")
        item = disponibles.get(ig_id)
        if not item:
            omitidos.append({"id": ig_id, "motivo": "ya no esta en Instagram"})
            continue
        if Post.query.filter_by(instagram_id=ig_id).first():
            omitidos.append({"id": ig_id, "motivo": "ya estaba importada"})
            continue

        image_path = None
        url = instagram.preview_url(item)
        if url:
            try:
                data, content_type = instagram.download(url)
                asset = MediaAsset(data=data, content_type=content_type)
                db.session.add(asset)
                db.session.flush()  # necesita el id para armar la ruta
                image_path = f"/media/{asset.id}"
            except instagram.InstagramError as exc:
                omitidos.append({"id": ig_id, "motivo": f"no se pudo bajar la foto: {exc}"})
                continue

        slug = pedido.get("sport_slug")
        sport = Sport.query.filter_by(slug=slug).first() if slug else None
        post = Post(
            sport_id=sport.id if sport else None,
            title=(pedido.get("title") or "").strip()[:200] or "Publicación de Instagram",
            body=item.get("caption"),
            image=image_path,
            pinned=bool(pedido.get("pinned")),
            instagram_id=ig_id,
        )
        db.session.add(post)
        creados.append(post)

    db.session.commit()
    return jsonify({"importados": [p.to_dict() for p in creados], "omitidos": omitidos}), 201


# ─────────────────────── callbacks de Meta ───────────────────────


@public_bp.get("/callback")
def callback():
    """Aca vuelve el navegador de quien autorizo, con el codigo."""
    if request.args.get("error"):
        return redirect(f"/admin?instagram=error&detalle={request.args.get('error_description', '')}")

    code = request.args.get("code")
    state = request.args.get("state")
    row = account()

    # El state es de un solo uso y con vencimiento: sin esto, cualquiera que
    # descubra esta URL podria conectar su propia cuenta encima de la del club.
    vigente = row.oauth_state_at and datetime.utcnow() - row.oauth_state_at < STATE_TTL
    if not code or not state or not row.oauth_state or not vigente:
        return redirect("/admin?instagram=error&detalle=solicitud+invalida+o+vencida")
    if not hmac.compare_digest(state, row.oauth_state):
        return redirect("/admin?instagram=error&detalle=state+no+coincide")

    row.oauth_state = None
    row.oauth_state_at = None

    try:
        corto, ig_user_id = instagram.exchange_code(code)
        largo, vida = instagram.exchange_long(corto)
        row.access_token = largo
        row.expires_at = datetime.utcnow() + timedelta(seconds=vida)
        row.ig_user_id = ig_user_id
        row.username = instagram.profile(largo).get("username")
        db.session.commit()
    except instagram.InstagramError as exc:
        db.session.commit()  # el state igual se quema
        current_app.logger.warning("Fallo el OAuth de Instagram: %s", exc)
        return redirect("/admin?instagram=error&detalle=no+se+pudo+conectar")

    return redirect("/admin?instagram=ok")


def _verificar_firma(signed_request):
    """Meta firma estos avisos con el app secret. Sin verificar, cualquiera
    podria mandar un POST y desconectar la integracion.

    Devuelve None ante cualquier problema. Es un endpoint publico: un cuerpo
    malformado tiene que ser un rechazo limpio, nunca una excepcion.
    """
    secreto = instagram.app_secret()
    if not secreto or not signed_request:
        return None

    def _b64(value):
        return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))

    try:
        firma_b64, payload_b64 = signed_request.split(".", 1)
        esperado = hmac.new(secreto.encode(), payload_b64.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64(firma_b64), esperado):
            return None
        return json.loads(_b64(payload_b64))
    except (ValueError, TypeError, base64.binascii.Error, json.JSONDecodeError):
        return None


@public_bp.post("/deauthorize")
def deauthorize():
    """Meta avisa aca cuando el club revoca el acceso desde Instagram."""
    datos = _verificar_firma(request.form.get("signed_request", ""))
    if datos is None:
        return {"error": "Firma invalida"}, 400
    row = account()
    row.access_token = None
    row.expires_at = None
    db.session.commit()
    return jsonify({"ok": True})


@public_bp.post("/delete")
def delete_data():
    """Pedido de borrado de datos. Meta exige que devuelva a donde consultar."""
    datos = _verificar_firma(request.form.get("signed_request", ""))
    if datos is None:
        return {"error": "Firma invalida"}, 400

    row = account()
    row.access_token = None
    row.expires_at = None
    row.username = None
    row.ig_user_id = None
    # Se van las noticias importadas y sus fotos: es lo unico que guardamos de Instagram.
    for post in Post.query.filter(Post.instagram_id.isnot(None)).all():
        if post.image and post.image.startswith("/media/"):
            asset = db.session.get(MediaAsset, int(post.image.rsplit("/", 1)[1]))
            if asset:
                db.session.delete(asset)
        db.session.delete(post)
    db.session.commit()

    base = request.url_root.rstrip("/")
    return jsonify({"url": f"{base}/admin", "confirmation_code": f"newen-{datetime.utcnow():%Y%m%d%H%M%S}"})


# ─────────────────────── servir las fotos ───────────────────────


@media_bp.get("/<int:asset_id>")
def serve(asset_id):
    asset = db.session.get(MediaAsset, asset_id)
    if asset is None:
        return {"error": "No existe"}, 404
    return current_app.response_class(asset.data, mimetype=asset.content_type)
