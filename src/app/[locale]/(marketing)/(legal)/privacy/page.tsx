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
      title: 'Privacy Policy | ' + t('title'),
      description: 'Privacy Policy',
      canonicalUrl: getUrlWithLocale('/privacy', locale),
    });
  } catch (error) {
    console.error('Error in generateMetadata for privacy page:', error);
    return {};
  }
}

export default async function PrivacyPolicyPage(props: NextPageProps) {
  const params = await props.params;
  const locale = params?.locale || 'en';

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div className="space-y-4">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Your privacy is important to us.
        </p>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>Privacy Policy content will be loaded here.</p>
      </div>
    </div>
  );
}
