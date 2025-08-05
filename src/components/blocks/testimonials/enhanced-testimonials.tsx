'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

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

export default function EnhancedTestimonials() {
  const t = useTranslations('HomePage.testimonials');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechFlow Solutions',
      content: 'This tool saved us countless hours! We processed over 500 product images in minutes. The AI is incredibly accurate and preserves image quality perfectly.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      highlight: '500+ images processed',
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      role: 'E-commerce Manager',
      company: 'ShopStyle Inc',
      content: 'The batch processing feature is a game-changer. We can now update our entire catalog without manual editing. Customer satisfaction increased by 40%.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      highlight: '40% satisfaction boost',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Content Creator',
      company: 'Creative Studios',
      content: 'As a content creator, I need fast and reliable tools. This watermark remover exceeds expectations with its speed and accuracy. Highly recommended!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      highlight: 'Professional results',
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Photography Studio Owner',
      company: 'Lens Masters',
      content: 'We\'ve tried many watermark removal tools, but this is by far the best. The AI technology is impressive and the results are consistently excellent.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      highlight: 'Best in class',
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % testimonials.length;
      }
      return (prev - 1 + testimonials.length) % testimonials.length;
    });
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Display */}
          <div className="relative h-[400px] md:h-[350px]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute inset-0"
              >
                <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-8 md:p-10 h-full flex flex-col">
                    {/* Quote Icon */}
                    <Quote className="h-10 w-10 text-primary/20 mb-6" />

                    {/* Content */}
                    <blockquote className="flex-1 text-lg md:text-xl leading-relaxed mb-6">
                      "{testimonials[currentIndex].content}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
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
                            {testimonials[currentIndex].role},{' '}
                            {testimonials[currentIndex].company}
                          </p>
                        </div>
                      </div>

                      {/* Rating and Highlight */}
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
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by thousands of professionals worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50,000+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2M+</div>
                <div className="text-sm text-muted-foreground">Images Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}