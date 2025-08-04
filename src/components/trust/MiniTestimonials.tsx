'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'E-commerce Manager',
    avatar: 'https://i.pravatar.cc/150?img=1',
    quote: 'Incredibly fast and accurate! Saved me hours of editing work.',
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Professional Photographer',
    avatar: 'https://i.pravatar.cc/150?img=3',
    quote: 'The AI is amazing - it preserves image quality perfectly.',
  },
  {
    id: 3,
    name: 'Emma Thompson',
    role: 'Content Creator',
    avatar: 'https://i.pravatar.cc/150?img=5',
    quote: "Best watermark remover I've tried. Simple and effective!",
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Marketing Student',
    avatar: 'https://i.pravatar.cc/150?img=8',
    quote: 'Free tier is generous and the results are professional-grade.',
  },
];

interface MiniTestimonialsProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export default function MiniTestimonials({
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
}: MiniTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (autoPlay && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div
      className={cn('relative max-w-2xl mx-auto', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Card className="border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-600">
              <AvatarImage
                src={currentTestimonial.avatar}
                alt={currentTestimonial.name}
              />
              <AvatarFallback>
                {currentTestimonial.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <blockquote className="text-gray-700 dark:text-gray-300 italic">
                "{currentTestimonial.quote}"
              </blockquote>
              <div className="mt-2">
                <p className="font-semibold text-sm">
                  {currentTestimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentTestimonial.role}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -ml-10"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -mr-10"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="mt-4 flex justify-center space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              'h-2 w-2 rounded-full transition-all',
              index === currentIndex
                ? 'bg-primary w-6'
                : 'bg-gray-300 dark:bg-gray-600'
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
