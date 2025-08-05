'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Check, Lock } from 'lucide-react';

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

export default function TrustSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.2,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 p-12">
            <Lock className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Your Privacy is Our Priority
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              All images are processed securely and automatically deleted from
              our servers after download. We never store, share, or use your
              images for any purpose.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="font-medium">256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="font-medium">Auto-Delete After Download</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="font-medium">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
