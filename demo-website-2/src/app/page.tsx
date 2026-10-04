import { fetchResolvedContent, fetchSeoData } from '@/lib/api';
import { constructMetadata } from '@/lib/seo';
import HomeContent from '@/components/HomeContent';

export async function generateMetadata() {
  const seo = await fetchSeoData('home');
  return constructMetadata(seo);
}

export default async function HomePage() {
  const content = await fetchResolvedContent('home');
  const seo = await fetchSeoData('home');

  return (
    <>
      {seo?.jsonLd && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: seo.jsonLd }} 
        />
      )}
      <HomeContent content={content} />
    </>
  );
}
