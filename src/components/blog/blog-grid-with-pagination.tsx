import EmptyGrid from '../shared/empty-grid';
import CustomPagination from '../shared/pagination';
import BlogGrid from './blog-grid';

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

interface BlogGridWithPaginationProps {
  locale: string;
  posts: BlogPostType[];
  totalPages: number;
  routePrefix: string;
}

export default function BlogGridWithPagination({
  locale,
  posts,
  totalPages,
  routePrefix,
}: BlogGridWithPaginationProps) {
  return (
    <div>
      {posts.length === 0 && <EmptyGrid />}
      {posts.length > 0 && (
        <div>
          <BlogGrid locale={locale} posts={posts} />
          <div className="mt-8 flex items-center justify-center">
            <CustomPagination
              routePrefix={routePrefix}
              totalPages={totalPages}
            />
          </div>
        </div>
      )}
    </div>
  );
}
