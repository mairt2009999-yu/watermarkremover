#!/usr/bin/env python3
"""
Ultra watermark regeneration for Landing Page
- Fetches fresh images from Unsplash
- Creates AFTER (clean) images in required sizes
- Creates BEFORE (full-image, obvious watermark) per type
- Saves into public/demo/generated with the exact filenames used by the site
"""

import io
import os
import time
import requests
from typing import Tuple
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

OUTPUT_DIR = "public/demo/generated"
HERO_SIZE = (1200, 600)
SHOWCASE_SIZE = (1200, 675)

THEME_COLORS = {
    "primary": (34, 139, 34),
    "background": (250, 250, 250),
    "text_dark": (51, 51, 51),
    "text_light": (128, 128, 128),
    "red": (220, 53, 69),
    "blue": (13, 110, 253),
}

IMAGES = {
    # Hero: Food
    "food": {
        "url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&q=85",
        "size": HERO_SIZE,
        "after": "food_photography_clean.webp",
        "before": "food_photography_text_center.webp",
        "style": {"type": "text", "text": "FOOD STOCK"},
    },
    # Visible text/logo: Product
    "product": {
        "url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1600&q=85",
        "size": SHOWCASE_SIZE,
        "after": "product_photography_clean.webp",
        "before": "product_photography_text_center.webp",
        "style": {"type": "text", "text": "PRODUCT DEMO"},
    },
    # Semi-transparent logo: Nature
    "nature": {
        "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85",
        "size": SHOWCASE_SIZE,
        "after": "nature_landscape_clean.webp",
        "before": "nature_landscape_logo.webp",
        "style": {"type": "logo"},
    },
    # Embedded digital: Portrait
    "portrait": {
        "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=85",
        "size": SHOWCASE_SIZE,
        "after": "portrait_photography_clean.webp",
        "before": "portrait_photography_embedded.webp",
        "style": {"type": "embedded"},
    },
    # Repetitive pattern: Architecture
    "architecture": {
        "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=85",
        "size": SHOWCASE_SIZE,
        "after": "architecture_building_clean.webp",
        "before": "architecture_building_pattern_grid.webp",
        "style": {"type": "pattern"},
    },
}


def get_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def download_and_fit(url: str, target_size: Tuple[int, int]) -> Image.Image:
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    img = Image.open(io.BytesIO(r.content)).convert("RGB")

    # Crop to aspect ratio
    tr = target_size[0] / target_size[1]
    rimg = img.width / img.height
    if rimg > tr:
        new_w = int(img.height * tr)
        left = (img.width - new_w) // 2
        img = img.crop((left, 0, left + new_w, img.height))
    else:
        new_h = int(img.width / tr)
        top = (img.height - new_h) // 2
        img = img.crop((0, top, img.width, top + new_h))
    img = img.resize(target_size, Image.Resampling.LANCZOS)

    # Mild enhance
    img = ImageEnhance.Sharpness(img).enhance(1.05)
    img = ImageEnhance.Color(img).enhance(1.04)
    return img


def save_webp(img: Image.Image, name: str):
    path = os.path.join(OUTPUT_DIR, name)
    img.save(path, "WEBP", quality=86, method=6)


# Watermark styles

