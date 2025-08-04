'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  totalReviews: number;
  className?: string;
}

export default function RatingDisplay({
  rating = 4.9,
  maxRating = 5,
  totalReviews = 2500,
  className,
}: RatingDisplayProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxRating - Math.ceil(rating);

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      <div className="flex items-center space-x-1">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="h-5 w-5 fill-yellow-400 text-yellow-400"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-5 w-5 text-gray-300" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: '50%' }}
            >
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
        ))}
      </div>

      <div className="flex items-center space-x-2 text-sm">
        <span className="font-semibold text-lg">{rating}</span>
        <span className="text-muted-foreground">out of {maxRating}</span>
      </div>

      <p className="text-sm text-muted-foreground">
        Based on {totalReviews.toLocaleString()}+ reviews
      </p>
    </div>
  );
}
