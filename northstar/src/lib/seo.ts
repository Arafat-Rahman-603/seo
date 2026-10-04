import { Metadata } from 'next';

export function constructMetadata(seoData: any): Metadata {
  if (!seoData) return {};

  return {
    title: seoData.title,
    description: seoData.description,
    alternates: {
      canonical: seoData.canonical,
    },
    robots: {
      index: seoData.robots?.includes('noindex') ? false : true,
      follow: seoData.robots?.includes('nofollow') ? false : true,
    },
    openGraph: {
      title: seoData.ogTitle || seoData.title,
      description: seoData.ogDescription || seoData.description,
      images: seoData.ogImage ? [{ url: seoData.ogImage }] : [],
    },
    twitter: {
      card: seoData.twitterCard || 'summary_large_image',
      title: seoData.twitterTitle || seoData.title,
      description: seoData.twitterDescription || seoData.description,
      images: seoData.twitterImage ? [seoData.twitterImage] : [],
    }
  };
}
