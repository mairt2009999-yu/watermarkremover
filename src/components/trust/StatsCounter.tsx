'use client';

import { NumberTicker } from '@/components/magicui/number-ticker';
import { cn } from '@/lib/utils';
import { CheckCircle, Image, Users, Zap } from 'lucide-react';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  label: string;
  color: string;
}

const stats: StatItem[] = [
  {
    icon: Image,
    value: 1000000,
    suffix: '+',
    label: 'Images Processed',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Users,
    value: 50000,
    suffix: '+',
    label: 'Happy Users',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: CheckCircle,
    value: 99.9,
    suffix: '%',
    label: 'Success Rate',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Zap,
    value: 5,
    suffix: 's',
    label: 'Processing Time',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
];

export default function StatsCounter() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="flex flex-col items-center justify-center space-y-2 text-center"
          >
            <Icon className={cn('h-8 w-8 mb-2', stat.color)} />
            <div className="flex items-baseline justify-center">
              <NumberTicker
                value={stat.value}
                decimalPlaces={stat.label === 'Success Rate' ? 1 : 0}
                className="text-3xl font-bold md:text-4xl"
              />
              {stat.suffix && (
                <span className="ml-1 text-2xl font-bold text-muted-foreground md:text-3xl">
                  {stat.suffix}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground md:text-base">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
