"""Run once to populate initial sports data."""
from app import create_app
from extensions import db
from models import Sport

app = create_app()

with app.app_context():
    db.create_all()
    if not Sport.query.first():
        sports = [
            Sport(slug="handball", name="Handball", description="Escuelita, infantiles y cadetas 🤾‍♀️"),
            Sport(slug="basketball", name="Basketball", description="Escuelita 🏀"),
            Sport(slug="futbol", name="Fútbol", description="Escuelita ⚽"),
        ]
        db.session.add_all(sports)
        db.session.commit()
        print("Sports seeded.")
    else:
        print("Already seeded.")
