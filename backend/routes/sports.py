from flask import Blueprint, jsonify
from models import Sport

bp = Blueprint("sports", __name__, url_prefix="/api/sports")


@bp.get("/")
def list_sports():
    sports = Sport.query.all()
    return jsonify([s.to_dict() for s in sports])


@bp.get("/<slug>")
def get_sport(slug):
    sport = Sport.query.filter_by(slug=slug).first_or_404()
    return jsonify(sport.to_dict())
