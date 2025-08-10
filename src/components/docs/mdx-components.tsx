import { ImageWrapper } from '@/components/docs/image-wrapper';
import type { MDXComponents } from 'mdx/types';

/**
 * Simplified MDX components for basic content rendering
 * Used for legal policy pages and simple content
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  // Minimal components for basic MDX rendering
  const baseComponents: MDXComponents = {
    img: ImageWrapper,
    h1: (props: any) => <h1 className="text-2xl font-bold mb-4" {...props} />,
    h2: (props: any) => (
      <h2 className="text-xl font-semibold mb-3 mt-6" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="text-lg font-medium mb-2 mt-4" {...props} />
    ),
    p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: (props: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
    ),
    ol: (props: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
    ),
    li: (props: any) => <li className="ml-4" {...props} />,
    strong: (props: any) => <strong className="font-semibold" {...props} />,
    em: (props: any) => <em className="italic" {...props} />,
    a: (props: any) => (
      <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
    ),
  };

  return {
    ...baseComponents,
    ...components,
  };
}
