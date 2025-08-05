import CTASection from '@/components/blocks/cta/cta';
import FaqSection from '@/components/blocks/faqs/faqs';
import HeroSection from '@/components/blocks/hero/hero';
import HowItWorksSection from '@/components/blocks/how-it-works/how-it-works';
import PricingSection from '@/components/blocks/pricing/pricing-server';
import TestimonialsSection from '@/components/blocks/testimonials/testimonials';
import TrustSection from '@/components/blocks/trust/trust';
import { NewsletterCard } from '@/components/newsletter/newsletter-card';
import DiscordWidget from '@/components/shared/discord-widget';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    canonicalUrl: getUrlWithLocale('', locale),
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations('HomePage');

  return (
    <>
      <div className="flex flex-col space-y-0">
        <HeroSection />

        <HowItWorksSection />

        <PricingSection />

        <TestimonialsSection />

        <TrustSection />

        <FaqSection />

        <CTASection />

        <NewsletterCard />
      </div>
    </>
  );
}
