'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { TextEffect } from '@/components/tailark/motion/text-effect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CloudUpload, 
  Sparkles, 
  Shield, 
  Zap,
  ArrowRight,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useRef, DragEvent } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

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
                Remove Watermarks
              </TextEffect>
              <TextEffect
                per="word"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.3}
                as="span"
                className="block text-primary"
              >
                Instantly with AI
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
              Upload any image and let our advanced AI technology automatically detect and remove watermarks, logos, and text in seconds. No skills required.
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
                  "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
                  "bg-gradient-to-b from-primary/5 to-transparent",
                  "hover:border-primary/50 hover:bg-primary/10",
                  isDragging && "border-primary bg-primary/20",
                  !isDragging && "border-border/50"
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
                        <p className="text-lg font-medium">{selectedFile.name}</p>
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
                      <Button
                        size="lg"
                        className="mt-6"
                      >
                        Select Image
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </AnimatedGroup>

            {/* Features list */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 1,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-3 justify-center">
                <div className="rounded-full bg-primary/10 p-1">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Batch Processing</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="rounded-full bg-primary/10 p-1">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">HD Quality Output</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="rounded-full bg-primary/10 p-1">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">5 Second Processing</span>
              </div>
            </AnimatedGroup>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10M+</div>
                <div className="text-sm text-muted-foreground mt-1">Images Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5s</div>
                <div className="text-sm text-muted-foreground mt-1">Avg. Time</div>
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
              className="mt-20 max-w-4xl mx-auto px-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Remove Watermarks Instantly
                </h2>
                <p className="text-lg text-muted-foreground">
                  Drag the slider to see the magic of AI watermark removal
                </p>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src="/demo/watermark-before.svg"
                      alt="Image with watermark"
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src="/demo/watermark-after.svg"
                      alt="Image after watermark removal"
                    />
                  }
                  position={50}
                  className="h-[400px] md:h-[500px] lg:h-[600px]"
                />
                
                {/* Labels */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                    Before
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                    After
                  </Badge>
                </div>
              </div>
            </AnimatedGroup>

          </div>
        </section>
      </main>
    </>
  );
}