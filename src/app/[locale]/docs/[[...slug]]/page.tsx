import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// Remove static generation for now to fix the DYNAMIC_SERVER_USAGE error
// This makes the page dynamically rendered
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: DocPageProps) {
  const { slug = [], locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: `Documentation | ${t('title')}`,
    description: 'Documentation page',
    canonicalUrl: getUrlWithLocale(`/docs/${slug.join('/')}`, locale),
  });
}

interface DocPageProps {
  params: Promise<{
    slug?: string[];
    locale: Locale;
  }>;
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug = [], locale } = await params;

  // Temporary simple implementation
  return (
    <DocsPage>
      <DocsTitle>Documentation</DocsTitle>
      <DocsDescription>
        Welcome to the documentation. This page is under construction.
      </DocsDescription>
      <DocsBody>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p>
            The documentation system is currently being set up. Please check
            back later.
          </p>
          <p>Current path: /docs/{slug.join('/')}</p>
          <p>Locale: {locale}</p>
        </div>
      </DocsBody>
    </DocsPage>
  );
}
