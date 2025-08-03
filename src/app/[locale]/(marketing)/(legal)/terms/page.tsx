import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { NextPageProps } from '@/types/next-page-props';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  try {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return constructMetadata({
      title: 'Terms of Service | ' + t('title'),
      description: 'Terms of Service',
      canonicalUrl: getUrlWithLocale('/terms', locale),
    });
  } catch (error) {
    console.error('Error in generateMetadata for terms page:', error);
    return {};
  }
}

export default async function TermsOfServicePage(props: NextPageProps) {
  const params = await props.params;
  const locale = params?.locale || 'en';

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div className="space-y-4">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Please review our terms of service carefully.
        </p>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>Terms of Service content will be loaded here.</p>
      </div>
    </div>
  );
}
