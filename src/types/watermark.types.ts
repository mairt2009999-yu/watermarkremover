/**
 * Watermark Type Definitions
 * Unified type system for watermark classification
 */

import type { ReactNode } from 'react';

/**
 * Main watermark categories based on visual characteristics
 */
export type WatermarkCategory = 'text' | 'logo' | 'pattern' | 'overlay';

/**
 * Difficulty levels for watermark removal
 */
export type WatermarkDifficulty = 'Easy' | 'Medium' | 'Hard';

/**
 * Processing status for watermark removal
 */
export type ProcessingStatus =
  | 'idle'
  | 'detecting'
  | 'processing'
  | 'completed'
  | 'failed';

/**
 * Watermark position on image
 */
export type WatermarkPosition =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'diagonal'
  | 'grid'
  | 'random';

/**
 * Main watermark type interface
 */
export interface WatermarkType {
  id: WatermarkCategory;
  title: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  keywords: string[]; // SEO keywords for better discoverability
  difficulty: WatermarkDifficulty;
  processingTime: string; // e.g., "3-5s"
  successRate: number; // percentage, e.g., 98
  features: {
    en: string[];
    zh: string[];
  };
  examples: {
    before: string; // image path
    after: string; // image path
    alternates?: {
      // optional alternate examples
      before: string;
      after: string;
    }[];
  };
  icon: ReactNode; // Icon component
  useCases: string[]; // Real-world use cases
  technicalDetails?: {
    algorithms: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    averageProcessingMs: number;
  };
}

/**
 * Watermark detection result
 */
export interface WatermarkDetectionResult {
  detected: boolean;
  category: WatermarkCategory | null;
  confidence: number; // 0-100
  position?: WatermarkPosition;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  characteristics?: {
    opacity: number; // 0-1
    coverage: number; // percentage of image covered
    complexity: 'simple' | 'complex';
    colorMode: 'monochrome' | 'colored' | 'gradient';
  };
}

/**
 * Processing options for watermark removal
 */
export interface WatermarkProcessingOptions {
  quality: 'fast' | 'balanced' | 'best';
  preserveDetails: boolean;
  enhanceResult: boolean;
  autoDetect: boolean;
  batchMode?: boolean;
}

/**
 * Processing result
 */
export interface WatermarkProcessingResult {
  success: boolean;
  processedImageUrl?: string;
  processingTimeMs: number;
  category: WatermarkCategory;
  confidence: number;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    originalSize: number;
    processedSize: number;
    format: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

/**
 * Statistics for each watermark type
 */
export interface WatermarkTypeStats {
  category: WatermarkCategory;
  totalProcessed: number;
  successCount: number;
  averageProcessingTime: number;
  userSatisfactionRate: number;
  mostCommonUseCases: string[];
}

/**
 * Watermark variant configuration
 */
export interface WatermarkVariant {
  id: string;
  name: {
    en: string;
    zh: string;
  };
  parentCategory: WatermarkCategory;
  specificFeatures: string[];
  exampleImage: string;
}

/**
 * Complete watermark type configuration
 */
export interface WatermarkTypeConfig {
  types: WatermarkType[];
  variants: WatermarkVariant[];
  defaultOptions: WatermarkProcessingOptions;
  supportedFormats: string[];
  maxFileSize: number; // in bytes
  processingLimits: {
    maxDimension: number;
    minDimension: number;
    maxBatchSize: number;
  };
}

/**
 * Type guard functions
 */
export const isValidWatermarkCategory = (
  value: string
): value is WatermarkCategory => {
  return ['text', 'logo', 'pattern', 'overlay'].includes(value);
};

export const isValidDifficulty = (
  value: string
): value is WatermarkDifficulty => {
  return ['Easy', 'Medium', 'Hard'].includes(value);
};

/**
 * Default processing options
 */
export const DEFAULT_PROCESSING_OPTIONS: WatermarkProcessingOptions = {
  quality: 'balanced',
  preserveDetails: true,
  enhanceResult: false,
  autoDetect: true,
  batchMode: false,
};

/**
 * Difficulty color mapping for UI
 */
export const DIFFICULTY_COLORS: Record<WatermarkDifficulty, string> = {
  Easy: 'bg-green-500/10 text-green-700 border-green-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  Hard: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
};

/**
 * Processing time estimates
 */
export const PROCESSING_TIME_ESTIMATES: Record<WatermarkCategory, string> = {
  text: '3-5 seconds',
  logo: '5-8 seconds',
  pattern: '8-12 seconds',
  overlay: '5-10 seconds',
};

/**
 * Success rate by category
 */
export const SUCCESS_RATES: Record<WatermarkCategory, number> = {
  text: 98,
  logo: 95,
  pattern: 92,
  overlay: 94,
};
