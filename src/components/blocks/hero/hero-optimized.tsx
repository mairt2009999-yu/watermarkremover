'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { TextEffect } from '@/components/tailark/motion/text-effect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  CloudUpload,
  CreditCard,
  Download,
  FileImage,
  Globe,
  Image as ImageIcon,
  Infinity,
  Layers,
  Lock,
  Shield,
  Sparkles,
  Star,
  Upload,
  Users,
  Wand2,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type DragEvent, useRef, useState } from 'react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

// SEO优化的结构化数据
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Watermark Remover",
  "applicationCategory": "ImageEditor",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "2459"
  }
};

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function HeroSectionOptimized() {
  const t = useTranslations('HomePage.hero');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* 添加结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main id="hero" className="overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <section className="relative">
          <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
            {/* SEO优化的标题 - 包含更多关键词 */}
            <h1 className="text-center text-balance text-5xl font-bricolage-grotesque lg:text-7xl xl:text-8xl">
              <TextEffect
                per="word"
                preset="fade-in-blur"
                speedSegment={0.3}
                as="span"
              >
                Free Online Watermark Remover
              </TextEffect>
              <TextEffect
                per="word"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.3}
                as="span"
                className="block text-primary"
              >
                Instant AI-Powered Removal
              </TextEffect>
            </h1>

            {/* 增强的描述 - 包含更多长尾关键词 */}
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.5}
              as="p"
              className="mx-auto mt-6 max-w-2xl text-center text-balance text-lg text-muted-foreground lg:text-xl"
            >
              Remove watermarks from photos online instantly with our professional 
              AI watermark remover tool. Erase logos, text, dates, and signatures 
              from images automatically. No software download required - 100% free, 
              secure, and maintains HD quality.
            </TextEffect>

            {/* 信任指标 */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                2M+ Users
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                4.8/5 Rating
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                100% Secure
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                5s Processing
              </Badge>
            </div>

            {/* Upload area */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={cn(
                  'relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
                  'bg-gradient-to-b from-primary/5 to-transparent',
                  'hover:border-primary/50 hover:bg-primary/10',
                  isDragging && 'border-primary bg-primary/20',
                  !isDragging && 'border-border/50'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload image to remove watermark"
                />

                <div className="p-12 lg:p-16 text-center">
                  {selectedFile ? (
                    <div className="space-y-4">
                      <ImageIcon className="mx-auto h-16 w-16 text-primary" />
                      <div>
                        <p className="text-lg font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ready to remove watermark automatically
                        </p>
                      </div>
                      <Button size="lg" className="mt-4">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Remove Watermark Now - Free
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CloudUpload className="mx-auto h-16 w-16 text-muted-foreground/50" />
                      <div className="mt-6 space-y-2">
                        <p className="text-xl font-medium">
                          Drop your watermarked image here, or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports JPG, PNG, WEBP, BMP up to 50MB | Batch processing available
                        </p>
                      </div>
                      <Button size="lg" className="mt-6">
                        Select Watermarked Image
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </AnimatedGroup>

            {/* 支持的水印类型 */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Removes all watermark types:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'Text Watermarks',
                  'Logo Watermarks', 
                  'Date Stamps',
                  'Signatures',
                  'Copyright Marks',
                  'Semi-transparent Overlays',
                  'Pattern Watermarks',
                  'QR Codes'
                ].map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Watermark Removal Comparison */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 1.2,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-12 mb-8 max-w-4xl mx-auto px-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Professional Watermark Removal Results
                </h2>
                <p className="text-lg text-muted-foreground">
                  See how our AI instantly removes watermarks while preserving image quality
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src="/demo/generated/food_photography_text_center.webp"
                      alt="Image with watermark - before removal"
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src="/demo/generated/food_photography_clean.webp"
                      alt="Image after watermark removal - clean result"
                    />
                  }
                  position={50}
                  className="h-[400px] md:h-[500px] lg:h-[600px]"
                />

                {/* Labels */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur"
                  >
                    Before
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur"
                  >
                    After
                  </Badge>
                </div>
              </div>

              {/* 使用场景 */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Perfect for:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'E-commerce Products',
                    'Real Estate Photos',
                    'Stock Photography',
                    'Social Media Content',
                    'Portfolio Images',
                    'Educational Materials'
                  ].map(use => (
                    <Badge key={use} variant="secondary" className="text-xs">
                      {use}
                    </Badge>
                  ))}
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}
