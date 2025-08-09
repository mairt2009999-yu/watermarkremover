/**
 * Watermark Types Configuration
 * Defines all watermark types with their properties and examples
 */

import type {
  WatermarkType,
  WatermarkTypeConfig,
} from '@/types/watermark.types';
import { FileText, Grid3x3, Image, Layers } from 'lucide-react';

/**
 * Text Watermarks Configuration
 */
const textWatermark: WatermarkType = {
  id: 'text',
  title: {
    en: 'Text Watermarks',
    zh: '文字水印',
  },
  description: {
    en: 'Remove copyright text, signatures, dates, and timestamps from images',
    zh: '去除图片中的版权文字、签名、日期和时间戳',
  },
  keywords: [
    'text watermark',
    'copyright text',
    'signature removal',
    'date stamp',
    'text overlay',
    'sample watermark',
    '文字水印',
    '版权文字',
    '去水印',
  ],
  difficulty: 'Easy',
  processingTime: '3-5s',
  successRate: 98,
  features: {
    en: [
      'Single & multiple text removal',
      'Any font style support',
      'Rotated text handling',
      'Multi-language text recognition',
    ],
    zh: [
      '单个和多个文字去除',
      '支持任何字体样式',
      '处理旋转文字',
      '多语言文字识别',
    ],
  },
  examples: {
    before: '/demo/generated/food_photography_text_center.webp',
    after: '/demo/generated/food_photography_clean.webp',
    alternates: [
      {
        before: '/demo/watermarked/text_corner_copyright.jpg',
        after: '/demo/clean/text_corner_clean.jpg',
      },
      {
        before: '/demo/watermarked/text_diagonal_watermark.jpg',
        after: '/demo/clean/text_diagonal_clean.jpg',
      },
    ],
  },
  icon: <FileText className="h-5 w-5" />,
  useCases: [
    'E-commerce product images',
    'Stock photo cleanup',
    'Document watermark removal',
    'Social media content',
  ],
  technicalDetails: {
    algorithms: ['OCR', 'Inpainting', 'Content-Aware Fill'],
    complexity: 'simple',
    averageProcessingMs: 4000,
  },
};

/**
 * Logo Watermarks Configuration
 */
const logoWatermark: WatermarkType = {
  id: 'logo',
  title: {
    en: 'Logo & Brand Marks',
    zh: '标志和品牌标记',
  },
  description: {
    en: 'Remove brand logos, company marks, and image overlays from photos',
    zh: '去除照片中的品牌标志、公司标记和图像叠加',
  },
  keywords: [
    'logo watermark',
    'brand removal',
    'company logo',
    'image overlay',
    'logo cleanup',
    '标志水印',
    '品牌去除',
    'logo去除',
  ],
  difficulty: 'Medium',
  processingTime: '5-8s',
  successRate: 95,
  features: {
    en: [
      'Complex logo detection',
      'Color logo removal',
      'Transparent logo handling',
      'Multiple logo instances',
    ],
    zh: ['复杂标志检测', '彩色标志去除', '透明标志处理', '多个标志实例'],
  },
  examples: {
    before: '/demo/generated/product_photography_text_center.webp',
    after: '/demo/generated/product_photography_clean.webp',
    alternates: [
      {
        before: '/demo/watermarked/logo_center_company.jpg',
        after: '/demo/clean/logo_center_clean.jpg',
      },
    ],
  },
  icon: <Image className="h-5 w-5" />,
  useCases: [
    'Product photography',
    'Real estate images',
    'Portfolio updates',
    'Marketing materials',
  ],
  technicalDetails: {
    algorithms: ['Object Detection', 'Deep Learning', 'Smart Fill'],
    complexity: 'moderate',
    averageProcessingMs: 6500,
  },
};

/**
 * Pattern Watermarks Configuration
 */
const patternWatermark: WatermarkType = {
  id: 'pattern',
  title: {
    en: 'Pattern & Grid Watermarks',
    zh: '图案和网格水印',
  },
  description: {
    en: 'Remove repeating patterns, grid layouts, and tiled watermarks',
    zh: '去除重复图案、网格布局和平铺水印',
  },
  keywords: [
    'pattern watermark',
    'grid watermark',
    'repeating watermark',
    'tiled overlay',
    'diagonal pattern',
    '图案水印',
    '网格水印',
    '重复水印',
  ],
  difficulty: 'Hard',
  processingTime: '8-12s',
  successRate: 92,
  features: {
    en: [
      'Pattern recognition AI',
      'Grid detection system',
      'Texture reconstruction',
      'Smart pattern removal',
    ],
    zh: ['AI图案识别', '网格检测系统', '纹理重建', '智能图案去除'],
  },
  examples: {
    before: '/demo/generated/nature_landscape_logo.webp',
    after: '/demo/generated/nature_landscape_clean.webp',
    alternates: [
      {
        before: '/demo/watermarked/pattern_diagonal_repeat.jpg',
        after: '/demo/clean/pattern_diagonal_clean.jpg',
      },
    ],
  },
  icon: <Grid3x3 className="h-5 w-5" />,
  useCases: [
    'Stock photo processing',
    'Getty Images cleanup',
    'Shutterstock watermarks',
    'Protected content recovery',
  ],
  technicalDetails: {
    algorithms: [
      'Pattern Recognition',
      'Frequency Analysis',
      'Texture Synthesis',
    ],
    complexity: 'complex',
    averageProcessingMs: 10000,
  },
};

/**
 * Overlay Watermarks Configuration
 */
