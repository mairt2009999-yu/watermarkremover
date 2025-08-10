// Simple static data for legal pages to avoid fumadocs processing issues

interface LegalPageData {
  title: string;
  description: string;
  date: string;
  body: React.ComponentType;
}

interface LegalPage {
  slugs: string[];
  data: LegalPageData;
  url: string;
}

// Static legal page data - will be replaced with dynamic loading if fumadocs issues are resolved
export const legalPagesData = {
  'terms-of-service': {
    title: 'Terms of Service',
    description: 'Terms and conditions for using our watermark removal service.',
    date: '2024-01-01',
  },
  'terms-of-service.zh': {
    title: '服务条款',
    description: '使用我们去水印服务的条款和条件。',
    date: '2024-01-01',
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    description: 'How we protect and handle your personal information.',
    date: '2024-01-01',
  },
  'privacy-policy.zh': {
    title: '隐私政策',
    description: '我们如何保护和处理您的个人信息。',
    date: '2024-01-01',
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    description: 'Information about how we use cookies.',
    date: '2024-01-01',
  },
  'cookie-policy.zh': {
    title: 'Cookie政策',
    description: '关于我们如何使用Cookie的信息。',
    date: '2024-01-01',
  },
};

export const staticLegalPagesSource = {
  getPage(slugs: string[]): LegalPage | null {
    const slug = slugs[0];
    const data = legalPagesData[slug as keyof typeof legalPagesData];
    
    if (!data) {
      return null;
    }

    return {
      slugs: [slug],
      data: {
        title: data.title,
        description: data.description || '',
        date: data.date || '2024-01-01',
        body: () => null, // Placeholder - would be replaced with actual MDX content
      },
      url: `/pages/${slug.replace('.zh', '')}`,
    };
  },

  getPages(): LegalPage[] {
    return Object.entries(legalPagesData).map(([slug, data]) => ({
      slugs: [slug],
      data: {
        title: data.title,
        description: data.description || '',
        date: data.date || '2024-01-01',
        body: () => null,
      },
      url: `/pages/${slug.replace('.zh', '')}`,
    }));
  },
};