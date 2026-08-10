from extensions import db
from datetime import datetime


class Sport(db.Model):
    __tablename__ = "sports"
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(50), unique=True, nullable=False)  # handball, basketball, futbol
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    cover_image = db.Column(db.String(255))
    posts = db.relationship("Post", backref="sport", lazy=True, cascade="all, delete-orphan")
    events = db.relationship("Event", backref="sport", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "description": self.description,
            "cover_image": self.cover_image,
        }


class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.Integer, primary_key=True)
    sport_id = db.Column(db.Integer, db.ForeignKey("sports.id"), nullable=True)
    title = db.Column(db.String(200))
    body = db.Column(db.Text)
    image = db.Column(db.String(255))
    pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Id de la publicacion de Instagram de la que salio, si vino de ahi. Unico,
    # para que importar dos veces no duplique la noticia.
    instagram_id = db.Column(db.String(50), unique=True, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "sport_id": self.sport_id,
            "sport_slug": self.sport.slug if self.sport else None,
            "title": self.title,
            "body": self.body,
            "image": self.image,
            "pinned": self.pinned,
            "instagram_id": self.instagram_id,
            "created_at": self.created_at.isoformat(),
        }


class MediaAsset(db.Model):
    """Una foto guardada en la base, servida por /media/<id>.

    Las URLs que devuelve Instagram caducan en horas, asi que la foto hay que
    descargarla y hospedarla. El disco de Render es efimero y no hay cuenta de
    Cloudinary, asi que por ahora viven aca.

    ponytail: bytes en la base. Aguanta de sobra el volumen de un club (una foto
    ronda los 150 KB y el Postgres free da 1 GB) y no suma servicios ni cuentas.
    Si algun dia son miles de fotos o hace falta CDN, migrar a almacenamiento
    externo cambiando solo lo que escribe `Post.image`.
    """

    __tablename__ = "media_assets"
    id = db.Column(db.Integer, primary_key=True)
    content_type = db.Column(db.String(50), nullable=False, default="image/jpeg")
    data = db.deferred(db.Column(db.LargeBinary, nullable=False))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class InstagramAccount(db.Model):
    """La cuenta de Instagram conectada. Hay una sola fila, siempre id=1."""

    __tablename__ = "instagram_account"
    id = db.Column(db.Integer, primary_key=True)
    ig_user_id = db.Column(db.String(50))
    username = db.Column(db.String(100))
    access_token = db.Column(db.Text)
    # Los tokens largos duran 60 dias y se renuevan si tienen mas de 24 horas.
    expires_at = db.Column(db.DateTime)
    # Nonce de un solo uso para el OAuth. Evita que alguien que descubra la URL
    # del callback conecte su propia cuenta encima de la del club.
    oauth_state = db.Column(db.String(64))
    oauth_state_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def connected(self):
        return bool(self.access_token)

    def to_dict(self):
        return {
            "connected": self.connected,
            "username": self.username,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "days_left": (
                (self.expires_at - datetime.utcnow()).days if self.expires_at else None
            ),
        }


class Event(db.Model):
    __tablename__ = "events"
    id = db.Column(db.Integer, primary_key=True)
    sport_id = db.Column(db.Integer, db.ForeignKey("sports.id"), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(200))
    starts_at = db.Column(db.DateTime, nullable=False)
    ends_at = db.Column(db.DateTime)
    image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "sport_id": self.sport_id,
            "sport_slug": self.sport.slug if self.sport else None,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "starts_at": self.starts_at.isoformat(),
            "ends_at": self.ends_at.isoformat() if self.ends_at else None,
            "image": self.image,
            "created_at": self.created_at.isoformat(),
        }
