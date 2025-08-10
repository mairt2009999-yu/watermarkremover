import { formatDate } from '@/lib/formatter';
import type { PagesType } from '@/lib/source';
import { CalendarIcon } from 'lucide-react';
import { getMDXComponents } from '../docs/mdx-components';
import { Card, CardContent } from '../ui/card';

interface CustomPageProps {
  page: PagesType;
}

export function CustomPage({ page }: CustomPageProps) {
  if (!page?.data) {
    return null;
  }
  
  // Handle both fumadocs loader data and custom data structures
  const pageData = page.data as any;
  const title = pageData.title;
  const description = pageData.description;
  const date = pageData.date;
  const body = pageData.body;
  
  const formattedDate = date ? formatDate(new Date(date)) : 'No date';
  const MDX = body;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          {description}
        </p>
        {date && (
          <div className="flex items-center justify-center gap-2">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <Card className="mb-8">
        <CardContent>
          <div className="max-w-none prose prose-neutral dark:prose-invert prose-img:rounded-lg">
            {MDX ? (
              <MDX components={getMDXComponents()} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Content is loading...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
