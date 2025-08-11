import BlogCard, { BlogCardSkeleton } from '@/components/blog/blog-card';
import { websiteConfig } from '@/config/website';

// Compatible type for blog posts to match the structure from blog page
interface BlogPostType {
  slugs: string[];
  data: {
    title?: string;
    description?: string;
    date?: string;
    author?: string;
    categories?: string[];
    image?: string;
    published?: boolean;
    body?: any;
  };
  url: string;
}

interface BlogGridProps {
  locale: string;
  posts: BlogPostType[];
}

export default function BlogGrid({ locale, posts }: BlogGridProps) {
  // console.log('BlogGrid, posts', posts);
  return (
    <div>
      {posts?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) =>
            post ? (
              <BlogCard
                key={post.slugs.join('/')}
                locale={locale}
                post={post}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export function BlogGridSkeleton({
  count = websiteConfig.blog.paginationSize,
}: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(count)].map((_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  );
}
