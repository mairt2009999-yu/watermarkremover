# Demo Image Naming Convention

## Overview
This directory contains demo images for the watermark removal application. All images follow a descriptive, type-specific naming convention to clearly indicate their watermark type and state.

## Naming Convention

### Format
`{watermark-type}-{state}.{extension}`

Where:
- `{watermark-type}`: Descriptive name of the watermark category
- `{state}`: Either `before` (with watermark) or `after` (watermark removed)
- `{extension}`: File format (preferably `webp`, or `svg`/`png` for vectors)

### Watermark Types

1. **visible-text**: Clearly visible text, logos, or copyright marks
   - `visible-text-before.webp`
   - `visible-text-after.webp`

2. **semi-transparent**: Semi-transparent overlays with varying opacity
   - `semi-transparent-before.webp`
   - `semi-transparent-after.webp`

3. **embedded-digital**: Invisible digital identifiers hidden in image data
   - `embedded-digital-before.webp`
   - `embedded-digital-after.webp`

4. **repetitive-pattern**: Repeating logos, textures, or geometric patterns
   - `repetitive-pattern-before.webp`
   - `repetitive-pattern-after.webp`

## Image Specifications

### Dimensions
- **Aspect Ratio**: 16:9 (required)
- **Recommended Size**: 1600 × 900 pixels
- **Alternative Sizes**: 
  - 1920 × 1080 pixels (Full HD)
  - 1280 × 720 pixels (HD)
  - 3840 × 2160 pixels (4K, if needed)

### File Formats
- **Primary**: WebP (best quality-to-size ratio)
- **Alternative**: 
  - SVG (for vector graphics)
  - PNG (when transparency is needed and WebP not suitable)

### Quality Guidelines
- WebP quality: 80-95% (balancing quality and file size)
- PNG: Use compression tools to minimize file size
- SVG: Optimize and minify for production

## Usage in Components

These images are used in:
- `/src/components/blocks/watermark-types/watermark-types-showcase.tsx`
- `/src/components/blocks/hero/hero.tsx`

The images are displayed in a comparison slider with the `aspect-video` CSS class, which expects 16:9 aspect ratio for perfect display.

## Adding New Images

When adding new demo images:
1. Follow the naming convention strictly
2. Ensure 16:9 aspect ratio (e.g., 1600 × 900 px)
3. Use WebP format unless there's a specific reason not to
4. Optimize images for web (compress without visible quality loss)
5. Create both `before` and `after` versions for each watermark type
6. Update the relevant component files if adding new watermark types

## Current Images

### Required Files (to be added):
- [ ] visible-text-before.webp
- [ ] visible-text-after.webp
- [ ] semi-transparent-before.webp
- [ ] semi-transparent-after.webp
- [ ] embedded-digital-before.webp
- [ ] embedded-digital-after.webp
- [ ] repetitive-pattern-before.webp
- [ ] repetitive-pattern-after.webp

### Existing Files (to be replaced/renamed):
- watermark-before.svg → visible-text-before.webp
- watermark-after.svg → visible-text-after.webp
- step-upload.svg (keep as is - used for process steps)
- step-process.svg (keep as is - used for process steps)
- step-download.svg (keep as is - used for process steps)
