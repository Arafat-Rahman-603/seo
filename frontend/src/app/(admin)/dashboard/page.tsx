"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.data)).catch(console.error);
  }, []);

  const activeWebsites = projects.filter(p => p.status === 'ACTIVE').length;
  const archivedWebsites = projects.filter(p => p.status === 'ARCHIVED').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {user?.role === 'ADMIN' && (
          <Link href="/projects/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium text-sm transition-colors shadow-sm">
            + Add Website
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
           <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Active Websites</h3>
           <p className="text-3xl font-bold">{activeWebsites}</p>
        </div>
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
           <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Archived Websites</h3>
           <p className="text-3xl font-bold">{archivedWebsites}</p>
        </div>
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
           <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Draft Changes</h3>
           <p className="text-3xl font-bold text-gray-400">--</p>
        </div>
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
           <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">SEO Issues</h3>
           <p className="text-3xl font-bold text-gray-400">--</p>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center justify-center py-12">
         <h2 className="text-xl font-bold mb-2 text-gray-800">Plan 2 Central Admin</h2>
         <p className="text-gray-600 text-sm mb-6 max-w-md">
           Manage multiple websites and central SEO overrides without application deployments.
         </p>
         <Link href="/projects" className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-2 font-medium text-sm transition-colors shadow-sm">
            Manage Websites
         </Link>
      </div>
    </div>
  );
}