const overlayWatermark: WatermarkType = {
  id: 'overlay',
  title: {
    en: 'Transparent Overlay Watermarks',
    zh: '透明叠加水印',
  },
  description: {
    en: 'Remove semi-transparent overlays and opacity-based watermarks',
    zh: '去除半透明叠加层和基于不透明度的水印',
  },
  keywords: [
    'transparent watermark',
    'overlay watermark',
    'opacity watermark',
    'semi-transparent',
    'alpha channel',
    '透明水印',
    '叠加水印',
    '半透明水印',
  ],
  difficulty: 'Medium',
  processingTime: '5-10s',
  successRate: 94,
  features: {
    en: [
      'Transparency detection',
      'Alpha channel analysis',
      'Color restoration',
      'Detail preservation',
    ],
    zh: ['透明度检测', 'Alpha通道分析', '颜色还原', '细节保护'],
  },
  examples: {
    before: '/demo/generated/portrait_photography_embedded.webp',
    after: '/demo/generated/portrait_photography_clean.webp',
    alternates: [
      {
        before: '/demo/watermarked/overlay_subtle_transparent.jpg',
        after: '/demo/clean/overlay_subtle_clean.jpg',
      },
    ],
  },
  icon: <Layers className="h-5 w-5" />,
  useCases: [
    'Photography portfolios',
    'Digital art cleanup',
    'Social media images',
    'Website graphics',
  ],
  technicalDetails: {
    algorithms: ['Alpha Blending', 'Color Correction', 'Layer Separation'],
    complexity: 'moderate',
    averageProcessingMs: 7500,
  },
};

/**
 * Complete watermark types configuration
 */
export const watermarkTypesConfig: WatermarkTypeConfig = {
  types: [textWatermark, logoWatermark, patternWatermark, overlayWatermark],
  variants: [
    // Text variants
    {
      id: 'text-center',
      name: {
        en: 'Center Text',
        zh: '中心文字',
      },
      parentCategory: 'text',
      specificFeatures: ['Large central text', 'Bold fonts'],
      exampleImage: '/demo/variants/text_center.jpg',
    },
    {
      id: 'text-corner',
      name: {
        en: 'Corner Text',
        zh: '角落文字',
      },
      parentCategory: 'text',
      specificFeatures: ['Small corner text', 'Copyright marks'],
      exampleImage: '/demo/variants/text_corner.jpg',
    },
    {
      id: 'text-diagonal',
      name: {
        en: 'Diagonal Text',
        zh: '斜角文字',
      },
      parentCategory: 'text',
      specificFeatures: ['Rotated text', 'Diagonal placement'],
      exampleImage: '/demo/variants/text_diagonal.jpg',
    },
    // Logo variants
    {
      id: 'logo-single',
      name: {
        en: 'Single Logo',
        zh: '单个标志',
      },
      parentCategory: 'logo',
      specificFeatures: ['One logo instance', 'Fixed position'],
      exampleImage: '/demo/variants/logo_single.jpg',
    },
    {
      id: 'logo-multiple',
      name: {
        en: 'Multiple Logos',
        zh: '多个标志',
      },
      parentCategory: 'logo',
      specificFeatures: ['Multiple instances', 'Different positions'],
      exampleImage: '/demo/variants/logo_multiple.jpg',
    },
    // Pattern variants
    {
      id: 'pattern-grid',
      name: {
        en: 'Grid Pattern',
        zh: '网格图案',
      },
      parentCategory: 'pattern',
      specificFeatures: ['Regular grid', 'Even spacing'],
      exampleImage: '/demo/variants/pattern_grid.jpg',
    },
    {
      id: 'pattern-diagonal',
      name: {
        en: 'Diagonal Pattern',
        zh: '对角图案',
      },
      parentCategory: 'pattern',
      specificFeatures: ['45-degree angle', 'Repeating diagonally'],
      exampleImage: '/demo/variants/pattern_diagonal.jpg',
    },
    // Overlay variants
    {
      id: 'overlay-subtle',
      name: {
        en: 'Subtle Overlay',
        zh: '轻微叠加',
      },
      parentCategory: 'overlay',
      specificFeatures: ['10-20% opacity', 'Barely visible'],
      exampleImage: '/demo/variants/overlay_subtle.jpg',
    },
    {
      id: 'overlay-medium',
      name: {
        en: 'Medium Overlay',
        zh: '中等叠加',
      },
      parentCategory: 'overlay',
      specificFeatures: ['30-50% opacity', 'Clearly visible'],
      exampleImage: '/demo/variants/overlay_medium.jpg',
    },
    {
      id: 'overlay-strong',
      name: {
        en: 'Strong Overlay',
        zh: '强烈叠加',
      },
      parentCategory: 'overlay',
      specificFeatures: ['60-80% opacity', 'Highly visible'],
      exampleImage: '/demo/variants/overlay_strong.jpg',
    },
  ],
  defaultOptions: {
    quality: 'balanced',
    preserveDetails: true,
    enhanceResult: false,
    autoDetect: true,
    batchMode: false,
  },
  supportedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  processingLimits: {
    maxDimension: 4096,
    minDimension: 100,
    maxBatchSize: 10,
  },
};

/**
 * Export individual watermark types for easy access
 */
export const WATERMARK_TYPES = {
  text: textWatermark,
  logo: logoWatermark,
  pattern: patternWatermark,
  overlay: overlayWatermark,
};

/**
 * Get watermark type by ID
 */
export const getWatermarkTypeById = (id: string): WatermarkType | undefined => {
  return watermarkTypesConfig.types.find((type) => type.id === id);
};

/**
 * Get variants for a specific category
 */
export const getVariantsByCategory = (category: string) => {
  return watermarkTypesConfig.variants.filter(
    (variant) => variant.parentCategory === category
  );
};
