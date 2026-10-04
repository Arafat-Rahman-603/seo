"use client";

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { FileText, Search, Activity, RotateCcw } from 'lucide-react';

export default function ProjectLayout({ children }: any) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.id as string;

  const tabs = [
    { name: 'Overview', href: `/projects/${projectId}`, exact: true },
    { name: 'Content', href: `/projects/${projectId}/content` },
    { name: 'SEO', href: `/projects/${projectId}/seo` },
    { name: 'Preview', href: `/projects/${projectId}/preview` },
    { name: 'Versions', href: `/projects/${projectId}/versions` },
    { name: 'Publish', href: `/projects/${projectId}/publish` },
    { name: 'Audit Logs', href: `/projects/${projectId}/audit-logs` },
    { name: 'Search', href: `/projects/${projectId}/search` },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
