#!/usr/bin/env python3
"""Convierte los originales de frontend/assets-src/ a WebP en frontend/public/images/.

Genera tambien el og-image (preview al compartir el link) y el favicon.
Correlo cada vez que agregues fotos nuevas:

    python3 scripts/optimize-images.py

Requiere Pillow:  pip install pillow

ponytail: un solo ancho de salida. Los originales de hoy son screenshots de ~820px,
asi que srcset generaria archivos identicos. Cuando lleguen las fotos originales del
club y el peso en celular se note, agregar un segundo ancho y srcset en los <img>.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "frontend" / "assets-src"
OUT = ROOT / "frontend" / "public" / "images"
PUBLIC = ROOT / "frontend" / "public"

MAX_WIDTH = 1600
QUALITY = 80
EXTS = {".png", ".jpg", ".jpeg"}

# De que foto salen el preview para redes y el icono de la pestania.
OG_SOURCE = "carrousel-handball1"
FAVICON_SOURCE = "logo-newen"


def to_webp(path: Path) -> int:
    """Escribe <nombre>.webp con ancho maximo MAX_WIDTH. Devuelve bytes escritos."""
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        # Nunca agrandar: si el original es mas chico, se deja como esta.
        target = min(MAX_WIDTH, im.width)
        resized = im.resize((target, round(im.height * target / im.width)), Image.LANCZOS)
        dest = OUT / f"{path.stem}.webp"
        resized.save(dest, "WEBP", quality=QUALITY, method=6)
        return dest.stat().st_size


def social_assets() -> None:
    og_src = next((SRC / OG_SOURCE).with_suffix(e) for e in EXTS if (SRC / OG_SOURCE).with_suffix(e).exists())
    with Image.open(og_src) as im:
        # 1200x630 es el formato que esperan WhatsApp, Instagram y Facebook.
        ImageOps.fit(im.convert("RGB"), (1200, 630), Image.LANCZOS).save(
            PUBLIC / "og-image.jpg", "JPEG", quality=85, optimize=True
        )

    fav_src = next((SRC / FAVICON_SOURCE).with_suffix(e) for e in EXTS if (SRC / FAVICON_SOURCE).with_suffix(e).exists())
    with Image.open(fav_src) as im:
        ImageOps.fit(im.convert("RGB"), (180, 180), Image.LANCZOS).save(
            PUBLIC / "favicon.png", "PNG", optimize=True
        )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    originals = sorted(p for p in SRC.iterdir() if p.suffix.lower() in EXTS)
    if not originals:
        raise SystemExit(f"No hay imagenes en {SRC}")

    before = after = 0
    for path in originals:
        before += path.stat().st_size
        after += to_webp(path)
        print(f"  {path.name}")

    social_assets()
    print(f"\n{len(originals)} fotos: {before / 1e6:.1f} MB -> {after / 1e6:.2f} MB en WebP")
    print("Generados tambien public/og-image.jpg y public/favicon.png")


if __name__ == "__main__":
    main()
