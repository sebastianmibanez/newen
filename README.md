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
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/      # Landing, SportPage, NotFound
│   │   ├── components/ # Navbar, Footer, PostCard, EventCard
│   │   └── App.jsx
│   └── package.json
└── render.yaml
```

## Desarrollo local (Docker — una sola terminal)

```bash
docker compose up
```

- Frontend (React/Vite con hot-reload): http://localhost:5173
- Backend (Flask API): http://localhost:5000

Para detener: `Ctrl+C` y luego `docker compose down`

> La base de datos SQLite se guarda dentro del contenedor backend.
> Para producción Render usa PostgreSQL automáticamente.

## API Endpoints

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/sports/` | Listado de deportes |
| GET | `/api/sports/<slug>` | Detalle de un deporte |
| GET | `/api/posts/?sport=handball` | Posts (filtrables por deporte) |
| POST | `/api/posts/` | Crear post (multipart/form-data) |
| DELETE | `/api/posts/<id>` | Eliminar post |
| GET | `/api/events/?sport=handball&upcoming=true` | Eventos |
| POST | `/api/events/` | Crear evento (JSON) |
| DELETE | `/api/events/<id>` | Eliminar evento |

## Deploy en Render

1. Conectar este repo en Render
2. Render detecta `render.yaml` automáticamente
3. Crear Web Service con:
   - **Build**: `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt && python seed.py`
   - **Start**: `cd backend && gunicorn "app:create_app()"  --bind 0.0.0.0:$PORT`
4. Agregar PostgreSQL desde el dashboard de Render
5. Set env var `DATABASE_URL` con la connection string

## Fase 2 (ideas futuras)
- Panel admin para subir fotos/eventos desde el navegador
- Galería lightbox
- Inscripciones online a escuelas
- Notificaciones push de partidos
