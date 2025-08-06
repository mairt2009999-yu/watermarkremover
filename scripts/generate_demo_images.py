#!/usr/bin/env python3
"""
Demo Image Generator with Watermarks
Generates demo images with various watermark types for testing watermark removal
"""

import os
import sys
import json
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
from io import BytesIO
import random
from typing import Tuple, List, Dict

# Configuration
UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY', 'YOUR_ACCESS_KEY_HERE')
OUTPUT_DIR = 'public/demo/generated'
IMAGE_CATEGORIES = [
    'nature landscape',
    'architecture building',
    'product photography',
    'portrait photography',
    'abstract art',
    'food photography'
]

WATERMARK_TYPES = {
    'text_overlay': {
        'text': 'SAMPLE',
        'opacity': 0.5,
        'position': 'center'
    },
    'logo_pattern': {
        'pattern': 'diagonal',
        'opacity': 0.3,
        'spacing': 150
    },
    'corner_mark': {
        'text': '© DEMO',
        'position': 'bottom-right',
        'opacity': 0.7
    },
    'subtle_embed': {
        'text': 'watermark',
        'opacity': 0.15,
        'blend_mode': 'overlay'
    },
    'grid_pattern': {
        'text': 'PROTECTED',
        'grid_size': 4,
        'opacity': 0.25
    }
}

