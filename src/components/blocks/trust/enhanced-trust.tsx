'use client';

import { Badge } from '@/components/ui/badge';
import { type Variants, motion } from 'framer-motion';
import { Award, CheckCircle, Globe, Lock, Shield, Zap } from 'lucide-react';

interface TrustFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Certification {
  name: string;
  icon: React.ReactNode;
}

export default function EnhancedTrustSection() {
  const trustFeatures: TrustFeature[] = [
    {
      icon: <Lock className="h-5 w-5" />,
      title: '256-bit SSL Encryption',
      description: 'Military-grade encryption for all data transfers',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Auto-Delete Policy',
      description: 'Images deleted within 1 hour after processing',
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: 'GDPR Compliant',
      description: 'Full compliance with international privacy laws',
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'No Data Training',
      description: 'Your images are never used for AI training',
    },
  ];

  const certifications: Certification[] = [
    { name: 'SOC 2', icon: <Award className="h-8 w-8" /> },
    { name: 'ISO 27001', icon: <Shield className="h-8 w-8" /> },
    { name: 'GDPR', icon: <CheckCircle className="h-8 w-8" /> },
    { name: 'CCPA', icon: <Globe className="h-8 w-8" /> },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
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
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              Security & Privacy
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Your Privacy is Our Top Priority
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We use industry-leading security measures to protect your images
              and data. Your content is processed securely and never stored or
              shared.
            </p>
          </motion.div>

          {/* Main Trust Card */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12 mb-12 border border-border/50"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {trustFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trust Timeline */}
              <div className="border-t border-border/50 pt-8">
                <h4 className="text-center font-semibold mb-6">
                  Your Data Journey
                </h4>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      1
                    </div>
                    <span className="text-sm">Upload (Encrypted)</span>
                  </div>
                  <div className="hidden md:block flex-1 h-0.5 bg-border" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      2
                    </div>
                    <span className="text-sm">Process (Isolated)</span>
                  </div>
                  <div className="hidden md:block flex-1 h-0.5 bg-border" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      3
                    </div>
                    <span className="text-sm">Download (Secure)</span>
                  </div>
                  <div className="hidden md:block flex-1 h-0.5 bg-border" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      4
                    </div>
                    <span className="text-sm">Auto-Delete (1hr)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div variants={itemVariants}>
            <h3 className="text-center text-sm font-medium text-muted-foreground mb-6">
              Certified & Compliant
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className="group"
                >
                  <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-300">
                    <div className="text-primary/60 group-hover:text-primary transition-colors">
                      {cert.icon}
                    </div>
                    <span className="text-xs font-medium">{cert.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
