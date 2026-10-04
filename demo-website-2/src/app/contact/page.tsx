import { fetchResolvedContent, fetchSeoData } from '@/lib/api';
import { constructMetadata } from '@/lib/seo';
import ContactContent from '@/components/ContactContent';

export async function generateMetadata() {
  const seo = await fetchSeoData('contact');
  return constructMetadata(seo);
}

export default async function ContactPage() {
  const content = await fetchResolvedContent('contact');
  const seo = await fetchSeoData('contact');

  return (
    <>
      {seo?.jsonLd && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: seo.jsonLd }} 
        />
      )}
      <ContactContent content={content} />
    </>
  );
}
