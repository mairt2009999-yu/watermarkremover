import type { ReactNode } from 'react';
import '@/styles/mdx.css';

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return <>{children}</>;
}
