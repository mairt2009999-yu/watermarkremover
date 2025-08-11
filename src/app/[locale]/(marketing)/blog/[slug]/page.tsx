import { getMDXComponents } from '@/components/docs/mdx-components';
import Container from '@/components/layout/container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getBlogPost } from '@/lib/blog-data';
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

  // Find the blog post using blog-data system
  const post = getBlogPost(slug);

  if (!post) {
    return undefined;
  }

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: `${post.title} | ${t('title')}`,
    description: post.description || '',
    image: post.image,
    canonicalUrl: getUrlWithLocale(`/blog/${slug}`, locale),
  });
}

// Disable static generation for blog posts to avoid fumadocs flatMap error
// This will use dynamic rendering instead
export const dynamic = 'force-dynamic';

// Temporarily disable static params generation due to fumadocs issue
// export async function generateStaticParams() {
//   try {
//     const posts = blogSource.getPages ? blogSource.getPages() : [];
//     const validPosts = Array.isArray(posts) ? posts : [];
//     
//     return validPosts
//       .filter((post) => post && post.slugs && post.slugs[0])
//       .map((post) => ({
//         slug: post.slugs[0],
//       }));
//   } catch (error) {
//     console.error('Error in generateStaticParams:', error);
//     return [];
//   }
// }

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;

  // Get the blog post using blog-data system
  const post = getBlogPost(slug);

  // If not found, return 404
  if (!post) {
    notFound();
  }

  // Static author data to avoid fumadocs dependencies
  const authorData: Record<string, any> = {
    watermarkremovertools: {
      name: 'WatermarkRemoverTools',
      avatar: '/images/avatars/watermarkremovertools.png',
      description: 'Expert team specializing in AI-powered watermark removal and image processing technologies.'
    },
    fox: {
      name: 'Fox',
      avatar: '/images/avatars/fox.png',
      description: 'Tech enthusiast and developer focused on AI image processing.'
    },
    mkdirs: {
      name: 'Mkdirs',
      avatar: '/images/avatars/mkdirs.png',
      description: 'Software engineer specializing in automation and digital tools.'
    }
  };

  // Get author data
  const authorSlug = post.author || 'watermarkremovertools';
  const author = authorData[authorSlug] ? {
    data: authorData[authorSlug]
  } : null;

  // Get category data
  const categories = post.categories || [];

  // Calculate reading time (rough estimate: 200 words per minute)
  const content = post.description || '';
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Get the MDX component from the body
  const MDX = post.body;

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
              {post.title}
            </h1>

            {/* Description */}
            {post.description && (
              <p className="text-xl text-muted-foreground mb-6">
                {post.description}
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
              {post.date && (
                <time dateTime={post.date}>
                  {formatDate(new Date(post.date))}
                </time>
              )}

              {/* Reading Time */}
              <span>{readingTime} min read</span>
            </div>
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.image}
                alt={post.title || ''}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {MDX ? (
              <MDX components={getMDXComponents()} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Content is loading...</p>
              </div>
            )}
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
