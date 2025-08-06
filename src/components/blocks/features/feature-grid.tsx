'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  Download,
  Globe,
  Image,
  Layers,
  type LucideIcon,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  stats?: string;
}

export default function FeatureGrid() {
  const t = useTranslations('HomePage.features');

  const features: FeatureCard[] = [
    {
      icon: Sparkles,
      title: 'AI 智能识别',
      description:
        '先进AI技术精准识别各种水印类型，包括文字、Logo、图案和隐藏水印',
      gradient: 'from-primary/30 to-primary/20',
      stats: '98%',
    },
    {
      icon: Zap,
      title: '极速处理',
      description: '5秒内完成图片处理，支持批量上传，大幅提升工作效率',
      gradient: 'from-primary/20 to-primary/10',
      stats: '5s',
    },
    {
      icon: Image,
      title: '无损画质',
      description: '保持原始分辨率和画质，支持4K高分辨率图片处理',
      gradient: 'from-primary/25 to-primary/15',
      stats: '4K',
    },
    {
      icon: Shield,
      title: '隐私保护',
      description: '图片加密传输，处理完成后自动删除，保护您的隐私安全',
      gradient: 'from-muted-foreground/10 to-muted-foreground/5',
      stats: '100%',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl lg:text-4xl font-bold mb-4"
          >
            专业水印去除，AI 驱动
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            基于先进AI技术的专业水印去除工具，快速、精准、安全
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-2xl opacity-25 group-hover:opacity-40 transition-opacity duration-300`}
                />
                <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 h-full hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/15 transition-colors duration-300">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {feature.stats && (
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {feature.stats}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  <motion.div
                    className="mt-4 flex items-center text-sm text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    Learn more
                    <Download className="ml-1 h-3 w-3" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
