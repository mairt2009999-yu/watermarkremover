'use client';

import { websiteConfig } from '@/config/website';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function Logo({ className }: { className?: string }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const logoLight = websiteConfig.metadata.images?.logoLight ?? '/logo.png';
  const logoDark = websiteConfig.metadata.images?.logoDark ?? logoLight;

  // During server-side rendering and initial client render, always use logoLight
  // This prevents hydration mismatch
  const logo = mounted && theme === 'dark' ? logoDark : logoLight;

  // Only show theme-dependent UI after hydration to prevent mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fallback if image fails to load
  if (imageError) {
    return (
      <div
        className={cn(
          'size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm',
          className
        )}
        title="WatermarkRemover"
      >
        WR
      </div>
    );
  }

  return (
    <Image
      src={logo}
      alt="WatermarkRemover Logo"
      title="WatermarkRemover"
      width={96}
      height={96}
      className={cn('size-8 rounded-md', className)}
      onError={() => setImageError(true)}
      priority
    />
  );
}