def wm_text_full(img: Image.Image, text: str) -> Image.Image:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    color = THEME_COLORS["red"]
    base = max(min(img.width, img.height) // 6, 48)
    font = get_font(base)
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (img.width - tw) // 2
    y = (img.height - th) // 2
    pad = max(img.width, img.height) // 50
    d.rounded_rectangle((x - pad, y - pad, x + tw + pad, y + th + pad), radius=16,
                        fill=(255, 255, 255, 230), outline=(*color, 255), width=6)
    d.text((x, y), text, font=font, fill=(*color, 255))
    # Diagonal stripes
    step = max(min(img.width, img.height) // 20, 40)
    for i in range(-img.height, img.width + img.height, step):
        d.line([(i, 0), (i + img.height, img.height)], fill=(*color, 40), width=3)
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def wm_logo_full(img: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    primary, accent = THEME_COLORS["blue"], THEME_COLORS["red"]
    grid = max(min(img.width, img.height) // 5, 160)
    size = grid // 2
    font_c = get_font(size // 3)
    font_l = get_font(size // 4)
    for gy in range(grid // 2, img.height, grid):
        for gx in range(grid // 2, img.width, grid):
            x1, y1 = gx - size // 2, gy - size // 2
            x2, y2 = x1 + size, y1 + size
            d.ellipse([x1, y1, x2, y2], fill=(255, 255, 255, 230))
            d.ellipse([x1, y1, x2, y2], outline=(*primary, 255), width=6)
            cb = d.textbbox((0, 0), "©", font=font_c)
            d.text((gx - (cb[2]-cb[0])//2, gy - (cb[3]-cb[1])//2), "©", font=font_c, fill=(*accent, 255))
            label = "WATERMARK"
            lb = d.textbbox((0, 0), label, font=font_l)
            lw = lb[2] - lb[0]
            d.rounded_rectangle((gx - lw//2 - 8, y2 + 6, gx + lw//2 + 8, y2 + 6 + (lb[3]-lb[1]) + 6),
                                radius=6, fill=(255, 255, 255, 230))
            d.text((gx - lw//2, y2 + 8), label, font=font_l, fill=(*primary, 255))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def wm_pattern_full(img: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    primary, red = THEME_COLORS["primary"], THEME_COLORS["red"]
    spacing = max(min(img.width, img.height) // 10, 80)
    # grid
    for x in range(0, img.width, spacing):
        d.line([(x, 0), (x, img.height)], fill=(*primary, 255), width=3)
    for y in range(0, img.height, spacing):
        d.line([(0, y), (img.width, y)], fill=(*primary, 255), width=3)
    # circles + SAMPLE
    r = spacing // 5
    font_c = get_font(spacing // 4)
    font_l = get_font(spacing // 5)
    for x in range(spacing // 2, img.width, spacing):
        for y in range(spacing // 2, img.height, spacing):
            d.ellipse([x - r, y - r, x + r, y + r], outline=(*primary, 255), width=3)
            cb = d.textbbox((0, 0), "C", font=font_c)
            d.text((x - (cb[2]-cb[0])//2, y - (cb[3]-cb[1])//2), "C", font=font_c, fill=(*primary, 255))
            label = "SAMPLE"
            lb = d.textbbox((0, 0), label, font=font_l)
            lw, lh = lb[2] - lb[0], lb[3] - lb[1]
            d.rounded_rectangle((x - lw//2 - 6, y + r + 6, x + lw//2 + 6, y + r + 6 + lh + 6),
                                radius=4, fill=(255, 255, 255, 230))
            d.text((x - lw//2, y + r + 8), label, font=font_l, fill=(*red, 255))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def wm_embedded_full(img: Image.Image) -> Image.Image:
    tint = Image.new("RGBA", img.size, (*THEME_COLORS["blue"], 60))
    base = Image.alpha_composite(img.convert("RGBA"), tint)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    font = get_font(max(min(img.width, img.height) // 12, 36))
    step_x = max(img.width // 6, 180)
    step_y = max(img.height // 6, 140)
    for y in range(-step_y, img.height + step_y, step_y):
        for x in range(-step_x, img.width + step_x, step_x):
            d.text((x, y), "PROTECTED", font=font, fill=(*THEME_COLORS["red"], 160))
    return Image.alpha_composite(base, overlay).convert("RGB")


STYLE_FN = {
    "text": wm_text_full,
    "logo": lambda im: wm_logo_full(im),
    "pattern": lambda im: wm_pattern_full(im),
    "embedded": lambda im: wm_embedded_full(im),
}


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Ultra regeneration started…")
    for key, cfg in IMAGES.items():
        print(f"\n→ {key}: downloading & preparing…")
        try:
            img = download_and_fit(cfg["url"], cfg["size"])
        except Exception as e:
            print(f"  ✖ download failed: {e}")
            continue
        # AFTER (clean)
        save_webp(img, cfg["after"])
        print(f"  ✓ saved AFTER: {cfg['after']}")
        # BEFORE (full watermark)
        style = cfg["style"]["type"]
        fn = STYLE_FN[style]
        if style == "text":
            wm = fn(img, cfg["style"]["text"])  # type: ignore
        else:
            wm = fn(img)
        save_webp(wm, cfg["before"])
        print(f"  ✓ saved BEFORE: {cfg['before']}")
        time.sleep(0.5)
    print("\nAll landing assets regenerated.")


if __name__ == "__main__":
    main()