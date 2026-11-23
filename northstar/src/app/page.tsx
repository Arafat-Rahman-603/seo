import { fetchResolvedContent, fetchSeoData } from '@/lib/api';
import { constructMetadata, serializeJsonLd } from '@/lib/seo';
import HomeContent from '@/components/HomeContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await fetchSeoData('home');
  return constructMetadata(seo, 'home');
}

export default async function HomePage() {
  const [content, seo] = await Promise.all([
    fetchResolvedContent('home'),
    fetchSeoData('home'),
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
      <HomeContent content={content} />
    </>
  );
}
