"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({
  content,
  activePage,
  onNavigate,
}: {
  content?: any;
  activePage?: string;
  onNavigate?: (page: string) => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const brandText = content?.brandText ?? 'Northstar Digital';
  const homeLabel = content?.homeLabel ?? 'Home';
  const servicesLabel = content?.servicesLabel ?? 'Services';
  const aboutLabel = content?.aboutLabel ?? 'About';
  const contactLabel = content?.contactLabel ?? 'Contact';
  const ctaText = content?.ctaText ?? 'Get Started';
  const ctaHref = content?.ctaHref ?? '/contact';

  const navLinks = [
    { href: '/', page: 'home', label: homeLabel, field: 'homeLabel', path: 'navbar.homeLabel' },
    { href: '/services', page: 'services', label: servicesLabel, field: 'servicesLabel', path: 'navbar.servicesLabel' },
    { href: '/about', page: 'about', label: aboutLabel, field: 'aboutLabel', path: 'navbar.aboutLabel' },
    { href: '/contact', page: 'contact', label: contactLabel, field: 'contactLabel', path: 'navbar.contactLabel' },
  ];

  const isActive = (href: string, page: string) => {
    if (activePage) return activePage === page;
    return pathname === href;
  };

  const handleLinkClick = (e: React.MouseEvent, page: string) => {
    setMobileOpen(false);
    if (onNavigate) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <nav
      className="bg-white border-b border-gray-100 sticky top-0 z-40"
      data-editor-page="layout"
      data-editor-section="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link
              href="/"
              onClick={(e) => handleLinkClick(e, 'home')}
              className="font-bold text-xl text-gray-900 tracking-tight"
              data-editor-page="layout"
              data-editor-field="brandText"
              data-editor-path="navbar.brandText"
              data-editor-type="text"
            >
              {brandText}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.page)}
                data-editor-page="layout"
                data-editor-field={item.field}
                data-editor-path={item.path}
                data-editor-type="text"
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href, item.page)
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              onClick={(e) => handleLinkClick(e, 'contact')}
              data-editor-page="layout"
              data-editor-field="ctaText"
              data-editor-path="navbar.ctaText"
              data-editor-type="text"
              className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {ctaText}
            </Link>
            <div
              className="hidden"
              data-editor-page="layout"
              data-editor-field="ctaHref"
              data-editor-path="navbar.ctaHref"
              data-editor-type="url"
            >
              {ctaHref}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 space-y-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.page)}
                className={`block px-2 py-2 text-sm font-medium ${
                  isActive(item.href, item.page) ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              onClick={(e) => handleLinkClick(e, 'contact')}
              className="block bg-black text-white px-4 py-2 text-sm font-medium text-center hover:bg-gray-800"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
