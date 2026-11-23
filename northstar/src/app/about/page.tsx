import { fetchResolvedContent, fetchSeoData } from '@/lib/api';
import { constructMetadata, serializeJsonLd } from '@/lib/seo';
import AboutContent from '@/components/AboutContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await fetchSeoData('about');
  return constructMetadata(seo, 'about');
}

export default async function AboutPage() {
  const [content, seo] = await Promise.all([
    fetchResolvedContent('about'),
    fetchSeoData('about'),
  ]);
  const jsonLd = serializeJsonLd(seo?.jsonLd);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      <AboutContent content={content} />
    </>
  );
}
