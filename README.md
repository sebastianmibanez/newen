# Club Deportivo Newen — Web App

Flask backend + React (Vite) frontend para el Club Deportivo Newen de Renca.

## Stack
- **Backend**: Flask · SQLAlchemy · Flask-Migrate · Gunicorn
- **Frontend**: React 18 · Vite · Tailwind CSS · React Router
- **DB (prod)**: PostgreSQL (Render) · SQLite (local)

## Estructura
```
newen/
├── backend/
│   ├── app.py          # Factory principal
│   ├── extensions.py   # db, migrate
│   ├── models.py       # Sport, Post, Event
│   ├── routes/
│   │   ├── sports.py
│   │   ├── posts.py
│   │   └── events.py
│   ├── seed.py         # Poblar deportes iniciales
│   ├── test_smoke.py   # Chequeos de auth, ruteo y headers de assets
│   └── requirements.txt
├── frontend/
│   ├── assets-src/     # Fotos originales (NO se publican)
│   ├── public/images/  # WebP generados (esto es lo que se sirve)
│   ├── src/
│   │   ├── pages/      # Landing, SportPage, NotFound
│   │   ├── components/ # Navbar, Footer, HeroCarousel, Carousel, EventCard
│   │   └── App.jsx
│   └── package.json
├── scripts/
│   └── optimize-images.py
└── render.yaml
```

## Fotos

Las fotos originales van a `frontend/assets-src/`. **Nunca** se ponen directo en
`public/images/`: ese directorio se publica tal cual y ahí es donde el sitio se
vuelve pesado (arrancó pesando 12 MB por subir PNG sin procesar).

Después de agregar fotos nuevas:

```bash
python3 scripts/optimize-images.py
```

Convierte todo a WebP con ancho máximo de 1600px y regenera `og-image.jpg` y
`favicon.png`. Los originales quedan en el repo pero fuera del build.

## Desarrollo local (Docker — una sola terminal)

```bash
docker compose up
```

- Frontend (React/Vite con hot-reload): http://localhost:5173
- Backend (Flask API): http://localhost:5000

Para detener: `Ctrl+C` y luego `docker compose down`

> La base de datos SQLite se guarda dentro del contenedor backend.
> Para producción Render usa PostgreSQL automáticamente.

## Panel de administración

En `/admin`. Pide el `ADMIN_TOKEN` una vez y lo guarda en el navegador. Desde ahí
se crean y borran noticias y eventos.

Las imágenes se referencian por **ruta o URL** (`/images/noticia-handball1.webp`),
no se suben. El disco de Render es efímero: un archivo subido desaparece en el
siguiente deploy, así que la subida se sacó en vez de dejarla perdiendo fotos en
silencio. Para agregar fotos nuevas: a `assets-src/`, correr
`scripts/optimize-images.py`, commitear.

## Base de datos

El esquema lo manejan las migraciones, no `db.create_all()`:

```bash
cd backend
export FLASK_APP=app.py
flask db migrate -m "que cambió"   # después de tocar models.py
flask db upgrade                   # aplicar
```

El contenedor corre `flask db upgrade && python seed.py` al arrancar. `seed.py`
es idempotente: si ya hay datos, no toca nada.

> Si alguna vez apuntás `DATABASE_URL` a una base que ya tenía tablas creadas por
> el viejo `db.create_all()`, `flask db upgrade` va a fallar porque las tablas ya
> existen. Se arregla corriendo `flask db stamp head` una vez sobre esa base.

## API Endpoints

Los GET son públicos. **Todo lo que escribe o borra exige el header
`X-Admin-Token`** con el valor de la env var `ADMIN_TOKEN`; si esa variable no
está seteada, las escrituras se rechazan con 401 (el default es cerrado).

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/sports` | Listado de deportes |
| GET | `/api/sports/<slug>` | Detalle de un deporte |
| GET | `/api/posts?sport=handball` | Posts (filtrables por deporte) |
| POST | `/api/posts` | Crear noticia (JSON) · token |
| DELETE | `/api/posts/<id>` | Eliminar post · token |
| GET | `/api/events?sport=handball&upcoming=true` | Eventos |
| POST | `/api/events` | Crear evento (JSON) · token |
| DELETE | `/api/events/<id>` | Eliminar evento · token |

Verificar que la protección sigue en pie:

```bash
cd backend && python3 test_smoke.py
```

## Deploy en Render

1. Conectar este repo en Render
2. Render detecta `render.yaml` automáticamente
3. Crear Web Service con:
   - **Build**: `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt && python seed.py`
   - **Start**: `cd backend && gunicorn "app:create_app()"  --bind 0.0.0.0:$PORT`
4. Agregar PostgreSQL desde el dashboard de Render
5. Setear las env vars:
   - `DATABASE_URL` con la connection string de Postgres
   - `ADMIN_TOKEN` — generarlo con `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `SECRET_KEY`

> Al pasar a dominio propio hay que actualizar a mano `og:url` y `og:image` en
> `frontend/index.html`: tienen que ser URLs absolutas o el preview del link se
> rompe en WhatsApp e Instagram.

## Pendiente

**Fase 1** — que el club actualice el sitio sin tocar código
- Postgres en Render — falta crear la base (hoy SQLite se borra en cada deploy)
- ~~Panel `/admin`~~ hecho
- Que la Landing consuma la API en vez de las constantes hardcodeadas
- Subida de imágenes a Cloudinary (el disco de Render es efímero)
- Importador de publicaciones desde Instagram

**Fase 2** — contenido propio de un club
- Modelo `Match` para partidos y resultados reales
- Horarios de entrenamiento, categorías, cuerpo técnico
- Formulario de inscripción
- Historia y contacto con mapa

**Fase 3** — pulido
- Tipografía condensada para titulares
- Paleta sacada del escudo real (hoy usa el verde default de Tailwind)
- Galería con lightbox, sponsors
