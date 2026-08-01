# ── Stage 1: build React ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Flask sirve todo ─────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist /frontend/dist

ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

# `flask db upgrade` crea y actualiza el esquema. Antes se usaba db.create_all(),
# que crea tablas nuevas pero nunca modifica las existentes: servia con la base
# vacia y se rompia apenas hubiera datos reales que migrar.
CMD ["sh", "-c", "flask db upgrade && python seed.py && gunicorn 'app:create_app()' --bind 0.0.0.0:${PORT:-5000} --workers 2"]
