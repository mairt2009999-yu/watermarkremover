'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Download, Upload, Wand2 } from 'lucide-react';

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
    },
  },
};

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            },
            ...transitionVariants,
          }}
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
              <h3 className="text-xl font-semibold mb-2">1. Upload Image</h3>
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
              <h3 className="text-xl font-semibold mb-2">2. AI Processing</h3>
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
              <h3 className="text-xl font-semibold mb-2">3. Download Result</h3>
              <p className="text-muted-foreground">
                Get your clean image instantly in high quality
              </p>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
