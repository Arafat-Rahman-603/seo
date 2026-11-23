import Link from 'next/link';

export default function Footer({
  content,
  onNavigate,
}: {
  content?: any;
  onNavigate?: (page: string) => void;
}) {
  const brandText = content?.brandText ?? 'Northstar Digital';
  const copyrightText =
    content?.copyrightText ?? `© ${new Date().getFullYear()} Northstar Digital. All rights reserved.`;
  const homeLabel = content?.homeLabel ?? 'Home';
  const servicesLabel = content?.servicesLabel ?? 'Services';
  const aboutLabel = content?.aboutLabel ?? 'About';
  const contactLabel = content?.contactLabel ?? 'Contact';
  const previewLabel = content?.previewLabel ?? 'Preview Editor';

  const handleLinkClick = (e: React.MouseEvent, page?: string) => {
    if (onNavigate && page) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <footer
      className="bg-gray-50 border-t border-gray-200 py-12"
      data-editor-page="layout"
      data-editor-section="footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <Link
            href="/"
            onClick={(e) => handleLinkClick(e, 'home')}
            className="font-bold text-xl text-gray-900"
            data-editor-page="layout"
            data-editor-field="brandText"
            data-editor-path="footer.brandText"
            data-editor-type="text"
          >
            {brandText}
          </Link>
          <p
            className="text-gray-500 text-sm mt-1"
            data-editor-page="layout"
            data-editor-field="copyrightText"
            data-editor-path="footer.copyrightText"
            data-editor-type="text"
          >
            {copyrightText}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <Link
            href="/"
            onClick={(e) => handleLinkClick(e, 'home')}
            className="hover:text-gray-900 transition-colors"
            data-editor-page="layout"
            data-editor-field="homeLabel"
            data-editor-path="footer.homeLabel"
            data-editor-type="text"
          >
            {homeLabel}
          </Link>
          <Link
            href="/services"
            onClick={(e) => handleLinkClick(e, 'services')}
            className="hover:text-gray-900 transition-colors"
            data-editor-page="layout"
            data-editor-field="servicesLabel"
            data-editor-path="footer.servicesLabel"
            data-editor-type="text"
          >
            {servicesLabel}
          </Link>
          <Link
            href="/about"
            onClick={(e) => handleLinkClick(e, 'about')}
            className="hover:text-gray-900 transition-colors"
            data-editor-page="layout"
            data-editor-field="aboutLabel"
            data-editor-path="footer.aboutLabel"
            data-editor-type="text"
          >
            {aboutLabel}
          </Link>
          <Link
            href="/contact"
            onClick={(e) => handleLinkClick(e, 'contact')}
            className="hover:text-gray-900 transition-colors"
            data-editor-page="layout"
            data-editor-field="contactLabel"
            data-editor-path="footer.contactLabel"
            data-editor-type="text"
          >
            {contactLabel}
          </Link>
          <Link
            href="/preview"
            className="hover:text-gray-900 transition-colors"
            data-editor-page="layout"
            data-editor-field="previewLabel"
            data-editor-path="footer.previewLabel"
            data-editor-type="text"
          >
            {previewLabel}
          </Link>
        </div>
      </div>
    </footer>
  );
}
