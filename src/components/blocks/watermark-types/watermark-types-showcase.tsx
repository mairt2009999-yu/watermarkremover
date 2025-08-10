'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  WATERMARK_TYPES,
  watermarkTypesConfig,
} from '@/config/watermark-types.config';
import { DIFFICULTY_COLORS } from '@/types/watermark.types';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Play, TrendingUp } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

export default function WatermarkTypesShowcase() {
  const [activeType, setActiveType] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const locale = useLocale() as 'en' | 'zh';

  // Use configuration data
  const watermarkTypes = watermarkTypesConfig.types;

  // Preload images for better performance
  useEffect(() => {
    watermarkTypes.forEach((type) => {
      const img1 = new Image();
      const img2 = new Image();
      img1.src = type.examples.before;
      img2.src = type.examples.after;
    });
  }, [watermarkTypes]);

  // Handle type change with loading state
  const handleTypeChange = (index: number) => {
    if (index === activeType) return;
    setIsLoading(true);
    setActiveType(index);
    setTimeout(() => setIsLoading(false), 300);
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
            {locale === 'zh' ? 'AI 技术' : 'AI Technology'}
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {locale === 'zh'
              ? '四种水印类型 – AI驱动的水印去除'
              : 'Four Watermark Types – AI-Powered Watermark Remover'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {locale === 'zh'
              ? '我们的先进AI技术可精确识别和去除各种类型的水印，从可见文字标志到复杂图案'
              : 'Our advanced AI technology precisely identifies and removes various types of watermarks, from visible text and logos to complex patterns'}
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
                onClick={() => handleTypeChange(index)}
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
                          {type.title[locale]}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${DIFFICULTY_COLORS[type.difficulty]}`}
                        >
                          {type.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {type.description[locale]}
                      </p>
                      {activeType === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 pt-3 border-t border-border/50"
                        >
                          {/* Processing metrics */}
                          <div className="flex items-center gap-4 mb-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" />
                              <span>{type.processingTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span>
                                {type.successRate}%{' '}
                                {locale === 'zh' ? '成功率' : 'success'}
                              </span>
                            </div>
                          </div>
                          {/* Features */}
                          <div className="space-y-1">
                            {type.features[locale].map((feature, i) => (
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
                  {watermarkTypes[activeType].title[locale]}
                </h3>
                <p className="text-muted-foreground">
                  {watermarkTypes[activeType].description[locale]}
                </p>
                {/* Processing info badges */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {watermarkTypes[activeType].processingTime}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {watermarkTypes[activeType].successRate}%{' '}
                    {locale === 'zh' ? '成功率' : 'Success Rate'}
                  </Badge>
                </div>
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
                          src={watermarkTypes[activeType].examples.before}
                          alt={`${watermarkTypes[activeType].title[locale]} - Before`}
                        />
                      }
                      itemTwo={
                        <ReactCompareSliderImage
                          src={watermarkTypes[activeType].examples.after}
                          alt={`${watermarkTypes[activeType].title[locale]} - After`}
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
                    {locale === 'zh' ? '处理前' : 'Before'}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur"
                  >
                    {locale === 'zh' ? '处理后' : 'After'}
                  </Badge>
                </div>

                {/* Processing Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge
                    variant="outline"
                    className="bg-background/90 backdrop-blur"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {locale === 'zh'
                      ? '拖动滑块对比'
                      : 'Drag slider to compare'}
                  </Badge>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {watermarkTypes[activeType].features[locale].map(
                  (feature, index) => (
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
                  )
                )}
              </div>

              {/* Use Cases */}
              {watermarkTypes[activeType].useCases && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-semibold mb-2">
                    {locale === 'zh' ? '常见用途' : 'Common Use Cases'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {watermarkTypes[activeType].useCases.map(
                      (useCase, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {useCase}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Batch Processing Features */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <Badge
                    variant="default"
                    className="bg-primary text-primary-foreground"
                  >
                    {locale === 'zh' ? '批量处理' : 'Batch Processing'}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {locale === 'zh'
                      ? '最多同时处理10张图片'
                      : 'Process up to 10 images at once'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {locale === 'zh'
                      ? '同时上传多张图片'
                      : 'Upload multiple images'}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {locale === 'zh'
                      ? '批量下载处理结果'
                      : 'Batch download results'}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {locale === 'zh'
                      ? '实时处理进度显示'
                      : 'Real-time progress tracking'}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {locale === 'zh'
                      ? '保持原始图片质量'
                      : 'Preserve original quality'}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-6">
                <Button size="lg" className="group mb-3">
                  {locale === 'zh'
                    ? `免费在线去除${watermarkTypes[activeType].title.zh}`
                    : `Remove ${watermarkTypes[activeType].title.en} Online Free`}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  {locale === 'zh'
                    ? '无需注册 • 完全免费 • 支持批处理 • 保持高清质量'
                    : 'No Sign-up Required • Completely Free • Batch Support • HD Quality'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
