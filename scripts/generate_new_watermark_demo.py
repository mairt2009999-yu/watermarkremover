#!/usr/bin/env python3
"""
New Watermark Demo Image Generator
Generates watermarked and clean images for the new 4-category watermark system
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import random
import numpy as np

# Configuration
SOURCE_DIR = 'public/demo/source'
WATERMARKED_DIR = 'public/demo/watermarked'
CLEAN_DIR = 'public/demo/clean'
OUTPUT_SIZE = (800, 600)
JPEG_QUALITY = 90

class NewWatermarkGenerator:
    def __init__(self):
        self.ensure_output_dirs()
        self.base_images = self.load_base_images()
        
    def ensure_output_dirs(self):
        """Create output directories if they don't exist"""
        for directory in [WATERMARKED_DIR, CLEAN_DIR]:
            if not os.path.exists(directory):
                os.makedirs(directory)
                print(f"Created directory: {directory}")

    def create_realistic_photo_base(self, photo_type: str) -> Image.Image:
        """Create realistic photography-style base images"""
        img = Image.new('RGB', OUTPUT_SIZE)
        draw = ImageDraw.Draw(img)
        
        if photo_type == 'portrait':
            # Professional portrait style with bokeh effect
            # Create radial gradient for depth of field simulation
            center_x, center_y = OUTPUT_SIZE[0] // 2, OUTPUT_SIZE[1] // 3
            max_radius = min(OUTPUT_SIZE) // 2
            
            # Background colors - warm studio lighting
            bg_colors = [(240, 235, 220), (200, 190, 175)]  # Warm beige/brown
            
            img_array = np.zeros((OUTPUT_SIZE[1], OUTPUT_SIZE[0], 3), dtype=np.uint8)
            
            for y in range(OUTPUT_SIZE[1]):
                for x in range(OUTPUT_SIZE[0]):
                    # Calculate distance from portrait center
                    distance = math.sqrt((x - center_x)**2 + (y - center_y)**2)
                    ratio = min(distance / max_radius, 1.0)
                    
                    # Create bokeh-like blur effect
                    blur_factor = ratio * 0.8 + 0.2
                    r = int(bg_colors[0][0] * (1 - blur_factor) + bg_colors[1][0] * blur_factor)
                    g = int(bg_colors[0][1] * (1 - blur_factor) + bg_colors[1][1] * blur_factor)
                    b = int(bg_colors[0][2] * (1 - blur_factor) + bg_colors[1][2] * blur_factor)
                    
                    img_array[y, x] = [r, g, b]
            
            # Add subtle lighting gradient from top-left
            for y in range(OUTPUT_SIZE[1]):
                for x in range(OUTPUT_SIZE[0]):
                    light_intensity = 1.0 - (x + y) / (OUTPUT_SIZE[0] + OUTPUT_SIZE[1]) * 0.3
                    img_array[y, x] = np.clip(img_array[y, x] * light_intensity, 0, 255)
            
            img = Image.fromarray(img_array.astype(np.uint8))
            
            # Add soft focus circles to simulate bokeh
            overlay = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
            overlay_draw = ImageDraw.Draw(overlay)
            
            for _ in range(20):
                x = random.randint(0, OUTPUT_SIZE[0])
                y = random.randint(0, OUTPUT_SIZE[1])
                radius = random.randint(5, 25)
                alpha = random.randint(10, 30)
                color = (255, 255, 255, alpha)
                overlay_draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
            
            img = img.convert('RGBA')
            img = Image.alpha_composite(img, overlay)
            img = img.convert('RGB')
            
        elif photo_type == 'product':
            # Clean product photography style with studio lighting
            # White to light gray gradient background
            base_color = (248, 248, 248)
            shadow_color = (220, 220, 220)
            
            # Create smooth vertical gradient
            for y in range(OUTPUT_SIZE[1]):
                ratio = (y / OUTPUT_SIZE[1]) * 0.3  # Subtle gradient
                r = int(base_color[0] * (1 - ratio) + shadow_color[0] * ratio)
                g = int(base_color[1] * (1 - ratio) + shadow_color[1] * ratio)
                b = int(base_color[2] * (1 - ratio) + shadow_color[2] * ratio)
                draw.rectangle([(0, y), (OUTPUT_SIZE[0], y + 1)], fill=(r, g, b))
            
            # Add subtle radial lighting from center-top
            center_x = OUTPUT_SIZE[0] // 2
            light_y = OUTPUT_SIZE[1] // 4
            
            overlay = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
            overlay_draw = ImageDraw.Draw(overlay)
            
            # Central highlight
            for radius in range(100, 200, 20):
                alpha = max(0, 15 - (radius - 100) // 10)
                overlay_draw.ellipse([center_x-radius, light_y-radius//2, 
                                    center_x+radius, light_y+radius//2], 
                                   fill=(255, 255, 255, alpha))
            
            img = img.convert('RGBA')
            img = Image.alpha_composite(img, overlay)
            img = img.convert('RGB')
            
        elif photo_type == 'landscape':
            # Natural landscape with sky and ground
            sky_colors = [(135, 206, 250), (255, 255, 255)]  # Sky blue to white
            ground_colors = [(34, 139, 34), (107, 142, 35)]  # Green tones
            
            horizon_y = int(OUTPUT_SIZE[1] * 0.4)  # Horizon at 40% from top
            
            # Sky gradient
            for y in range(horizon_y):
                ratio = y / horizon_y
                r = int(sky_colors[0][0] * (1 - ratio) + sky_colors[1][0] * ratio)
                g = int(sky_colors[0][1] * (1 - ratio) + sky_colors[1][1] * ratio)
                b = int(sky_colors[0][2] * (1 - ratio) + sky_colors[1][2] * ratio)
                draw.rectangle([(0, y), (OUTPUT_SIZE[0], y + 1)], fill=(r, g, b))
            
            # Ground gradient
            for y in range(horizon_y, OUTPUT_SIZE[1]):
                ratio = (y - horizon_y) / (OUTPUT_SIZE[1] - horizon_y)
                r = int(ground_colors[0][0] * (1 - ratio) + ground_colors[1][0] * ratio)
                g = int(ground_colors[0][1] * (1 - ratio) + ground_colors[1][1] * ratio)
                b = int(ground_colors[0][2] * (1 - ratio) + ground_colors[1][2] * ratio)
                draw.rectangle([(0, y), (OUTPUT_SIZE[0], y + 1)], fill=(r, g, b))
            
            # Add cloud-like shapes in sky
            overlay = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
            overlay_draw = ImageDraw.Draw(overlay)
            
            for _ in range(5):
                x = random.randint(-50, OUTPUT_SIZE[0] + 50)
                y = random.randint(20, horizon_y - 20)
                width = random.randint(80, 150)
                height = random.randint(30, 60)
                overlay_draw.ellipse([x, y, x+width, y+height], fill=(255, 255, 255, 40))
            
            img = img.convert('RGBA')
            img = Image.alpha_composite(img, overlay)
            img = img.convert('RGB')
            
        elif photo_type == 'architecture':
            # Architectural style with geometric elements and clean lines
            base_colors = [(100, 100, 120), (180, 180, 190)]  # Blue-gray tones
            
            # Create angular gradient
            for y in range(OUTPUT_SIZE[1]):
                for x in range(OUTPUT_SIZE[0]):
                    # Create geometric pattern
                    ratio_x = x / OUTPUT_SIZE[0]
                    ratio_y = y / OUTPUT_SIZE[1]
                    combined_ratio = (ratio_x + ratio_y) / 2
                    
                    r = int(base_colors[0][0] * (1 - combined_ratio) + base_colors[1][0] * combined_ratio)
                    g = int(base_colors[0][1] * (1 - combined_ratio) + base_colors[1][1] * combined_ratio)
                    b = int(base_colors[0][2] * (1 - combined_ratio) + base_colors[1][2] * combined_ratio)
                    
                    # Add some geometric variation
                    if (x // 40 + y // 40) % 2 == 0:
                        r = min(255, r + 10)
                        g = min(255, g + 10)
                        b = min(255, b + 10)
                    
                    draw.point((x, y), fill=(r, g, b))
            
        else:  # lifestyle/general
            # Warm, lifestyle photography tones
            colors = [(255, 240, 220), (220, 200, 180)]  # Warm cream tones
            
            # Diagonal gradient for dynamic feel
            for y in range(OUTPUT_SIZE[1]):
                for x in range(OUTPUT_SIZE[0]):
                    ratio = ((x + y) / (OUTPUT_SIZE[0] + OUTPUT_SIZE[1])) * 0.7 + 0.15
                    r = int(colors[0][0] * (1 - ratio) + colors[1][0] * ratio)
                    g = int(colors[0][1] * (1 - ratio) + colors[1][1] * ratio)
                    b = int(colors[0][2] * (1 - ratio) + colors[1][2] * ratio)
                    draw.point((x, y), fill=(r, g, b))
        
        # Add subtle noise for photographic texture
        img_array = np.array(img)
        noise = np.random.normal(0, 2, img_array.shape)
        img_array = np.clip(img_array + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(img_array)
        
        return img

    def load_base_images(self):
        """Generate realistic photography-style base images"""
        print("Generating realistic photography base images...")
        base_images = {}
        
        # Map to photography styles based on competition research
        photo_types = {
            'portrait': 'portrait',      # Professional portrait with bokeh
            'product': 'product',        # Clean product photography
            'landscape': 'landscape',    # Natural landscape scene
            'architecture': 'architecture', # Architectural/geometric style
            'lifestyle': 'lifestyle'     # Lifestyle/general photography
        }
        
        for category, photo_type in photo_types.items():
            try:
                image = self.create_realistic_photo_base(photo_type)
                base_images[category] = image
                print(f"Generated {photo_type} style base image: {category}")
            except Exception as e:
                print(f"Error generating {category}: {e}")
        
        return base_images

    def get_font(self, size):
        """Get font for text watermarks"""
        try:
            # Try to use system fonts
            return ImageFont.truetype('/System/Library/Fonts/Arial.ttc', size)
        except:
            try:
                return ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', size)
            except:
                print("Warning: Using default font")
                return ImageFont.load_default()

    def safe_paste(self, base_img, overlay_img, position, mask=None):
        """Safely paste overlay ensuring no clipping"""
        x, y = position
        
        # Ensure coordinates are not negative
        x = max(0, x)
        y = max(0, y)
        
        # Ensure overlay doesn't exceed base image bounds
        max_width = min(overlay_img.width, base_img.width - x)
        max_height = min(overlay_img.height, base_img.height - y)
        
        if max_width > 0 and max_height > 0:
            # Crop overlay if necessary
            if max_width < overlay_img.width or max_height < overlay_img.height:
                overlay_img = overlay_img.crop((0, 0, max_width, max_height))
                if mask:
                    mask = mask.crop((0, 0, max_width, max_height))
            
            base_img.paste(overlay_img, (x, y), mask if mask else overlay_img)
        else:
            print(f"Warning: Cannot paste overlay at position ({x}, {y}) - would be outside bounds")
        
        return base_img

    def validate_font(self, font, test_text="TEST"):
        """Validate that font works correctly"""
        try:
            # Create temporary draw to test font
            temp_img = Image.new('RGB', (100, 50))
            temp_draw = ImageDraw.Draw(temp_img)
            bbox = temp_draw.textbbox((0, 0), test_text, font=font)
            
            # Check if bbox is valid
            width = bbox[2] - bbox[0]
            height = bbox[3] - bbox[1]
            
            return width > 0 and height > 0
        except:
            return False

    def generate_text_watermarks(self):
        """Generate professional text watermark images based on industry standards"""
        print("\n=== Generating Professional Text Watermarks ===")
        
        # 1. Professional corner copyright - Getty Images style
        base_img = self.base_images.get('portrait', list(self.base_images.values())[0])
        watermarked = base_img.copy()
        
        # Create overlay layer for Getty-style watermark
        overlay = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        font = self.get_font(18)
        text = "© 2024 Sarah Johnson Photography"
        
        # Calculate bottom-right position (professional standard)
        bbox = overlay_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Position: 5-10% from edges (professional standard)
        margin_x = int(OUTPUT_SIZE[0] * 0.05)
        margin_y = int(OUTPUT_SIZE[1] * 0.05)
        x = OUTPUT_SIZE[0] - text_width - margin_x
        y = OUTPUT_SIZE[1] - text_height - margin_y
        
        # Getty Images style: semi-transparent background
        padding = 8
        overlay_draw.rectangle([x-padding, y-padding, x+text_width+padding, y+text_height+padding], 
                              fill=(128, 128, 128, 100))  # Gray background, 40% opacity
        
        # White text with good contrast
        overlay_draw.text((x, y), text, fill=(255, 255, 255, 220), font=font)
        
        watermarked = watermarked.convert('RGBA')
        watermarked = Image.alpha_composite(watermarked, overlay)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'text_corner_professional.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'text_corner_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: text_corner_professional.jpg (Getty Images style)")
        
        # 2. Stock photo center protection - Strong watermark
        base_img = self.base_images.get('landscape', list(self.base_images.values())[1])
        watermarked = base_img.copy()
        
        overlay = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        font = self.get_font(64)
        text = "STOCK PHOTO"
        
        # Center positioning for maximum protection
        bbox = overlay_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (OUTPUT_SIZE[0] - text_width) // 2
        y = (OUTPUT_SIZE[1] - text_height) // 2
        
        # Strong watermark with shadow for visibility
        overlay_draw.text((x+3, y+3), text, fill=(0, 0, 0, 120), font=font)  # Shadow
        overlay_draw.text((x, y), text, fill=(255, 255, 255, 160), font=font)  # Main text
        
        # Add subtle background tint
        overlay_draw.rectangle([0, 0, OUTPUT_SIZE[0], OUTPUT_SIZE[1]], 
                              fill=(255, 255, 255, 15))
        
        watermarked = watermarked.convert('RGBA')
        watermarked = Image.alpha_composite(watermarked, overlay)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'text_center_stock.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'text_center_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: text_center_stock.jpg (Stock photo protection style)")
        
        # 3. Website URL watermark - Professional photographer style  
        base_img = self.base_images.get('product', list(self.base_images.values())[2])
        watermarked = base_img.copy()
        
        overlay = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        font = self.get_font(16)
        text = "ProPhotoStudio.com"
        
        # Bottom-left corner positioning (alternative professional style)
        bbox = overlay_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        margin_x = int(OUTPUT_SIZE[0] * 0.03)
        margin_y = int(OUTPUT_SIZE[1] * 0.03)
        x = margin_x
        y = OUTPUT_SIZE[1] - text_height - margin_y
        
        # Subtle watermark - 35% opacity (professional standard)
        overlay_draw.text((x, y), text, fill=(255, 255, 255, 90), font=font)
        
        watermarked = watermarked.convert('RGBA')
        watermarked = Image.alpha_composite(watermarked, overlay)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'text_website_url.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'text_website_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: text_website_url.jpg (Professional photographer style)")

    def generate_logo_watermarks(self):
        """Generate professional logo watermark images based on industry standards"""
        print("\n=== Generating Professional Logo Watermarks ===")
        
        # 1. Photography studio logo - Professional corner placement
        base_img = self.base_images.get('architecture', list(self.base_images.values())[0])
        watermarked = base_img.copy()
        
        # Create professional photography studio logo
        logo_size = 80
        logo_img = Image.new('RGBA', (logo_size, logo_size), (255, 255, 255, 0))
        logo_draw = ImageDraw.Draw(logo_img)
        
        center = logo_size // 2
        
        # Camera-inspired logo design
        # Outer circle (lens)
        logo_draw.ellipse([10, 10, logo_size-10, logo_size-10], 
                         outline=(255, 255, 255, 180), width=3)
        
        # Inner circle (aperture)
        inner_radius = 15
        logo_draw.ellipse([center-inner_radius, center-inner_radius, 
                          center+inner_radius, center+inner_radius], 
                         outline=(255, 255, 255, 160), width=2)
        
        # Add studio initials
        font = self.get_font(24)
        text = "SJ"
        bbox = logo_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = center - text_width // 2
        text_y = center - text_height // 2
        logo_draw.text((text_x, text_y), text, fill=(255, 255, 255, 140), font=font)
        
        # Position in top-right corner (professional standard)
        margin = int(OUTPUT_SIZE[0] * 0.04)
        logo_x = OUTPUT_SIZE[0] - logo_size - margin
        logo_y = margin
        
        watermarked = watermarked.convert('RGBA')
        watermarked = self.safe_paste(watermarked, logo_img, (logo_x, logo_y), logo_img)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'logo_corner_studio.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'logo_corner_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: logo_corner_studio.jpg (Professional photography studio)")
        
        # 2. Brand protection logo - Center placement for maximum security
        base_img = self.base_images.get('lifestyle', list(self.base_images.values())[1])
        watermarked = base_img.copy()
        
        # Create brand protection logo
        logo_size = 120
        logo_img = Image.new('RGBA', (logo_size, logo_size), (255, 255, 255, 0))
        logo_draw = ImageDraw.Draw(logo_img)
        
        center = logo_size // 2
        
        # Shield-style protection logo
        shield_points = [
            (center, 10),
            (center + 30, 20),
            (center + 35, center + 20),
            (center, logo_size - 15),
            (center - 35, center + 20),
            (center - 30, 20)
        ]
        
        logo_draw.polygon(shield_points, fill=(255, 255, 255, 100), 
                         outline=(255, 255, 255, 160), width=2)
        
        # Add protection symbol
        font = self.get_font(36)
        text = "©"
        bbox = logo_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = center - text_width // 2
        text_y = center - text_height // 2 - 5
        logo_draw.text((text_x, text_y), text, fill=(255, 255, 255, 180), font=font)
        
        # Position in center for maximum protection
        logo_x = (OUTPUT_SIZE[0] - logo_size) // 2
        logo_y = (OUTPUT_SIZE[1] - logo_size) // 2
        
        watermarked = watermarked.convert('RGBA')
        watermarked = self.safe_paste(watermarked, logo_img, (logo_x, logo_y), logo_img)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'logo_center_protection.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'logo_center_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: logo_center_protection.jpg (Brand protection style)")

    def generate_pattern_watermarks(self):
        """Generate professional pattern watermark images based on industry standards"""
        print("\n=== Generating Professional Pattern Watermarks ===")
        
        # 1. Dreamstime-style diagonal grid - Industry standard
        base_img = self.base_images.get('portrait', list(self.base_images.values())[0])
        watermarked = base_img.copy()
        
        pattern_layer = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
        pattern_draw = ImageDraw.Draw(pattern_layer)
        
        font = self.get_font(22)
        text = "DREAMSTIME STYLE"
        
        # Validate font
        if not self.validate_font(font, text):
            font = self.get_font(16)
        
        # Calculate text dimensions
        bbox = pattern_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Dreamstime-style diagonal grid parameters
        spacing_x = 180
        spacing_y = 100
        
        placed_count = 0
        # Create diagonal grid pattern
        for row in range(-2, 8):
            for col in range(-2, 8):
                # Calculate diagonal positioning
                x = col * spacing_x + row * 90  # Offset for diagonal effect
                y = row * spacing_y + 50
                
                # Check bounds with proper text dimensions
                if (x >= -50 and y >= -30 and 
                    x + text_width <= OUTPUT_SIZE[0] + 50 and 
                    y + text_height <= OUTPUT_SIZE[1] + 30):
                    
                    # Create rotated text for each position
                    temp_img = Image.new('RGBA', (text_width + 20, text_height + 20), (255, 255, 255, 0))
                    temp_draw = ImageDraw.Draw(temp_img)
                    temp_draw.text((10, 10), text, fill=(255, 255, 255, 60), font=font)
                    
                    # Rotate 45 degrees
                    rotated = temp_img.rotate(45, expand=True)
                    
                    # Safe positioning
                    paste_x = max(0, min(x, OUTPUT_SIZE[0] - rotated.width))
                    paste_y = max(0, min(y, OUTPUT_SIZE[1] - rotated.height))
                    
                    if paste_x >= 0 and paste_y >= 0:
                        pattern_layer = self.safe_paste(pattern_layer, rotated, (paste_x, paste_y), rotated)
                        placed_count += 1
        
        print(f"Dreamstime-style pattern: placed {placed_count} text elements")
        
        watermarked = watermarked.convert('RGBA')
        watermarked = Image.alpha_composite(watermarked, pattern_layer)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'pattern_dreamstime_style.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'pattern_dreamstime_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: pattern_dreamstime_style.jpg (Dreamstime diagonal grid style)")
        
        # 2. Stock photo protection pattern - Multiple elements
        base_img = self.base_images.get('landscape', list(self.base_images.values())[1])
        watermarked = base_img.copy()
        
        pattern_layer = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
        pattern_draw = ImageDraw.Draw(pattern_layer)
        
        # Multiple protection elements
        elements = [
            {"text": "STOCK PHOTO", "size": 28, "opacity": 70},
            {"text": "© PROTECTED", "size": 20, "opacity": 50},
            {"text": "NOT FOR COMMERCIAL USE", "size": 16, "opacity": 40}
        ]
        
        placed_count = 0
        
        # Create mixed pattern with different text sizes and opacity
        for element in elements:
            font = self.get_font(element["size"])
            text = element["text"]
            
            bbox = pattern_draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Calculate spacing based on text size
            spacing_x = text_width + 60
            spacing_y = text_height + 80
            
            cols = max(1, OUTPUT_SIZE[0] // spacing_x)
            rows = max(1, OUTPUT_SIZE[1] // spacing_y)
            
            for row in range(rows):
                for col in range(cols):
                    x = col * spacing_x + (row % 2) * (spacing_x // 2)  # Staggered
                    y = row * spacing_y + element["size"]  # Offset by text size
                    
                    if (x >= 0 and y >= 0 and 
                        x + text_width <= OUTPUT_SIZE[0] and 
                        y + text_height <= OUTPUT_SIZE[1]):
                        
                        pattern_draw.text((x, y), text, 
                                        fill=(255, 255, 255, element["opacity"]), font=font)
                        placed_count += 1
        
        print(f"Stock protection pattern: placed {placed_count} text elements")
        
        watermarked = watermarked.convert('RGBA')
        watermarked = Image.alpha_composite(watermarked, pattern_layer)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'pattern_stock_protection.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'pattern_stock_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: pattern_stock_protection.jpg (Multi-layer stock protection)")

    def generate_overlay_watermarks(self):
        """Generate professional overlay watermark images"""
        print("\n=== Generating Professional Overlay Watermarks ===")
        
        # 1. Preview overlay - Professional preview mode
        base_img = self.base_images.get('architecture', list(self.base_images.values())[0])
        watermarked = base_img.copy()
        
        overlay = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        # Create professional preview overlay
        center_x, center_y = OUTPUT_SIZE[0] // 2, OUTPUT_SIZE[1] // 2
        overlay_width, overlay_height = 350, 120
        
        # Semi-transparent background bar
        overlay_draw.rectangle([
            center_x - overlay_width//2, center_y - overlay_height//2,
            center_x + overlay_width//2, center_y + overlay_height//2
        ], fill=(0, 0, 0, 100))  # Dark semi-transparent
        
        # Preview text
        font = self.get_font(48)
        text = "PREVIEW ONLY"
        bbox = overlay_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = center_x - text_width // 2
        text_y = center_y - text_height // 2 - 10
        
        overlay_draw.text((text_x, text_y), text, fill=(255, 255, 255, 200), font=font)
        
        # Subtitle
        font_small = self.get_font(18)
        subtitle = "Purchase to remove watermark"
        bbox = overlay_draw.textbbox((0, 0), subtitle, font_small)
        sub_width = bbox[2] - bbox[0]
        sub_x = center_x - sub_width // 2
        sub_y = text_y + text_height + 5
        
        overlay_draw.text((sub_x, sub_y), subtitle, fill=(255, 255, 255, 160), font=font_small)
        
        watermarked = watermarked.convert('RGBA')
        watermarked = Image.alpha_composite(watermarked, overlay)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'overlay_preview_professional.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'overlay_preview_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: overlay_preview_professional.jpg (Professional preview overlay)")
        
        # 2. Subtle protection overlay - Minimal but effective
        base_img = self.base_images.get('lifestyle', list(self.base_images.values())[1])
        watermarked = base_img.copy()
        
        overlay = Image.new('RGBA', OUTPUT_SIZE, (255, 255, 255, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        # Very subtle full-image tint
        overlay_draw.rectangle([0, 0, OUTPUT_SIZE[0], OUTPUT_SIZE[1]], 
                              fill=(255, 255, 255, 20))
        
        # Multiple subtle text overlays
        elements = [
            {"text": "© LICENSED CONTENT", "size": 32, "opacity": 50},
            {"text": "ProPhotoStudio.com", "size": 20, "opacity": 35}
        ]
        
        for i, element in enumerate(elements):
            font = self.get_font(element["size"])
            text = element["text"]
            
            bbox = overlay_draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Position at different areas
            if i == 0:  # Main copyright - center
                text_x = (OUTPUT_SIZE[0] - text_width) // 2
                text_y = (OUTPUT_SIZE[1] - text_height) // 2
            else:  # Website - bottom right
                margin = int(OUTPUT_SIZE[0] * 0.05)
                text_x = OUTPUT_SIZE[0] - text_width - margin
                text_y = OUTPUT_SIZE[1] - text_height - margin
            
            overlay_draw.text((text_x, text_y), text, 
                            fill=(255, 255, 255, element["opacity"]), font=font)
        
        watermarked = watermarked.convert('RGBA')
        watermarked = Image.alpha_composite(watermarked, overlay)
        watermarked = watermarked.convert('RGB')
        
        watermarked.save(os.path.join(WATERMARKED_DIR, 'overlay_subtle_protection.jpg'), 'JPEG', quality=JPEG_QUALITY)
        base_img.save(os.path.join(CLEAN_DIR, 'overlay_subtle_clean.jpg'), 'JPEG', quality=JPEG_QUALITY)
        print("Generated: overlay_subtle_protection.jpg (Subtle professional protection)")

    def generate_all_watermarks(self):
        """Generate all watermark types"""
        print("Starting watermark generation...")
        print(f"Found {len(self.base_images)} base images")
        
        if not self.base_images:
            print("Error: No base images found!")
            return False
            
        try:
            self.generate_text_watermarks()
            self.generate_logo_watermarks()
            self.generate_pattern_watermarks()
            self.generate_overlay_watermarks()
            
            print("\n=== Generation Complete ===")
            print(f"Generated 18 images total (9 pairs)")
            print(f"Watermarked images in: {WATERMARKED_DIR}")
            print(f"Clean images in: {CLEAN_DIR}")
            
            return True
            
        except Exception as e:
            print(f"Error during generation: {e}")
            import traceback
            traceback.print_exc()
            return False

def main():
    """Main function"""
    print("New Watermark Demo Generator")
    print("===========================")
    
    generator = NewWatermarkGenerator()
    success = generator.generate_all_watermarks()
    
    if success:
        print("\n✅ All watermark demo images generated successfully!")
    else:
        print("\n❌ Error generating watermark images.")
        sys.exit(1)

if __name__ == "__main__":
    main()