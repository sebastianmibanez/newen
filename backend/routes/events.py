from flask import Blueprint, jsonify, request
from extensions import db
from models import Event, Sport
from datetime import datetime

bp = Blueprint("events", __name__, url_prefix="/api/events")


@bp.get("/")
def list_events():
    sport_slug = request.args.get("sport")
    upcoming = request.args.get("upcoming", "false").lower() == "true"
    query = Event.query
    if sport_slug:
        sport = Sport.query.filter_by(slug=sport_slug).first_or_404()
        query = query.filter_by(sport_id=sport.id)
    if upcoming:
        query = query.filter(Event.starts_at >= datetime.utcnow())
    events = query.order_by(Event.starts_at.asc()).all()
    return jsonify([e.to_dict() for e in events])


@bp.get("/<int:event_id>")
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event.to_dict())


@bp.post("/")
def create_event():
    data = request.get_json()
    sport_slug = data.get("sport_slug")
    sport = Sport.query.filter_by(slug=sport_slug).first() if sport_slug else None

    event = Event(
        sport_id=sport.id if sport else None,
        title=data["title"],
        description=data.get("description"),
        location=data.get("location"),
        starts_at=datetime.fromisoformat(data["starts_at"]),
        ends_at=datetime.fromisoformat(data["ends_at"]) if data.get("ends_at") else None,
        image=data.get("image"),
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


@bp.delete("/<int:event_id>")
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return jsonify({"deleted": event_id})
