/**
 * Watermark Type Mapper Service
 * Handles migration from old watermark type system to new unified system
 */

import type { WatermarkCategory } from '@/types/watermark.types';

/**
 * Legacy watermark type definitions (for backward compatibility)
 */
export type LegacyWatermarkType =
  | 'visible-text-logo'
  | 'semi-transparent'
  | 'embedded-digital'
  | 'repetitive-pattern'
  | 'text_overlay'
  | 'logo_pattern'
  | 'corner_mark'
  | 'subtle_embed'
  | 'grid_pattern'
  | 'text_center'
  | 'text_corner'
  | 'pattern_diagonal'
  | 'pattern_grid'
  | 'logo'
  | 'embedded';

/**
 * Image path mapping for demo images
 */
interface ImagePathMapping {
  old: string;
  new: string;
  category: WatermarkCategory;
}

/**
 * Watermark Type Mapper Service
 */
export class WatermarkTypeMapperService {
  /**
   * Map legacy type to new category
   */
  static mapLegacyType(legacyType: string): WatermarkCategory {
    const mappings: Record<string, WatermarkCategory> = {
      // Old showcase component types
      'visible-text-logo': 'text',
      'semi-transparent': 'overlay',
      'embedded-digital': 'overlay', // Note: We're remapping this to overlay since true embedded watermarks can't be removed
      'repetitive-pattern': 'pattern',

      // Python script types
      text_overlay: 'text',
      logo_pattern: 'logo',
      corner_mark: 'text',
      subtle_embed: 'overlay',
      grid_pattern: 'pattern',

      // Metadata.json types
      text_center: 'text',
      text_corner: 'text',
      pattern_diagonal: 'pattern',
      pattern_grid: 'pattern',
      logo: 'logo',
      embedded: 'overlay',
    };

    return mappings[legacyType] || 'text'; // Default to text if unknown
  }

  /**
   * Map old image paths to new structure
   */
  static mapImagePath(oldPath: string): string {
    const pathMappings: Record<string, string> = {
      // Old generated paths to new demo paths
      '/demo/generated/product_photography_text_center.jpg':
        '/demo/watermarked/text_center_sample.jpg',
      '/demo/generated/product_photography_clean.jpg':
        '/demo/clean/text_center_clean.jpg',
      '/demo/generated/nature_landscape_logo.jpg':
        '/demo/watermarked/logo_corner_brand.jpg',
      '/demo/generated/nature_landscape_clean.jpg':
        '/demo/clean/logo_corner_clean.jpg',
      '/demo/generated/portrait_photography_embedded.jpg':
        '/demo/watermarked/overlay_medium_opacity.jpg',
      '/demo/generated/portrait_photography_clean.jpg':
        '/demo/clean/overlay_medium_clean.jpg',
      '/demo/generated/architecture_building_pattern_grid.jpg':
        '/demo/watermarked/pattern_grid_full.jpg',
      '/demo/generated/architecture_building_clean.jpg':
        '/demo/clean/pattern_grid_clean.jpg',

      // Add more mappings as needed
    };

    return pathMappings[oldPath] || oldPath; // Return original if no mapping found
  }

  /**
   * Get category description for migration messages
   */
  static getCategoryDescription(category: WatermarkCategory): string {
    const descriptions: Record<WatermarkCategory, string> = {
      text: 'Text watermarks including copyright text, signatures, and dates',
      logo: 'Logo and brand mark watermarks',
      pattern: 'Repeating pattern and grid watermarks',
      overlay: 'Semi-transparent overlay watermarks',
    };

    return descriptions[category];
  }

  /**
   * Validate if a type needs migration
   */
  static needsMigration(type: string): boolean {
    const legacyTypes = [
      'visible-text-logo',
      'semi-transparent',
      'embedded-digital',
      'repetitive-pattern',
      'text_overlay',
      'logo_pattern',
      'corner_mark',
      'subtle_embed',
      'grid_pattern',
      'text_center',
      'text_corner',
      'pattern_diagonal',
      'pattern_grid',
      'embedded',
    ];

    return legacyTypes.includes(type);
  }

  /**
   * Migrate old watermark data structure to new format
   */
  static migrateWatermarkData(oldData: any): any {
    if (!oldData) return null;

    // Check if it's already in new format
    if (
      oldData.id &&
      ['text', 'logo', 'pattern', 'overlay'].includes(oldData.id)
    ) {
      return oldData; // Already migrated
    }

    // Migrate old format
    const newCategory = this.mapLegacyType(oldData.type || oldData.id);

    return {
      category: newCategory,
      originalType: oldData.type || oldData.id,
      beforeImage: this.mapImagePath(
        oldData.beforeImage || oldData.watermarked || ''
      ),
      afterImage: this.mapImagePath(oldData.afterImage || oldData.clean || ''),
      migrated: true,
      migratedAt: new Date().toISOString(),
    };
  }

  /**
   * Batch migrate multiple watermark entries
   */
  static batchMigrate(entries: any[]): any[] {
    return entries.map((entry) => this.migrateWatermarkData(entry));
  }

  /**
   * Get migration statistics
   */
  static getMigrationStats(entries: any[]): {
    total: number;
    migrated: number;
    byCategory: Record<WatermarkCategory, number>;
  } {
    const stats = {
      total: entries.length,
      migrated: 0,
      byCategory: {
        text: 0,
        logo: 0,
        pattern: 0,
        overlay: 0,
      } as Record<WatermarkCategory, number>,
    };

    entries.forEach((entry) => {
      if (this.needsMigration(entry.type || entry.id)) {
        stats.migrated++;
        const category = this.mapLegacyType(entry.type || entry.id);
        stats.byCategory[category]++;
      }
    });

    return stats;
  }

  /**
   * Generate migration report
   */
  static generateMigrationReport(entries: any[]): string {
    const stats = this.getMigrationStats(entries);

    return `
Watermark Type Migration Report
================================
Total entries: ${stats.total}
Entries needing migration: ${stats.migrated}

Migration by category:
- Text watermarks: ${stats.byCategory.text}
- Logo watermarks: ${stats.byCategory.logo}
- Pattern watermarks: ${stats.byCategory.pattern}
- Overlay watermarks: ${stats.byCategory.overlay}

Note: "Embedded Digital Watermarks" have been remapped to "Overlay Watermarks" 
as true embedded watermarks (invisible metadata) cannot be removed by image processing.
    `.trim();
  }
}

// Export convenience functions
export const mapLegacyType = WatermarkTypeMapperService.mapLegacyType;
export const mapImagePath = WatermarkTypeMapperService.mapImagePath;
export const migrateWatermarkData =
  WatermarkTypeMapperService.migrateWatermarkData;
export const needsMigration = WatermarkTypeMapperService.needsMigration;
