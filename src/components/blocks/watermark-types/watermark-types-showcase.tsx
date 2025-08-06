'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  FileImage,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

interface WatermarkType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  beforeImage: string;
  afterImage: string;
  features: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
}

export default function WatermarkTypesShowcase() {
  const [activeType, setActiveType] = useState(0);

  const watermarkTypes: WatermarkType[] = [
    {
      id: 'visible-text-logo',
      title: 'Visible Watermarks (Text, Logo, Pattern)',
      description:
        'Clearly visible text, brand logos, or decorative pattern watermarks',
      icon: <FileImage className="h-5 w-5" />,
      beforeImage: '/demo/visible-text-before.webp',
      afterImage: '/demo/visible-text-after.webp',
      features: [
        'Text watermark removal',
        'Logo cleanup',
        'Pattern removal',
        'Copyright mark clearing',
      ],
      difficulty: 'Easy',
    },
    {
      id: 'semi-transparent',
      title: 'Semi-Transparent Watermarks',
      description:
        'Semi-transparent overlays or background watermarks with varying opacity',
      icon: <Layers className="h-5 w-5" />,
      beforeImage: '/demo/semi-transparent-before.webp',
      afterImage: '/demo/semi-transparent-after.webp',
      features: [
        'Transparency detection',
        'Background reconstruction',
        'Color restoration',
        'Detail protection',
      ],
      difficulty: 'Medium',
    },
    {
      id: 'embedded-digital',
      title: 'Embedded Digital Watermarks',
      description: 'Invisible digital identifiers hidden within image data',
      icon: <Eye className="h-5 w-5" />,
      beforeImage: '/demo/embedded-digital-before.webp',
      afterImage: '/demo/embedded-digital-after.webp',
      features: [
        'Deep AI detection',
        'Frequency domain analysis',
        'Invisible mark removal',
        'Data integrity protection',
      ],
      difficulty: 'Expert',
    },
    {
      id: 'repetitive-pattern',
      title: 'Repetitive Pattern Watermarks',
      description:
        'Repeating logo patterns, textures, or geometric shape watermarks',
      icon: <RotateCcw className="h-5 w-5" />,
      beforeImage: '/demo/repetitive-pattern-before.webp',
      afterImage: '/demo/repetitive-pattern-after.webp',
      features: [
        'Pattern recognition',
        'Repetitive element detection',
        'Smart fill',
        'Texture reconstruction',
      ],
      difficulty: 'Hard',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'Hard':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'Expert':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="secondary">
            AI Technology
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Four Watermark Types – AI-Powered Watermark Remover
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our advanced AI technology precisely identifies and removes various
            types of watermarks, whether visible text logos or hidden digital
            identifiers
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Type Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {watermarkTypes.map((type, index) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-300 border ${
                  activeType === index
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border/50 hover:border-primary/50'
                }`}
                onClick={() => setActiveType(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeType === index
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm leading-tight">
                          {type.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getDifficultyColor(type.difficulty)}`}
                        >
                          {type.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {type.description}
                      </p>
                      {activeType === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 pt-3 border-t border-border/50"
                        >
                          <div className="space-y-1">
                            {type.features.map((feature, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs"
                              >
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                    {activeType === index && (
                      <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Comparison Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="space-y-6">
              {/* Active Type Info */}
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {watermarkTypes[activeType].title}
                </h3>
                <p className="text-muted-foreground">
                  {watermarkTypes[activeType].description}
                </p>
              </div>

              {/* Comparison Slider */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeType}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="aspect-video"
                  >
                    <ReactCompareSlider
                      itemOne={
                        <ReactCompareSliderImage
                          src={watermarkTypes[activeType].beforeImage}
                          alt={`${watermarkTypes[activeType].title} - Before`}
                        />
                      }
                      itemTwo={
                        <ReactCompareSliderImage
                          src={watermarkTypes[activeType].afterImage}
                          alt={`${watermarkTypes[activeType].title} - After`}
                        />
                      }
                      position={50}
                      className="h-full"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Labels */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur"
                  >
                    Before
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur"
                  >
                    After
                  </Badge>
                </div>

                {/* Processing Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge
                    variant="outline"
                    className="bg-background/90 backdrop-blur"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Drag slider to compare
                  </Badge>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {watermarkTypes[activeType].features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center pt-4">
                <Button size="lg" className="group">
                  Try Now {watermarkTypes[activeType].title.split('(')[0]}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
