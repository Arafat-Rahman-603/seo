import { fetchResolvedContent, fetchSeoData } from '@/lib/api';
import { constructMetadata } from '@/lib/seo';
import AboutContent from '@/components/AboutContent';

export async function generateMetadata() {
  const seo = await fetchSeoData('about');
  return constructMetadata(seo);
}

export default async function AboutPage() {
  const content = await fetchResolvedContent('about');
  const seo = await fetchSeoData('about');

  return (
    <>
      {seo?.jsonLd && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: seo.jsonLd }} 
        />
      )}
      <AboutContent content={content} />
    </>
  );
}
