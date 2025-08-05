'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { TextEffect } from '@/components/tailark/motion/text-effect';
import {
  MiniTestimonials,
  RatingDisplay,
  StatsCounter,
  TrustBadges,
} from '@/components/trust';
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
              Upload any image and let our advanced AI technology automatically
              detect and remove watermarks, logos, and text in seconds. No
              skills required.
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
                    </>
                  )}
                </div>
              </div>
            </AnimatedGroup>

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
              className="mt-12 max-w-4xl mx-auto px-6"
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
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
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

            {/* Trust Indicators Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 1.3,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-16 max-w-6xl mx-auto"
            >
              <StatsCounter />

              <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8">
                <RatingDisplay rating={4.9} totalReviews={2500} />
                <div className="hidden md:block w-px h-16 bg-border" />
                <TrustBadges />
              </div>

              <div className="mt-12">
                <MiniTestimonials />
              </div>
            </AnimatedGroup>

            {/* Features Grid Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 1.5,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-24 max-w-6xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Powerful Features for Perfect Results
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Advanced AI technology that handles any watermark type with
                  precision
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    AI-Powered Detection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically detects and removes watermarks, logos, and
                    text with advanced AI algorithms
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                    <FileImage className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Multiple Formats
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG, WEBP, BMP, and TIFF formats with
                    high-resolution output
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Batch Processing
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Process multiple images at once to save time on large
                    projects
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Fast Processing
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Remove watermarks in seconds with our optimized processing
                    engine
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">100% Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your images are processed securely and deleted immediately
                    after download
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No Sign-up Required
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start removing watermarks instantly without creating an
                    account
                  </p>
                </div>
              </div>
            </AnimatedGroup>

            {/* How It Works Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 1.8,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-24 max-w-5xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  How It Works
                </h2>
                <p className="text-lg text-muted-foreground">
                  Remove watermarks in 3 simple steps
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <div className="relative rounded-full bg-primary text-primary-foreground flex items-center justify-center w-20 h-20">
                      <Upload className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    1. Upload Image
                  </h3>
                  <p className="text-muted-foreground">
                    Drag and drop or click to upload your watermarked image
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <div className="relative rounded-full bg-primary text-primary-foreground flex items-center justify-center w-20 h-20">
                      <Wand2 className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    2. AI Processing
                  </h3>
                  <p className="text-muted-foreground">
                    Our AI automatically detects and removes watermarks
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <div className="relative rounded-full bg-primary text-primary-foreground flex items-center justify-center w-20 h-20">
                      <Download className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    3. Download Result
                  </h3>
                  <p className="text-muted-foreground">
                    Get your clean image instantly in high quality
                  </p>
                </div>
              </div>
            </AnimatedGroup>

            {/* Testimonials Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 2.2,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-24 max-w-6xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Loved by Thousands
                </h2>
                <p className="text-lg text-muted-foreground">
                  See what our users say about us
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Testimonial 1 */}
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "This tool saved me hours of work! The AI perfectly removed
                    watermarks from my product photos without any trace.
                    Absolutely amazing!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">
                        E-commerce Owner
                      </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "I've tried many watermark removers, but this is by far the
                    best. Fast, accurate, and the quality is outstanding. Highly
                    recommended!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Michael Chen</p>
                      <p className="text-xs text-muted-foreground">
                        Graphic Designer
                      </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-4">
                    "The batch processing feature is a game-changer for my
                    workflow. I can process hundreds of images quickly with
                    consistent results."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Emma Williams</p>
                      <p className="text-xs text-muted-foreground">
                        Content Creator
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedGroup>

            {/* FAQ Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 2.4,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-24 max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-muted-foreground">
                  Everything you need to know about our service
                </p>
              </div>

              <div className="space-y-4">
                {/* FAQ Item 1 */}
                <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur">
                  <button className="w-full px-6 py-4 text-left flex items-center justify-between">
                    <span className="font-semibold">
                      What types of watermarks can be removed?
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* FAQ Item 2 */}
                <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur">
                  <button className="w-full px-6 py-4 text-left flex items-center justify-between">
                    <span className="font-semibold">Is my data secure?</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* FAQ Item 3 */}
                <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur">
                  <button className="w-full px-6 py-4 text-left flex items-center justify-between">
                    <span className="font-semibold">
                      What image formats are supported?
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* FAQ Item 4 */}
                <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur">
                  <button className="w-full px-6 py-4 text-left flex items-center justify-between">
                    <span className="font-semibold">
                      Can I process multiple images at once?
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* FAQ Item 5 */}
                <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur">
                  <button className="w-full px-6 py-4 text-left flex items-center justify-between">
                    <span className="font-semibold">Do you offer refunds?</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </AnimatedGroup>

            {/* Trust & Security Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 2.6,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-24 max-w-4xl mx-auto text-center"
            >
              <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 p-12">
                <Lock className="h-12 w-12 text-primary mx-auto mb-6" />
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  Your Privacy is Our Priority
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  All images are processed securely and automatically deleted
                  from our servers after download. We never store, share, or use
                  your images for any purpose.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="font-medium">256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      Auto-Delete After Download
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="font-medium">GDPR Compliant</span>
                  </div>
                </div>
              </div>
            </AnimatedGroup>

            {/* Final CTA Section */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 2.8,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-24 max-w-4xl mx-auto text-center pb-24"
            >
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Ready to Remove Watermarks?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust our AI-powered watermark
                remover for their images
              </p>
              <Button size="lg" className="text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Removing Watermarks Now
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • 2 free images daily
              </p>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}
