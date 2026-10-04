import Link from 'next/link';

export default function ServicesContent({ content }: { content: any }) {
  if (!content) return null;

  return (
    <main data-editor-page="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-editor-section="header">
          <h1 
            className="text-4xl font-bold text-gray-900 sm:text-5xl"
            data-editor-field="title"
            data-editor-path="header.title"
          >
            {content.header.title}
          </h1>
          <p 
            className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
            data-editor-field="description"
            data-editor-path="header.description"
          >
            {content.header.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-editor-section="services">
          {content.services?.map((service: any, index: number) => (
            <div key={service.id || index} className="p-8 border border-gray-200 bg-gray-50 text-center">
              <h3 
                className="text-xl font-bold text-gray-900 mb-4"
                data-editor-field="title"
                data-editor-path={`services.${index}.title`}
              >
                {service.title}
              </h3>
              <p 
                className="text-gray-600"
                data-editor-field="description"
                data-editor-path={`services.${index}.description`}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center bg-gray-50 p-12 border border-gray-200" data-editor-section="cta">
          <h2 
            className="text-2xl font-bold text-gray-900 mb-6"
            data-editor-field="title"
            data-editor-path="cta.title"
          >
            {content.cta.title}
          </h2>
          <Link 
            href="/contact" 
            className="bg-black text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800"
            data-editor-field="buttonText"
            data-editor-path="cta.buttonText"
          >
            {content.cta.buttonText}
          </Link>
        </div>
      </div>
    </main>
  );
}
