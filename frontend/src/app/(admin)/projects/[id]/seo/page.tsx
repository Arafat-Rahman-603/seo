"use client";
import { useParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SeoDashboard() {
  const params = useParams();

  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const pages = [
    { name: 'Home', slug: 'home' },
    { name: 'Services', slug: 'services' },
    { name: 'About', slug: 'about' },
    { name: 'Contact', slug: 'contact' },
  ];

  useEffect(() => {
    api.get(`/projects/${params?.id}/seo/diagnostics`).then(res => {
      setDiagnostics(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div>Loading SEO diagnostics...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">SEO Dashboard</h2>
      
      {diagnostics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <h3 className="text-gray-500 text-sm font-medium mb-1">Total Errors</h3>
               <p className="text-3xl font-bold text-red-600">{diagnostics.totalErrors}</p>
            </div>
            <AlertCircle size={32} className="text-red-100" />
          </div>
          <div className="bg-white p-5 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <h3 className="text-gray-500 text-sm font-medium mb-1">Total Warnings</h3>
               <p className="text-3xl font-bold text-amber-600">{diagnostics.totalWarnings}</p>
            </div>
            <AlertCircle size={32} className="text-amber-100" />
          </div>
           <div className="bg-white p-5 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <h3 className="text-gray-500 text-sm font-medium mb-1">Pages Tracked</h3>
               <p className="text-3xl font-bold text-gray-900">{pages.length}</p>
            </div>
            <CheckCircle2 size={32} className="text-green-100" />
          </div>
        </div>
      )}

      <h3 className="text-lg font-bold mb-4">Page SEO Status</h3>
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-4">Page</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Issues</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((page) => {
              const pageDiags = diagnostics?.pageDiagnostics?.[page.slug] || [];
              const errors = pageDiags.filter((d: any) => d.severity === 'ERROR').length;
              const warnings = pageDiags.filter((d: any) => d.severity === 'WARNING').length;
              const hasIssues = errors > 0 || warnings > 0;
              
              return (
                <tr key={page.slug} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{page.name}</td>
                  <td className="px-6 py-4">
                    {hasIssues ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Needs Attention
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-red-600 font-medium mr-3">{errors} E</span>
                     <span className="text-amber-600 font-medium">{warnings} W</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/projects/${params?.id}/seo/${page.slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      Edit SEO
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
