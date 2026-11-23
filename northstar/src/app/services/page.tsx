import { fetchResolvedContent, fetchSeoData } from '@/lib/api';
import { constructMetadata, serializeJsonLd } from '@/lib/seo';
import ServicesContent from '@/components/ServicesContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await fetchSeoData('services');
  return constructMetadata(seo, 'services');
}

export default async function ServicesPage() {
  const [content, seo] = await Promise.all([
    fetchResolvedContent('services'),
    fetchSeoData('services'),
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
      <ServicesContent content={content} />
    </>
  );
}
