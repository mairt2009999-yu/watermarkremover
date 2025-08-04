'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Database, Globe, Lock, Shield } from 'lucide-react';

interface Badge {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  color: string;
}

const badges: Badge[] = [
  {
    icon: Lock,
    label: 'SSL Secured',
    tooltip: 'All data transfers are encrypted with SSL/TLS',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Shield,
    label: 'Privacy Protected',
    tooltip: 'Your images are automatically deleted after processing',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Database,
    label: 'No Data Storage',
    tooltip: 'We never store your images or personal data',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: Globe,
    label: 'GDPR Compliant',
    tooltip: 'Fully compliant with GDPR and privacy regulations',
    color: 'text-orange-600 dark:text-orange-400',
  },
];

interface TrustBadgesProps {
  className?: string;
}

export default function TrustBadges({ className }: TrustBadgesProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-4 md:gap-6',
          className
        )}
      >
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className="flex cursor-pointer items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-700">
                  <Icon className={cn('h-4 w-4', badge.color)} />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{badge.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
