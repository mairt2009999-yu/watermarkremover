import { CustomPage } from '@/components/page/custom-page';
import { constructMetadata } from '@/lib/metadata';
import { staticLegalPagesSource } from '@/lib/legal-pages';
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
    const pageSlug = locale === 'zh' ? 'privacy-policy.zh' : 'privacy-policy';
  const page = staticLegalPagesSource.getPage([pageSlug]);

    return constructMetadata({
      title: page?.data.title || 'Privacy Policy' + ' | ' + t('title'),
      description: page?.data.description || 'Your privacy is important to us',
      canonicalUrl: getUrlWithLocale('/privacy', locale),
    });
  } catch (error) {
    console.error('Error in generateMetadata for privacy page:', error);
    return {};
  }
}

export default async function PrivacyPolicyPage(props: NextPageProps) {
  const params = await props.params;
  const locale = Array.isArray(params?.locale)
    ? params.locale[0]
    : params?.locale || 'en';

  const pageSlug = locale === 'zh' ? 'privacy-policy.zh' : 'privacy-policy';
  const page = staticLegalPagesSource.getPage([pageSlug]);

  if (!page) {
    notFound();
  }

  return <CustomPage page={page} />;
}
