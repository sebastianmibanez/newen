from flask import Blueprint, jsonify, request
from extensions import db
from models import Post, Sport

bp = Blueprint("posts", __name__, url_prefix="/api/posts")


@bp.get("/")
def list_posts():
    sport_slug = request.args.get("sport")
    query = Post.query
    if sport_slug:
        sport = Sport.query.filter_by(slug=sport_slug).first_or_404()
        query = query.filter_by(sport_id=sport.id)
    posts = query.order_by(Post.pinned.desc(), Post.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts])


@bp.get("/<int:post_id>")
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict())


@bp.post("/")
def create_post():
    """Crea una noticia.

    `image` es una ruta o URL, no un archivo. Antes esto recibia un upload y lo
    guardaba en disco, pero el disco de Render es efimero: la foto desaparecia
    en el siguiente deploy. Mejor no ofrecer la funcion que perder datos en
    silencio.
    ponytail: cuando haya donde hospedar (Cloudinary, o el importador de
    Instagram que igual va a tener que descargar y re-subir), vuelve el upload.
    """
    data = request.get_json(silent=True) or {}
    if not data.get("title"):
        return {"error": "Falta el titulo"}, 400

    sport_slug = data.get("sport_slug")
    sport = Sport.query.filter_by(slug=sport_slug).first() if sport_slug else None
    if sport_slug and not sport:
        return {"error": f"No existe el deporte '{sport_slug}'"}, 400

    post = Post(
        sport_id=sport.id if sport else None,
        title=data["title"],
        body=data.get("body"),
        image=data.get("image") or None,
        pinned=bool(data.get("pinned")),
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@bp.delete("/<int:post_id>")
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    return jsonify({"deleted": post_id})
