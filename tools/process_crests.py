"""Dev-only helper: converts the real club crests dropped in Downloads into
optimized WebP badges inside assets/img/teams/. Safe to delete after running.
"""
from PIL import Image
import os

DOWNLOADS = os.path.join(os.path.dirname(__file__), "..", "..")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "teams")

MAPPING = {
    "Britania.png": "britannia",
    "Caiquetio.png": "caiquetio",
    "Caravel.webp": "caravel",
    "Dakota.png": "dakota",
    "Nacional.png": "nacional",
    "RCA.png": "rca",
    "sv-bubali-e11867c5-5e3f-4d34-afb7-8eb7c2f13e4-resize-750.png": "bubali",
}

MAX_SIZE = (320, 320)

os.makedirs(OUT_DIR, exist_ok=True)

for src_name, slug in MAPPING.items():
    src_path = os.path.join(DOWNLOADS, src_name)
    img = Image.open(src_path).convert("RGBA")
    img.thumbnail(MAX_SIZE, Image.LANCZOS)
    out_path = os.path.join(OUT_DIR, slug + ".webp")
    img.save(out_path, "WEBP", quality=90, method=6)
    print("saved", slug, "->", out_path, img.size)
