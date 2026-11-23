import { fetchResolvedContent, fetchSeoData } from '@/lib/api';
import { constructMetadata, serializeJsonLd } from '@/lib/seo';
import ContactContent from '@/components/ContactContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await fetchSeoData('contact');
  return constructMetadata(seo, 'contact');
}

export default async function ContactPage() {
  const [content, seo] = await Promise.all([
    fetchResolvedContent('contact'),
    fetchSeoData('contact'),
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
      <ContactContent content={content} />
    </>
  );
}
