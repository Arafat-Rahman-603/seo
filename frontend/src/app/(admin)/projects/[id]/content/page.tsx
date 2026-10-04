"use client";
import { useParams } from 'next/navigation';

import Link from 'next/link';

export default function ContentPage() {
  const params = useParams();

  const pages = [
    { name: 'Home', slug: 'home', description: 'Main landing page' },
    { name: 'Services', slug: 'services', description: 'Overview of services provided' },
    { name: 'About', slug: 'about', description: 'Company information and team' },
    { name: 'Contact', slug: 'contact', description: 'Contact details and form' },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Content Pages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map(page => (
          <Link href={`/projects/${params?.id}/content/${page.slug}`} key={page.slug} className="block group">
            <div className="bg-white border border-gray-200 p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all h-full">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 flex justify-between items-center">
                 {page.name}
                 <span className="text-gray-400 group-hover:text-blue-500">→</span>
              </h3>
              <p className="text-sm text-gray-500 mt-2">{page.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
