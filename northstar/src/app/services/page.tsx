import { fetchResolvedContent, fetchSeoData } from '@/lib/api';
import { constructMetadata } from '@/lib/seo';
import ServicesContent from '@/components/ServicesContent';

export async function generateMetadata() {
  const seo = await fetchSeoData('services');
  return constructMetadata(seo);
}

export default async function ServicesPage() {
  const content = await fetchResolvedContent('services');
  const seo = await fetchSeoData('services');

  return (
    <>
      {seo?.jsonLd && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: seo.jsonLd }} 
        />
      )}
      <ServicesContent content={content} />
    </>
  );
}
