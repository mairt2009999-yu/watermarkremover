import { CustomPage } from '@/components/page/custom-page';
import { constructMetadata } from '@/lib/metadata';
import { pagesSource } from '@/lib/pages-source';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { NextPageProps } from '@/types/next-page-props';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  try {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    const page = pagesSource.getPage(['terms-of-service'], locale);

    return constructMetadata({
      title: page?.data.title || 'Terms of Service' + ' | ' + t('title'),
      description:
        page?.data.description || 'Terms and conditions for our service',
      canonicalUrl: getUrlWithLocale('/terms', locale),
    });
  } catch (error) {
    console.error('Error in generateMetadata for terms page:', error);
    return {};
  }
}

export default async function TermsOfServicePage(props: NextPageProps) {
  const params = await props.params;
  const locale = Array.isArray(params?.locale)
    ? params.locale[0]
    : params?.locale || 'en';

  const page = pagesSource.getPage(['terms-of-service'], locale);

  if (!page) {
    notFound();
  }

  return <CustomPage page={page} />;
}
