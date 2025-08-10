import { getMDXComponents } from '@/components/docs/mdx-components';
import Container from '@/components/layout/container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { authorSource, blogSource, categorySource } from '@/lib/blog-source';
import { formatDate } from '@/lib/formatter';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata | undefined> {
  const { locale, slug } = await params;

  // Find the blog post based on locale
  const postSlug = locale === 'zh' ? `${slug}.zh` : slug;
  const post = blogSource.getPage([postSlug]) || blogSource.getPage([slug]);

  if (!post) {
    return undefined;
  }

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: `${post.data.title} | ${t('title')}`,
    description: post.data.description || '',
    image: post.data.image,
    canonicalUrl: getUrlWithLocale(`/blog/${slug}`, locale),
  });
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = blogSource.getPages();

  return posts.map((post) => {
    // Remove the .zh suffix for Chinese posts as the locale is handled separately
    const slug = post.slugs[0].replace('.zh', '');
    return { slug };
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;

  // Get the blog post based on locale
  const postSlug = locale === 'zh' ? `${slug}.zh` : slug;
  const post = blogSource.getPage([postSlug]) || blogSource.getPage([slug]);

  // If not found, return 404
  if (!post) {
    notFound();
  }

  // Get author data
  const authorSlug = post.data.author || 'watermarkremovertools';
  const author =
    authorSource.getPage([authorSlug]) ||
    authorSource.getPage([`${authorSlug}.${locale}`]);

  // Get category data
  const categories = post.data.categories || [];

  // Calculate reading time (rough estimate: 200 words per minute)
  const content = post.data.description || '';
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Get the MDX component from the body
  const MDX = post.data.body;

  return (
    <article className="flex flex-col min-h-screen">
      <Container className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex gap-2 mb-4">
                {categories.map((cat: string) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {post.data.title}
            </h1>

            {/* Description */}
            {post.data.description && (
              <p className="text-xl text-muted-foreground mb-6">
                {post.data.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {/* Author */}
              {author && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={author.data.avatar}
                      alt={author.data.name}
                    />
                    <AvatarFallback>{author.data.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>{author.data.name}</span>
                </div>
              )}

              {/* Date */}
              {post.data.date && (
                <time dateTime={post.data.date}>
                  {formatDate(new Date(post.data.date))}
                </time>
              )}

              {/* Reading Time */}
              <span>{readingTime} min read</span>
            </div>
          </header>

          {/* Featured Image */}
          {post.data.image && (
            <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.data.image}
                alt={post.data.title || ''}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <MDX components={getMDXComponents()} />
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t">
            {/* Author Bio */}
            {author && (
              <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={author.data.avatar}
                    alt={author.data.name}
                  />
                  <AvatarFallback>{author.data.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    About {author.data.name}
                  </h3>
                  {author.data.description && (
                    <p className="text-muted-foreground">
                      {author.data.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </footer>
        </div>
      </Container>
    </article>
  );
}
