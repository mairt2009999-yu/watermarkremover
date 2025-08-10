import { Skeleton } from '@/components/ui/skeleton';
import { LocaleLink } from '@/i18n/navigation';
import { type BlogType, authorSource, categorySource } from '@/lib/source';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';
import { formatDate } from '@/lib/formatter';
import Image from 'next/image';

interface BlogCardProps {
  locale: string;
  post: BlogType;
}

type BlogFrontmatter = {
  date: string;
  title?: string;
  description?: string;
  image?: string;
  author: string;
  categories: string[];
};

export default function BlogCard({ locale, post }: BlogCardProps) {
  if (!post) {
    return null;
  }

  const data = post.data as unknown as BlogFrontmatter;
  const { date, title, description, image, author, categories } = data;
  const publishDate = formatDate(new Date(date));
  const blogAuthor = authorSource.getPage([author], locale);
  const blogCategories = categorySource
    .getPages(locale)
    .filter((category) => (categories ?? []).includes(category.slugs[0] ?? ''));

  return (
    <LocaleLink
      href={`/blog/${post.slugs[0].replace('.zh', '')}`}
      className="block h-full"
    >
      <div className="group flex flex-col border rounded-lg overflow-hidden h-full">
        {/* Image container - fixed aspect ratio */}
        <div className="group overflow-hidden relative aspect-16/9 w-full">
          {image && (
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={title || 'image for blog post'}
                title={title || 'image for blog post'}
                className="object-cover hover:scale-105 transition-transform duration-300"
                placeholder="blur"
                blurDataURL={PLACEHOLDER_IMAGE}
                fill
              />

              {blogCategories && blogCategories.length > 0 && (
                <div className="absolute left-2 bottom-2 opacity-100 transition-opacity duration-300">
                  <div className="flex flex-wrap gap-1">
                    {blogCategories.map((category, index) => {
                      type CategoryFrontmatter = {
                        name: string;
                        description?: string;
                      };
                      const categoryData =
                        category.data as unknown as CategoryFrontmatter;
                      return (
                        <span
                          key={`${category?.slugs[0]}-${index}`}
                          className="text-xs font-medium text-white bg-black bg-opacity-50 px-2 py-1 rounded-md"
                        >
                          {categoryData?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post info container */}
        <div className="flex flex-col justify-between p-4 flex-1">
          <div>
            {/* Post title */}
            <h3 className="text-lg line-clamp-2 font-medium">
              <span
                className="bg-linear-to-r from-green-200 to-green-100
                  bg-[length:0px_10px] bg-left-bottom bg-no-repeat
                  transition-[background-size]
                  duration-500
                  hover:bg-[length:100%_3px]
                  group-hover:bg-[length:100%_10px]
                  dark:from-purple-800 dark:to-purple-900"
              >
                {title}
              </span>
            </h3>

            {/* Post excerpt */}
            <div className="mt-2">
              {description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Author and date */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between space-x-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0">
                {(() => {
                  type AuthorFrontmatter = { name: string; avatar?: string };
                  const authorData = blogAuthor?.data as unknown as
                    | AuthorFrontmatter
                    | undefined;
                  if (!authorData?.avatar) return null;
                  <Image
                    src={authorData.avatar}
                    alt={`avatar for ${authorData.name}`}
                    className="rounded-full object-cover border"
                    fill
                  />;
                })()}
              </div>
              {(() => {
                type AuthorFrontmatter = { name: string };
                const authorData = blogAuthor?.data as unknown as
                  | AuthorFrontmatter
                  | undefined;
                return (
                  <span className="truncate text-sm">{authorData?.name}</span>
                );
              })()}
            </div>

            <time className="truncate text-sm" dateTime={date}>
              {publishDate}
            </time>
          </div>
        </div>
      </div>
    </LocaleLink>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden h-full">
      <div className="overflow-hidden relative aspect-16/9 w-full">
        <Image
          src={PLACEHOLDER_IMAGE}
          alt="Loading placeholder"
          className="object-cover"
          fill
        />
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
