import Link from 'next/link';

export default function HomeContent({ content }: { content: any }) {
  if (!content) return null;

  return (
    <main data-editor-page="home">
      {/* Hero Section */}
      <section className="bg-white py-24 sm:py-32" data-editor-section="hero">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            data-editor-field="title"
            data-editor-path="hero.title"
          >
            {content.hero.title}
          </h1>
          <p 
            className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
            data-editor-field="description"
            data-editor-path="hero.description"
          >
            {content.hero.description}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link 
              href={content.hero.buttonHref || "/contact"} 
              className="bg-black text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              data-editor-field="buttonText"
              data-editor-path="hero.buttonText"
            >
              {content.hero.buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="bg-gray-50 py-16" data-editor-section="trusted">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 
            className="text-lg font-semibold leading-8 text-gray-900 mb-8"
            data-editor-field="title"
            data-editor-path="trusted.title"
          >
            {content.trusted.title}
          </h2>
          <div className="flex justify-center gap-8 text-gray-500 font-bold text-xl uppercase tracking-wider">
            {content.trusted.companies?.map((company: string, i: number) => (
              <span key={i}>{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="bg-white py-24" data-editor-section="servicesPreview">
         <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
           <h2 
             className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
             data-editor-field="title"
             data-editor-path="servicesPreview.title"
           >
             {content.servicesPreview.title}
           </h2>
           <p 
             className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
             data-editor-field="description"
             data-editor-path="servicesPreview.description"
           >
             {content.servicesPreview.description}
           </p>
         </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-24" data-editor-section="cta">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8"
            data-editor-field="title"
            data-editor-path="cta.title"
          >
            {content.cta.title}
          </h2>
          <Link 
            href="/contact" 
            className="bg-white text-black px-6 py-3 text-sm font-semibold shadow-sm hover:bg-gray-200"
            data-editor-field="buttonText"
            data-editor-path="cta.buttonText"
          >
            {content.cta.buttonText}
          </Link>
        </div>
      </section>
    </main>
  );
}
