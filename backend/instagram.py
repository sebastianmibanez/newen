"""Cliente de la Instagram API con inicio de sesion de Instagram (Business Login).

Son cuatro llamadas HTTP, asi que va con urllib de la libreria estandar en vez de
sumar `requests` como dependencia.

Flujo completo:
  1. authorize_url()      -> el link que abre quien administra el Instagram
  2. exchange_code()      -> token corto (1 hora)
  3. exchange_long()      -> token largo (60 dias)
  4. refresh()            -> renueva el largo por 60 dias mas
  5. fetch_media()        -> lista las publicaciones
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request

AUTH_HOST = "https://www.instagram.com"
API_HOST = "https://api.instagram.com"
GRAPH_HOST = "https://graph.instagram.com"

SCOPE = "instagram_business_basic"
CALLBACK_PATH = "/auth/instagram/callback"
TIMEOUT = 20


class InstagramError(RuntimeError):
    """Meta devolvio un error, o no hay credenciales configuradas."""


def app_id():
    return os.getenv("INSTAGRAM_APP_ID", "")


def app_secret():
    return os.getenv("INSTAGRAM_APP_SECRET", "")


def redirect_uri():
    """Tiene que coincidir *exacto* con la URI registrada en la consola de Meta.

    Se toma de una env var y no del request entrante: detras del proxy de Render
    el esquema y el host que ve Flask no siempre son los publicos, y si difieren
    aunque sea en la barra final, Meta rechaza el intercambio.
    """
    base = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
    if not base:
        raise InstagramError("Falta PUBLIC_BASE_URL en las variables de entorno.")
    return f"{base}{CALLBACK_PATH}"


def require_credentials():
    if not app_id() or not app_secret():
        raise InstagramError(
            "Faltan INSTAGRAM_APP_ID e INSTAGRAM_APP_SECRET en las variables de entorno."
        )


def _read(response):
    payload = json.loads(response.read().decode())
    if isinstance(payload, dict) and "error" in payload:
        raise InstagramError(_describe(payload))
    return payload


def _describe(payload):
    err = payload.get("error")
    if isinstance(err, dict):
        return err.get("message") or json.dumps(err)
    return payload.get("error_message") or str(err)


def _get(url):
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT) as response:
            return _read(response)
    except urllib.error.HTTPError as exc:
        raise InstagramError(_http_error(exc)) from exc
    except urllib.error.URLError as exc:
        raise InstagramError(f"No se pudo contactar a Instagram: {exc.reason}") from exc


def _http_error(exc):
    try:
        return _describe(json.loads(exc.read().decode()))
    except Exception:
        return f"Instagram respondio {exc.code}"


def authorize_url(state):
    """El link que se le manda a quien administra el Instagram del club."""
    require_credentials()
    params = {
        "client_id": app_id(),
        "redirect_uri": redirect_uri(),
        "response_type": "code",
        "scope": SCOPE,
        "state": state,
    }
    return f"{AUTH_HOST}/oauth/authorize?{urllib.parse.urlencode(params)}"


def exchange_code(code):
    """Codigo de autorizacion -> token corto. Devuelve (token, ig_user_id)."""
    require_credentials()
    body = urllib.parse.urlencode(
        {
            "client_id": app_id(),
            "client_secret": app_secret(),
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri(),
            "code": code,
        }
    ).encode()
    request = urllib.request.Request(f"{API_HOST}/oauth/access_token", data=body)
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            payload = _read(response)
    except urllib.error.HTTPError as exc:
        raise InstagramError(_http_error(exc)) from exc
    return payload["access_token"], str(payload.get("user_id", ""))


def exchange_long(short_token):
    """Token corto -> token largo. Devuelve (token, segundos_de_vida)."""
    require_credentials()
    params = urllib.parse.urlencode(
        {
            "grant_type": "ig_exchange_token",
            "client_secret": app_secret(),
            "access_token": short_token,
        }
    )
    payload = _get(f"{GRAPH_HOST}/access_token?{params}")
    return payload["access_token"], int(payload.get("expires_in", 5184000))


def refresh(long_token):
    """Renueva por 60 dias mas. Solo funciona si el token tiene mas de 24 horas."""
    params = urllib.parse.urlencode(
        {"grant_type": "ig_refresh_token", "access_token": long_token}
    )
    payload = _get(f"{GRAPH_HOST}/refresh_access_token?{params}")
    return payload["access_token"], int(payload.get("expires_in", 5184000))


def profile(token):
    params = urllib.parse.urlencode({"fields": "id,username", "access_token": token})
    return _get(f"{GRAPH_HOST}/me?{params}")


def fetch_media(token, limit=25):
    """Publicaciones recientes, mas nuevas primero.

    Para los carruseles se pide `children` porque el post en si no trae media_url.
    Los videos traen thumbnail_url en lugar de una imagen.
    """
    params = urllib.parse.urlencode(
        {
            "fields": (
                "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,"
                "children{media_url,thumbnail_url}"
            ),
            "limit": limit,
            "access_token": token,
        }
    )
    return _get(f"{GRAPH_HOST}/me/media?{params}").get("data", [])


def preview_url(item):
    """La imagen que representa a una publicacion, sea foto, video o carrusel."""
    if item.get("media_type") == "CAROUSEL_ALBUM":
        children = (item.get("children") or {}).get("data") or []
        if children:
            first = children[0]
            return first.get("media_url") or first.get("thumbnail_url")
    return item.get("media_url") or item.get("thumbnail_url")


def download(url):
    """Baja la foto. Las URLs del CDN de Instagram caducan en horas, asi que hay
    que guardar los bytes y no el link."""
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT) as response:
            return response.read(), response.headers.get("Content-Type", "image/jpeg")
    except urllib.error.URLError as exc:
        raise InstagramError(f"No se pudo descargar la foto: {exc}") from exc