class DemoImageGenerator:
    def __init__(self):
        self.ensure_output_dir()
        
    def ensure_output_dir(self):
        """Create output directory if it doesn't exist"""
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)
            print(f"Created output directory: {OUTPUT_DIR}")
    
    def download_unsplash_image(self, query: str, size: Tuple[int, int] = (800, 600)) -> Image.Image:
        """Download a royalty-free image from Unsplash"""
        if UNSPLASH_ACCESS_KEY == 'YOUR_ACCESS_KEY_HERE':
            print("Note: Using placeholder image. Set UNSPLASH_ACCESS_KEY for real images.")
            return self.create_placeholder_image(query, size)
        
        url = f"https://api.unsplash.com/photos/random"
        params = {
            'query': query,
            'orientation': 'landscape',
            'client_id': UNSPLASH_ACCESS_KEY
        }
        
        try:
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                image_url = data['urls']['regular']
                img_response = requests.get(image_url)
                return Image.open(BytesIO(img_response.content)).resize(size, Image.Resampling.LANCZOS)
            else:
                print(f"Failed to fetch from Unsplash: {response.status_code}")
                return self.create_placeholder_image(query, size)
        except Exception as e:
            print(f"Error downloading image: {e}")
            return self.create_placeholder_image(query, size)
    
    def create_placeholder_image(self, category: str, size: Tuple[int, int]) -> Image.Image:
        """Create a placeholder image with gradient background"""
        img = Image.new('RGB', size)
        draw = ImageDraw.Draw(img)
        
        # Create gradient background
        colors = {
            'nature': [(34, 139, 34), (144, 238, 144)],  # Green gradient
            'architecture': [(70, 130, 180), (176, 196, 222)],  # Blue gradient
            'product': [(255, 140, 0), (255, 218, 185)],  # Orange gradient
            'portrait': [(199, 21, 133), (255, 182, 193)],  # Pink gradient
            'abstract': [(138, 43, 226), (221, 160, 221)],  # Purple gradient
            'food': [(255, 69, 0), (255, 160, 122)]  # Red-orange gradient
        }
        
        # Determine color based on category
        gradient_colors = colors.get(category.split()[0].lower(), colors['abstract'])
        
        # Create vertical gradient
        for y in range(size[1]):
            ratio = y / size[1]
            r = int(gradient_colors[0][0] * (1 - ratio) + gradient_colors[1][0] * ratio)
            g = int(gradient_colors[0][1] * (1 - ratio) + gradient_colors[1][1] * ratio)
            b = int(gradient_colors[0][2] * (1 - ratio) + gradient_colors[1][2] * ratio)
            draw.rectangle([(0, y), (size[0], y + 1)], fill=(r, g, b))
        
        # Add some texture using numpy for noise
        img_array = np.array(img)
        noise = np.random.normal(0, 5, img_array.shape)
        img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(img_array)
        
        # Recreate draw object after image conversion
        draw = ImageDraw.Draw(img)
        
        # Add category text
        try:
            font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 40)
        except:
            font = ImageFont.load_default()
        
        text = category.upper()
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
        
        # Draw text with shadow
        shadow_offset = 3
        draw.text((position[0] + shadow_offset, position[1] + shadow_offset), 
                 text, fill=(0, 0, 0, 128), font=font)
        draw.text(position, text, fill=(255, 255, 255, 200), font=font)
        
        return img
    
    def add_text_watermark(self, img: Image.Image, text: str, 
                          position: str = 'center', opacity: float = 0.5) -> Image.Image:
        """Add a text watermark to the image"""
        # Create a transparent overlay
        txt_layer = Image.new('RGBA', img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)
        
        # Try to use a nice font
        try:
            font_size = min(img.size) // 10
            font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        if position == 'center':
            pos = ((img.size[0] - text_width) // 2, (img.size[1] - text_height) // 2)
        elif position == 'bottom-right':
            pos = (img.size[0] - text_width - 20, img.size[1] - text_height - 20)
        elif position == 'top-left':
            pos = (20, 20)
        else:
            pos = ((img.size[0] - text_width) // 2, (img.size[1] - text_height) // 2)
        
        # Draw the text with specified opacity
        alpha = int(255 * opacity)
        draw.text(pos, text, fill=(255, 255, 255, alpha), font=font, stroke_width=2, stroke_fill=(0, 0, 0, alpha))
        
        # Composite the watermark
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        watermarked = Image.alpha_composite(img, txt_layer)
        return watermarked.convert('RGB')
    
    def add_pattern_watermark(self, img: Image.Image, text: str = 'WATERMARK',
                             pattern: str = 'diagonal', opacity: float = 0.3,
                             spacing: int = 150) -> Image.Image:
        """Add a repeating pattern watermark"""
        txt_layer = Image.new('RGBA', img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)
        
        try:
            font_size = spacing // 6
            font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
        except:
            font = ImageFont.load_default()
        
        alpha = int(255 * opacity)
        
        if pattern == 'diagonal':
            # Diagonal pattern
            for y in range(-img.size[1], img.size[1] * 2, spacing):
                for x in range(-img.size[0], img.size[0] * 2, spacing):
                    # Rotate text for diagonal effect
                    temp_img = Image.new('RGBA', (len(text) * font_size, font_size * 2), (255, 255, 255, 0))
                    temp_draw = ImageDraw.Draw(temp_img)
                    temp_draw.text((0, 0), text, fill=(255, 255, 255, alpha), font=font)
                    rotated = temp_img.rotate(45, expand=1)
                    txt_layer.paste(rotated, (x, y), rotated)
        else:
            # Grid pattern
            for y in range(0, img.size[1], spacing):
                for x in range(0, img.size[0], spacing):
                    draw.text((x, y), text, fill=(255, 255, 255, alpha), font=font)
        
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        watermarked = Image.alpha_composite(img, txt_layer)
        return watermarked.convert('RGB')
    
    def add_logo_watermark(self, img: Image.Image, opacity: float = 0.4) -> Image.Image:
        """Add a logo-style watermark"""
        # Create a simple logo shape
        logo_size = min(img.size) // 5
        logo = Image.new('RGBA', (logo_size, logo_size), (255, 255, 255, 0))
        draw = ImageDraw.Draw(logo)
        
        # Draw a simple geometric logo
        alpha = int(255 * opacity)
        # Circle
        draw.ellipse([10, 10, logo_size-10, logo_size-10], 
                    outline=(255, 255, 255, alpha), width=5)
        # Inner design
        draw.polygon([(logo_size//2, 20), (20, logo_size-20), 
                     (logo_size-20, logo_size-20)], 
                    fill=(255, 255, 255, alpha//2))
        
        # Place logo in corner
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        img_with_logo = img.copy()
        img_with_logo.paste(logo, (img.size[0] - logo_size - 20, 
                                   img.size[1] - logo_size - 20), logo)
        
        return img_with_logo.convert('RGB')
    
    def add_embedded_watermark(self, img: Image.Image, text: str = 'PROTECTED',
                              opacity: float = 0.1) -> Image.Image:
        """Add a subtle embedded watermark"""
        # Create large text across the image
        txt_layer = Image.new('RGBA', img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)
        
        try:
            font_size = min(img.size) // 3
            font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
        except:
            font = ImageFont.load_default()
        
        # Center the text
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((img.size[0] - text_width) // 2, (img.size[1] - text_height) // 2)
        
        # Very subtle watermark
        alpha = int(255 * opacity)
        draw.text(position, text, fill=(128, 128, 128, alpha), font=font)
        
        # Apply gaussian blur for subtlety
        txt_layer = txt_layer.filter(ImageFilter.GaussianBlur(radius=3))
        
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        watermarked = Image.alpha_composite(img, txt_layer)
        return watermarked.convert('RGB')
    
    def generate_demo_set(self):
        """Generate a complete set of demo images"""
        generated_files = []
        
        for i, category in enumerate(IMAGE_CATEGORIES):
            print(f"\nGenerating images for: {category}")
            
            # Get base image
            base_img = self.download_unsplash_image(category)
            
            # Save original (without watermark)
            clean_filename = f"{category.replace(' ', '_')}_clean.jpg"
            clean_path = os.path.join(OUTPUT_DIR, clean_filename)
            base_img.save(clean_path, quality=95)
            print(f"  ✓ Saved clean version: {clean_filename}")
            
            # Generate different watermark versions
            watermark_configs = [
                ('text_center', lambda img: self.add_text_watermark(img, 'SAMPLE', 'center', 0.5)),
                ('text_corner', lambda img: self.add_text_watermark(img, '© DEMO 2024', 'bottom-right', 0.7)),
                ('pattern_diagonal', lambda img: self.add_pattern_watermark(img, 'WATERMARK', 'diagonal', 0.3)),
                ('pattern_grid', lambda img: self.add_pattern_watermark(img, 'DEMO', 'grid', 0.25)),
                ('logo', lambda img: self.add_logo_watermark(img, 0.4)),
                ('embedded', lambda img: self.add_embedded_watermark(img, 'PROTECTED', 0.15))
            ]
            
            for watermark_type, watermark_func in watermark_configs:
                watermarked_img = watermark_func(base_img.copy())
                watermarked_filename = f"{category.replace(' ', '_')}_{watermark_type}.jpg"
                watermarked_path = os.path.join(OUTPUT_DIR, watermarked_filename)
                watermarked_img.save(watermarked_path, quality=95)
                print(f"  ✓ Saved watermarked version: {watermarked_filename}")
                
                generated_files.append({
                    'category': category,
                    'type': watermark_type,
                    'watermarked': watermarked_filename,
                    'clean': clean_filename
                })
        
        # Save metadata
        metadata_path = os.path.join(OUTPUT_DIR, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump({
                'generated_files': generated_files,
                'watermark_types': list(WATERMARK_TYPES.keys()),
                'categories': IMAGE_CATEGORIES
            }, f, indent=2)
        print(f"\n✓ Saved metadata to: {metadata_path}")
        
        return generated_files

def main():
    print("=" * 50)
    print("Demo Image Generator with Watermarks")
    print("=" * 50)
    
    generator = DemoImageGenerator()
    
    print("\nThis script will generate demo images with various watermark types.")
    print("Images will be saved to:", OUTPUT_DIR)
    print("\nWatermark types to be generated:")
    for wm_type in WATERMARK_TYPES:
        print(f"  • {wm_type}")
    
    input("\nPress Enter to start generation...")
    
    generated = generator.generate_demo_set()
    
    print("\n" + "=" * 50)
    print(f"✓ Successfully generated {len(generated)} image pairs!")
    print(f"✓ Images saved to: {OUTPUT_DIR}")
    print("=" * 50)

if __name__ == "__main__":
    main()
