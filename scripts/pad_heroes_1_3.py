"""
One-off script: add 15px transparent left padding to all Heroes 1-3 PNG frames
so their canvas layout matches Heroes 4-6 (character content at X≈17).

Run from the repo root:
    python3 scripts/pad_heroes_1_3.py
"""
from PIL import Image
from pathlib import Path

ROOT = Path("public/assets/heroes")
HEROES = ["Hero 1", "Hero 2", "Hero 3"]
PAD_LEFT = 15

for hero in HEROES:
    pngs = sorted((ROOT / hero).rglob("*.png"))
    print(f"\n{hero} — {len(pngs)} files")
    for png in pngs:
        img = Image.open(png).convert("RGBA")
        new = Image.new("RGBA", (img.width + PAD_LEFT, img.height), (0, 0, 0, 0))
        new.paste(img, (PAD_LEFT, 0))
        new.save(png)
        print(f"  {png.relative_to(ROOT)}  {img.width}x{img.height} → {new.width}x{new.height}")

print("\nDone.")
