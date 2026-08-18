from PIL import Image
import os

DOWNLOADS = os.path.join(os.path.dirname(__file__), "..", "..")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "teams")

MAPPING = {
    "La fama.gif": "la-fama",
    "OIP.webp": "sporting",
    "OIP (1).webp": "river-plate",
}

MAX_SIZE = (320, 320)

for src_name, slug in MAPPING.items():
    src_path = os.path.join(DOWNLOADS, src_name)
    img = Image.open(src_path).convert("RGBA")
    img.thumbnail(MAX_SIZE, Image.LANCZOS)
    out_path = os.path.join(OUT_DIR, slug + ".webp")
    img.save(out_path, "WEBP", quality=90, method=6)
    print("saved", slug, "->", out_path, img.size)
