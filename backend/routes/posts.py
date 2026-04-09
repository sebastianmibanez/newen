import os
from flask import Blueprint, jsonify, request, current_app
from extensions import db
from models import Post, Sport
from werkzeug.utils import secure_filename

bp = Blueprint("posts", __name__, url_prefix="/api/posts")

ALLOWED = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED


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
    sport_slug = request.form.get("sport_slug")
    sport = Sport.query.filter_by(slug=sport_slug).first() if sport_slug else None

    image_path = None
    if "image" in request.files:
        file = request.files["image"]
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            upload_dir = current_app.config["UPLOAD_FOLDER"]
            os.makedirs(upload_dir, exist_ok=True)
            file.save(os.path.join(upload_dir, filename))
            image_path = f"/uploads/{filename}"

    post = Post(
        sport_id=sport.id if sport else None,
        title=request.form.get("title"),
        body=request.form.get("body"),
        image=image_path,
        pinned=request.form.get("pinned", "false").lower() == "true",
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
