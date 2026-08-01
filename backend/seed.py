"""Carga el contenido inicial. Es idempotente: si ya hay datos, no toca nada.

Las tablas las crean las migraciones (`flask db upgrade`), no este script.
"""
from app import create_app
from extensions import db
from models import Post, Sport

SPORTS = [
    ("handball", "Handball", "Escuelita, infantiles y cadetas"),
    ("basketball", "Basketball", "Escuelita"),
    ("futbol", "Fútbol", "Escuelita"),
]

# Las noticias que hoy estan hardcodeadas en el frontend. Se cargan como datos
# reales para que la landing pueda dejar de tenerlas escritas a mano sin que el
# sitio quede vacio.
POSTS = [
    {
        "sport": "handball",
        "title": "Antonia Fuentes al Mundial Juvenil en China",
        "body": (
            "Nuestra querida Antonia Fuentes, jugadora de la categoría cadete de "
            "Balonmano, parte rumbo al Mundial Juvenil de Especialidad en China. "
            "Todo el esfuerzo, las mil horas de entrenamiento, el sacrificio y el "
            "gran amor por el Balonmano la trajeron hasta aquí. ¡Vamos Chile!"
        ),
        "image": "/images/noticia-handball1.webp",
        "pinned": True,
    },
    {
        "sport": None,  # es del club entero, no de un deporte
        "title": "5° Aniversario Newen",
        "body": (
            "Celebramos nuestro aniversario con la sub 17 de básquet, los niños de "
            "fútbol y la premiación del \"Jugador Newen\": aquel que engloba "
            "compañerismo, esfuerzo, disciplina y constancia. Nos acompañaron el "
            "psicólogo deportivo Víctor Cepeda, nuestros amigos de Mundo Freestyle "
            "Chile y el alcalde Claudio Castro."
        ),
        "image": "/images/noticia-handball2.webp",
        "pinned": False,
    },
    {
        "sport": "futbol",
        "title": "Novedades de la Escuelita de Fútbol",
        "body": "Seguimos formando a los niños y niñas de Renca en la escuelita de fútbol.",
        "image": "/images/noticia-futbol1.webp",
        "pinned": False,
    },
]


def main():
    app = create_app()
    with app.app_context():
        if not Sport.query.first():
            db.session.add_all(
                Sport(slug=slug, name=name, description=desc) for slug, name, desc in SPORTS
            )
            db.session.commit()
            print(f"Deportes cargados: {len(SPORTS)}")

        if not Post.query.first():
            by_slug = {s.slug: s.id for s in Sport.query.all()}
            for p in POSTS:
                db.session.add(
                    Post(
                        sport_id=by_slug.get(p["sport"]) if p["sport"] else None,
                        title=p["title"],
                        body=p["body"],
                        image=p["image"],
                        pinned=p["pinned"],
                    )
                )
            db.session.commit()
            print(f"Noticias cargadas: {len(POSTS)}")

        print("Seed listo.")


if __name__ == "__main__":
    main()
