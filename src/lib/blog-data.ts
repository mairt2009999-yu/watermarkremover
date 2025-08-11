// Blog data module for static blog posts
// Simplified to ensure compatibility with Vercel build process

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date?: string;
  published: boolean;
  author: string;
  categories: string[];
  image?: string;
  body?: any;
  url: string;
}

// Static blog posts data matching actual content
const blogPosts: BlogPost[] = [
  {
    slug: 'batch-watermark-removal-ultimate-guide-2025',
    title: 'Download Instagram Videos Without Watermark - Complete Guide 2025',
    description: 'Download Instagram Reels, Stories, and Posts without watermarks. 5 working methods with step-by-step instructions. Works on iPhone, Android, and PC.',
    date: '2025-01-17',
    published: true,
    author: 'watermarkremovertools',
    categories: ['tutorial', 'social-media', 'instagram'],
    image: '/images/blog/post-4.png',
    body: null,
    url: '/blog/batch-watermark-removal-ultimate-guide-2025',
  },
  {
    slug: 'complete-guide-ai-watermark-removal-2025',
    title: 'Complete Guide to AI Watermark Removal in 2025',
    description: 'Comprehensive guide to removing watermarks using AI technology. Learn the best tools, techniques, and best practices for professional results.',
    date: '2025-01-15',
    published: true,
    author: 'watermarkremovertools',
    categories: ['tutorial', 'ai-technology', 'guide'],
    image: '/images/blog/ai-watermark-removal-guide.png',
    body: null,
    url: '/blog/complete-guide-ai-watermark-removal-2025',
  },
  {
    slug: 'free-vs-paid-watermark-removers-2025',
    title: 'Free vs Paid Watermark Removers: Which Should You Choose in 2025?',
    description: 'Compare free and paid watermark removal tools. We analyze features, quality, speed, and value to help you make the best choice for your needs.',
    date: '2025-01-10',
    published: true,
    author: 'watermarkremovertools',
    categories: ['comparison', 'tools', 'guide'],
    image: '/images/blog/watermark-remover-comparison.png',
    body: null,
    url: '/blog/free-vs-paid-watermark-removers-2025',
  },
  {
    slug: 'remove-shutterstock-watermarks-tutorial-2025',
    title: 'How to Remove Shutterstock Watermarks: Complete Tutorial 2025',
    description: 'Step-by-step tutorial on removing Shutterstock watermarks legally and effectively. Learn the proper methods and best practices.',
    date: '2025-01-05',
    published: true,
    author: 'watermarkremovertools',
    categories: ['tutorial', 'shutterstock', 'legal'],
    image: '/images/blog/shutterstock-watermark-removal.png',
    body: null,
    url: '/blog/remove-shutterstock-watermarks-tutorial-2025',
  },
];

export function getBlogPost(slug: string): BlogPost | null {
  return blogPosts.find(post => post.slug === slug) || null;
}

export function getBlogPostsByLocale(locale?: string): BlogPost[] {
  return blogPosts;
}

export function getBlogPosts(): BlogPost[] {
  return blogPosts;
}

export type { BlogPost };