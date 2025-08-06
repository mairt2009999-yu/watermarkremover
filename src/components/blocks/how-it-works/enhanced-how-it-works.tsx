'use client';

import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Download, Upload, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  details: string[];
}

export default function EnhancedHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps: Step[] = [
    {
      id: 1,
      title: '上传图片',
      description: '拖拽或点击上传您需要去除水印的图片',
      icon: <Upload className="h-6 w-6" />,
      image: '/demo/step-upload.svg',
      details: [
        '支持 JPG、PNG、WEBP、BMP 格式',
        '文件大小最大 50MB',
        '支持批量上传 50 张图片',
        '加密安全上传',
      ],
    },
    {
      id: 2,
      title: 'AI 智能处理',
      description: '先进AI技术自动识别并精准去除各种水印',
      icon: <Wand2 className="h-6 w-6" />,
      image: '/demo/step-process.svg',
      details: [
        '智能水印检测识别',
        '完美保持图片画质',
        '处理复杂图案水印',
        '实时显示处理进度',
      ],
    },
    {
      id: 3,
      title: '下载结果',
      description: '几秒钟内获得干净无水印的高质量图片',
      icon: <Download className="h-6 w-6" />,
      image: '/demo/step-download.svg',
      details: [
        '保持原始分辨率',
        '多种格式选择',
        '支持批量下载',
        '自动删除保护隐私',
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
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
            简单三步，轻松去水印
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            上传、处理、下载，AI 帮您快速去除图片水印
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps Navigation */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-6"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={itemVariants}
                onClick={() => setActiveStep(index)}
                className={`cursor-pointer group relative`}
              >
                <div
                  className={`flex items-start gap-4 p-6 rounded-2xl border transition-all duration-300 ${
                    activeStep === index
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {/* Step Number */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      activeStep === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border-2 border-border group-hover:border-primary/50'
                    }`}
                  >
                    {activeStep > index ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      {step.icon}
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>

                    {/* Details (shown when active) */}
                    <AnimatePresence>
                      {activeStep === index && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-2"
                        >
                          {step.details.map((detail, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {detail}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Arrow Indicator */}
                  <ArrowRight
                    className={`h-5 w-5 transition-all duration-300 ${
                      activeStep === index
                        ? 'text-primary translate-x-1'
                        : 'text-muted-foreground'
                    }`}
                  />
                </div>

                {/* Progress Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-[4.5rem] w-0.5 h-6 bg-border" />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Visual Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-video rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 flex items-center justify-center"
                >
                  {/* Placeholder for step images */}
                  <div className="text-center p-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary mb-4">
                      {steps[activeStep].icon}
                    </div>
                    <h4 className="text-lg font-semibold mb-2">
                      {steps[activeStep].title}
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      {steps[activeStep].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center mt-8"
            >
              <Button size="lg" className="group">
                Try It Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
