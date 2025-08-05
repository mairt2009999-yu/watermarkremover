'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Upload, Wand2, Download, Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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
      title: 'Upload Your Image',
      description: 'Drag and drop or click to upload your watermarked image',
      icon: <Upload className="h-6 w-6" />,
      image: '/demo/step-upload.svg',
      details: [
        'Support for JPG, PNG, WEBP, BMP formats',
        'Files up to 50MB',
        'Batch upload up to 50 images',
        'Secure encrypted upload',
      ],
    },
    {
      id: 2,
      title: 'AI Processing',
      description: 'Our advanced AI automatically detects and removes watermarks',
      icon: <Wand2 className="h-6 w-6" />,
      image: '/demo/step-process.svg',
      details: [
        'Smart watermark detection',
        'Preserves image quality',
        'Handles complex patterns',
        'Real-time processing status',
      ],
    },
    {
      id: 3,
      title: 'Download Result',
      description: 'Get your clean, watermark-free image in seconds',
      icon: <Download className="h-6 w-6" />,
      image: '/demo/step-download.svg',
      details: [
        'Original resolution maintained',
        'Multiple format options',
        'Batch download available',
        'Auto-delete for privacy',
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
            How It Works
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Remove watermarks from your images in three simple steps
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