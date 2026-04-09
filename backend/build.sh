#!/bin/bash
# Render build script — builds frontend then installs backend deps
set -e

echo "→ Building React frontend..."
cd ../frontend
npm install
npm run build

echo "→ Installing Python dependencies..."
cd ../backend
pip install -r requirements.txt

echo "→ Seeding database..."
python seed.py

echo "✓ Build complete."
