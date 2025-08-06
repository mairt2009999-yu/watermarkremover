#!/bin/bash

# Script to generate placeholder demo images for the watermark removal app
# These are temporary placeholders until actual demo images are created

echo "Generating placeholder demo images..."

# Create directory if it doesn't exist
mkdir -p public/demo

# Function to create a placeholder WebP image with ImageMagick
# If ImageMagick is not installed, it will create a simple SVG fallback
create_placeholder() {
  local filename=$1
  local text=$2
  local color=$3
  
  if command -v magick &> /dev/null; then
    # Use ImageMagick to create WebP placeholder
    magick -size 1600x900 xc:"$color" \
           -gravity center \
           -pointsize 72 \
           -fill white \
           -annotate +0+0 "$text" \
           "public/demo/$filename"
    echo "✓ Created $filename (WebP)"
  elif command -v convert &> /dev/null; then
    # Use older ImageMagick convert command
    convert -size 1600x900 xc:"$color" \
            -gravity center \
            -pointsize 72 \
            -fill white \
            -annotate +0+0 "$text" \
            "public/demo/${filename%.webp}.png"
    echo "✓ Created ${filename%.webp}.png (PNG fallback)"
  else
    # Create SVG fallback if ImageMagick is not available
    cat > "public/demo/${filename%.webp}.svg" << EOF
<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="$color"/>
  <text x="800" y="450" font-family="Arial" font-size="72" fill="white" text-anchor="middle" dominant-baseline="middle">$text</text>
</svg>
EOF
    echo "✓ Created ${filename%.webp}.svg (SVG fallback)"
  fi
}

# Generate placeholder images for each watermark type
echo "Creating visible text watermark examples..."
create_placeholder "visible-text-before.webp" "WATERMARK" "#4a5568"
create_placeholder "visible-text-after.webp" "CLEAN" "#2d3748"

echo "Creating semi-transparent watermark examples..."
create_placeholder "semi-transparent-before.webp" "SEMI-TRANSPARENT" "#718096"
create_placeholder "semi-transparent-after.webp" "REMOVED" "#2d3748"

echo "Creating embedded digital watermark examples..."
create_placeholder "embedded-digital-before.webp" "EMBEDDED" "#5a67d8"
create_placeholder "embedded-digital-after.webp" "CLEARED" "#2d3748"

echo "Creating repetitive pattern watermark examples..."
create_placeholder "repetitive-pattern-before.webp" "PATTERN" "#9f7aea"
create_placeholder "repetitive-pattern-after.webp" "RESTORED" "#2d3748"

echo ""
echo "✅ Placeholder images generated successfully!"
echo ""
echo "Note: These are temporary placeholders. Replace them with actual demo images:"
echo "  - Ensure all images are 1600×900 pixels (16:9 aspect ratio)"
echo "  - Use WebP format for best quality-to-size ratio"
echo "  - Show realistic watermark removal examples for each type"
echo ""
echo "To replace with real images:"
echo "  1. Prepare your demo images with watermarks"
echo "  2. Process them to remove watermarks"
echo "  3. Export as WebP at 1600×900 resolution"
echo "  4. Replace the placeholder files in public/demo/"
