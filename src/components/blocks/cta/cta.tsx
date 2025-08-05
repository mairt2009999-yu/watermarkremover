'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

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

export default function CTASection() {
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
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Remove Watermarks?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust our AI-powered watermark remover
            for their images
          </p>
          <Button size="lg" className="text-lg px-8 py-6">
            <Sparkles className="mr-2 h-5 w-5" />
            Start Removing Watermarks Now
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required " 2 free images daily
          </p>
        </AnimatedGroup>
      </div>
    </section>
  );
}
