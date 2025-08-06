'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Quote,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  highlight: string;
}

interface TrustFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function SimpleTestimonials() {
  const t = useTranslations('HomePage.testimonials');
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechFlow Solutions',
      content:
        'This tool saved us countless hours! We processed over 500 product images in minutes. The AI is incredibly accurate and preserves image quality perfectly.',
      rating: 5,
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      highlight: '500+ images processed',
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      role: 'E-commerce Manager',
      company: 'ShopStyle Inc',
      content:
        'The batch processing feature is a game-changer. We can now update our entire catalog without manual editing. Customer satisfaction increased by 40%.',
      rating: 5,
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      highlight: '40% satisfaction boost',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Content Creator',
      company: 'Creative Studios',
      content:
        'As a content creator, I need fast and reliable tools. This watermark remover exceeds expectations with its speed and accuracy. Highly recommended!',
      rating: 5,
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      highlight: 'Professional results',
    },
  ];

  const trustFeatures: TrustFeature[] = [
    {
      icon: <Lock className="h-4 w-4" />,
      title: 'SSL Encrypted',
      description: 'Military-grade security',
    },
    {
      icon: <Shield className="h-4 w-4" />,
      title: 'Auto-Delete',
      description: 'Files deleted after 1 hour',
    },
    {
      icon: <Globe className="h-4 w-4" />,
      title: 'GDPR Compliant',
      description: 'Privacy law compliant',
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: 'No Training',
      description: 'Your data stays private',
    },
  ];

  const paginate = (newDirection: number) => {
    if (newDirection === 1) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    } else {
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="secondary">
            Trusted Worldwide
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Loved by Professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who trust our AI-powered watermark
            removal technology
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary">
              50K+
            </div>
            <div className="text-sm text-muted-foreground">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary">
              2M+
            </div>
            <div className="text-sm text-muted-foreground">
              Images Processed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary">
              4.9/5
            </div>
            <div className="text-sm text-muted-foreground">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary">
              150+
            </div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-primary/20 mb-4" />

                <blockquote className="text-lg leading-relaxed mb-6">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage
                        src={testimonials[currentIndex].avatar}
                        alt={testimonials[currentIndex].name}
                      />
                      <AvatarFallback>
                        {testimonials[currentIndex].name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex gap-1 mb-1">
                      {[...Array(testimonials[currentIndex].rating)].map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-500 text-yellow-500"
                          />
                        )
                      )}
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {testimonials[currentIndex].highlight}
                    </span>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(-1)}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? 'w-6 bg-primary'
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(1)}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Privacy & Security First
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your data security is our top priority. We use
                  industry-leading measures to protect your images.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {trustFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 rounded-xl border border-border/50 bg-background/50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  <span className="font-medium">100% Private:</span> Images
                  auto-deleted after processing
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
