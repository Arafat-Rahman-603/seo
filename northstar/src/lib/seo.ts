import { Metadata } from 'next';

const DEFAULT_SEO_BY_PAGE: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Northstar Digital | Digital Solutions for Modern Businesses',
    description: 'Comprehensive digital solutions, web development, SEO, and marketing to grow your business.',
  },
  services: {
    title: 'Services | Northstar Digital',
    description: 'Explore our full suite of digital services including web development, SEO, and digital marketing.',
  },
  about: {
    title: 'About Us | Northstar Digital',
    description: 'Meet the passionate team of digital experts behind Northstar Digital.',
  },
  contact: {
    title: 'Contact Us | Northstar Digital',
    description: 'Get in touch with Northstar Digital to start your next big project.',
  },
};

export function constructMetadata(seoData: any, page?: string): Metadata {
  const fallback = page ? DEFAULT_SEO_BY_PAGE[page] : undefined;

  if (!seoData) {
    return fallback
      ? {
          title: fallback.title,
          description: fallback.description,
        }
      : {};
  }

  const title = seoData.title || fallback?.title;
  const description = seoData.description || fallback?.description;

  const metadata: Metadata = {
    title,
    description,
    robots: {
      index: seoData.robots?.includes('noindex') ? false : true,
      follow: seoData.robots?.includes('nofollow') ? false : true,
    },
    openGraph: {
      title: seoData.ogTitle || title,
      description: seoData.ogDescription || description,
      images: seoData.ogImage ? [{ url: seoData.ogImage }] : [],
    },
    twitter: {
      card: seoData.twitterCard || 'summary_large_image',
      title: seoData.twitterTitle || title,
      description: seoData.twitterDescription || description,
      images: seoData.twitterImage ? [seoData.twitterImage] : [],
    },
  };

  if (seoData.canonical) {
    metadata.alternates = { canonical: seoData.canonical };
  }

  return metadata;
}

export function serializeJsonLd(jsonLd: unknown): string | null {
  if (!jsonLd) return null;
  if (typeof jsonLd === 'string') return jsonLd;
  try {
    return JSON.stringify(jsonLd);
  } catch {
    return null;
  }
}
