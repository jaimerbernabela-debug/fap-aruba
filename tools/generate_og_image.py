"""Dev-only helper: generates assets/img/og-image.png (1200x630) for social sharing.
Not shipped as part of the runtime site logic; safe to delete after running.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "og-image.png")

PRIMARY_DARK = (9, 94, 102)
PRIMARY = (14, 124, 134)
SAND = (246, 244, 236)
ACCENT = (240, 166, 61)
WHITE = (255, 255, 255)

img = Image.new("RGB", (W, H), SAND)
draw = ImageDraw.Draw(img)

# Diagonal gradient-ish band background using two triangles
for x in range(W):
    t = x / W
    r = int(PRIMARY_DARK[0] + (PRIMARY[0] - PRIMARY_DARK[0]) * t)
    g = int(PRIMARY_DARK[1] + (PRIMARY[1] - PRIMARY_DARK[1]) * t)
    b = int(PRIMARY_DARK[2] + (PRIMARY[2] - PRIMARY_DARK[2]) * t)
    draw.line([(x, 0), (x, H)], fill=(r, g, b))

# Sand panel at the bottom for contrast / brand feel
draw.rectangle([0, H - 130, W, H], fill=SAND)

# Decorative circles (team badge stand-ins)
import random
random.seed(7)
colors = [(29,78,216),(5,150,105),(180,83,9),(124,58,237),(220,38,38),(8,145,178),(202,138,4),(190,18,60),(13,148,136),(67,56,202)]
for i, c in enumerate(colors):
    cx = 120 + i * 105
    cy = 500
    r = 26
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=c, outline=WHITE, width=4)

def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

f_logo = load_font("C:/Windows/Fonts/arialbd.ttf", 150)
f_tag = load_font("C:/Windows/Fonts/segoeuib.ttf", 40)
f_sub = load_font("C:/Windows/Fonts/segoeui.ttf", 30)

draw.text((70, 90), "FAP", font=f_logo, fill=WHITE)
draw.text((74, 260), "Futbol Aruba Predición", font=f_tag, fill=WHITE)
draw.text((74, 320), "Predicciones de la Primera División de Aruba", font=f_sub, fill=(224, 240, 239))
draw.text((70, H - 95), "Arrastra · Predice · Descarga · Compara con la afición", font=load_font("C:/Windows/Fonts/segoeui.ttf", 26), fill=PRIMARY_DARK)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT, "PNG")
print("saved", OUT, img.size)
