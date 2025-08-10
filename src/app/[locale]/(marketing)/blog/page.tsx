import BlogGridWithPagination from '@/components/blog/blog-grid-with-pagination';
import Container from '@/components/layout/container';
import { blogSource } from '@/lib/source';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

const POSTS_PER_PAGE = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: `Blog | ${t('title')}`,
    description:
      'Read our latest blog posts about watermark removal, AI technology, and image processing.',
    canonicalUrl: getUrlWithLocale('/blog', locale),
  });
}

interface BlogPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentPage = Number.parseInt(page || '1', 10);

  // Get all blog posts and filter by locale
  const allPosts = blogSource
    .getPages()
    .filter((post) => {
      // Filter by locale - check if the slug ends with the locale code
      const isCorrectLocale =
        locale === 'zh'
          ? post.slugs[0].endsWith('.zh')
          : !post.slugs[0].endsWith('.zh');

      // Filter by published status
      const isPublished = (post.data as any).published !== false;

      return isCorrectLocale && isPublished;
    })
    .sort((a, b) => {
      // Sort by date, newest first
      const dateA = new Date((a.data as any).date || 0).getTime();
      const dateB = new Date((b.data as any).date || 0).getTime();
      return dateB - dateA;
    });

  // Calculate pagination
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = allPosts.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen">
      <Container className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Blog Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the latest insights about AI watermark removal, image
              processing techniques, and industry updates.
            </p>
          </div>

          {/* Blog Grid with Pagination */}
          <BlogGridWithPagination
            locale={locale}
            posts={currentPosts}
            totalPages={totalPages}
            routePrefix="/blog"
          />
        </div>
      </Container>
    </div>
  );
}
