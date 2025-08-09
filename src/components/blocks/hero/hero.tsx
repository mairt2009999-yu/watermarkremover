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
  Sparkles,
  Star,
  Upload,
  Users,
  Wand2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type DragEvent, useRef, useState } from 'react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

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

export default function HeroSection() {
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
      <main id="hero" className="overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <section className="relative">
          <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
            {/* Title */}
            <h1 className="text-center text-balance text-5xl font-bricolage-grotesque lg:text-7xl xl:text-8xl">
              <TextEffect
                per="word"
                preset="fade-in-blur"
                speedSegment={0.3}
                as="span"
              >
                Free AI Watermark Remover
              </TextEffect>
              <TextEffect
                per="word"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.3}
                as="span"
                className="block text-primary"
              >
                Online Tool
              </TextEffect>
            </h1>

            {/* Description */}
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.5}
              as="p"
              className="mx-auto mt-6 max-w-2xl text-center text-balance text-lg text-muted-foreground lg:text-xl"
            >
              Professional online watermark remover tool. Remove text, logos, and patterns from images instantly with AI. 
              Free, fast, HD quality - no registration required.
            </TextEffect>

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
                          Ready to remove watermark
                        </p>
                      </div>
                      <Button size="lg" className="mt-4">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Remove Watermark Now
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CloudUpload className="mx-auto h-16 w-16 text-muted-foreground/50" />
                      <div className="mt-6 space-y-2">
                        <p className="text-xl font-medium">
                          Drop your image here, or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports JPG, PNG, WEBP up to 50MB
                        </p>
                      </div>
                      <Button size="lg" className="mt-6">
                        Select Image
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-3">
                        Free • No Sign-up • Instant Results
                      </p>
                    </>
                  )}
                </div>
              </div>
            </AnimatedGroup>

            {/* Effect Preview Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 1.0,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-16 mb-8 max-w-5xl mx-auto px-6"
            >
              <div className="text-center mb-8">
                <Badge className="mb-4" variant="secondary">
                  See the Magic in Action
                </Badge>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  AI Watermark Removal - Instant Results
                </h2>
                <p className="text-base text-muted-foreground max-w-xl mx-auto">
                  Drag the slider to see how our AI instantly removes watermarks while preserving image quality
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background">
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src="/demo/generated/food_photography_text_center.webp"
                      alt="Image with watermark - before AI removal"
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src="/demo/generated/food_photography_clean.webp"
                      alt="Clean image after AI watermark removal"
                    />
                  }
                  position={50}
                  className="h-[300px] md:h-[400px] lg:h-[450px]"
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

                {/* Processing indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <Badge
                    variant="outline"
                    className="bg-background/90 backdrop-blur gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    AI Processing Complete
                  </Badge>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">3s</div>
                  <div className="text-xs text-muted-foreground">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">HD</div>
                  <div className="text-xs text-muted-foreground">Quality Preserved</div>
                </div>
              </div>
            </AnimatedGroup>

            {/* Features Highlight Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 1.4,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-20 mb-8 max-w-4xl mx-auto px-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  Why Choose Our Free Online Watermark Remover?
                </h2>
                <p className="text-base text-muted-foreground">
                  Professional-grade AI technology with instant results - no registration required
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent border border-border/50">
                  <Badge className="mb-4" variant="secondary">Free Online Tool</Badge>
                  <h3 className="font-semibold mb-2">No Sign-up Required</h3>
                  <p className="text-sm text-muted-foreground">Start removing watermarks instantly - completely free</p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent border border-border/50">
                  <Badge className="mb-4" variant="secondary">Batch Processing</Badge>
                  <h3 className="font-semibold mb-2">Upload Multiple Images</h3>
                  <p className="text-sm text-muted-foreground">Process up to 10 images at once for maximum efficiency</p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent border border-border/50">
                  <Badge className="mb-4" variant="secondary">HD Quality</Badge>
                  <h3 className="font-semibold mb-2">Original Quality Preserved</h3>
                  <p className="text-sm text-muted-foreground">No blur, no artifacts - maintain perfect image quality</p>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}
