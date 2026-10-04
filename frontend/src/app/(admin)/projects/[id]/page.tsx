"use client";
import { useParams, useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function ProjectOverview() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    api.get(`/projects/${params?.id}`).then(res => {
      setProject(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params?.id]);

  const handleArchive = async () => {
    if (!window.confirm(`Are you sure you want to remove ${project.name} from the active registry?`)) {
      return;
    }
    
    setArchiving(true);
    try {
      await api.patch(`/projects/${params?.id}/status`);
      router.push('/projects');
    } catch (err) {
      console.error(err);
      alert('Failed to archive website.');
      setArchiving(false);
    }
  };

  if (loading) return <div>Loading project...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
          <p className="text-gray-600 max-w-3xl">{project.description}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <Link 
              href={`/projects/${project._id}/edit`} 
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
            >
              Edit Website
            </Link>
            {project.status !== 'ARCHIVED' && (
              <button 
                onClick={handleArchive}
                disabled={archiving}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
              >
                {archiving ? 'Removing...' : 'Remove Website'}
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white border border-gray-200 shadow-sm p-6">
         <h2 className="text-lg font-bold mb-4 pb-2 border-b border-gray-100">Website Information</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
            <div>
               <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Name</h3>
               <p className="text-gray-900 font-medium">{project.name}</p>
            </div>
            <div>
               <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Slug</h3>
               <p className="text-gray-900 font-mono text-sm">{project.slug}</p>
            </div>
            <div>
               <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Project Key</h3>
               <p className="text-gray-900 font-mono text-sm bg-gray-50 px-1 border border-gray-200 inline-block">{project.projectKey}</p>
            </div>
            <div>
               <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Website URL</h3>
               {project.websiteUrl ? (
                 <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate block">
                   {project.websiteUrl}
                 </a>
               ) : (
                 <span className="text-gray-400 text-sm">Not set</span>
               )}
            </div>
            <div>
               <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Preview URL</h3>
               {project.previewUrl ? (
                 <a href={project.previewUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm truncate block">
                   {project.previewUrl}
                 </a>
               ) : (
                 <span className="text-gray-400 text-sm">Not set</span>
               )}
            </div>
            <div>
               <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Status</h3>
               <span className={`inline-flex items-center px-2 py-1 text-xs font-bold border ${
                  project.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
               }`}>
                  {project.status.toUpperCase()}
               </span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-5 border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Status</h3>
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
               {project.status.toUpperCase()}
            </span>
         </div>
         <div className="bg-white p-5 border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Draft Version</h3>
            <p className="text-2xl font-bold">v{project.draftVersion}</p>
         </div>
         <div className="bg-white p-5 border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Published Version</h3>
            <p className="text-2xl font-bold">v{project.publishedVersion}</p>
         </div>
         <div className="bg-white p-5 border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Project Key</h3>
            <p className="text-sm font-mono text-gray-800 bg-gray-50 p-1 px-2 border border-gray-200 inline-block mt-1 truncate max-w-full">{project.projectKey}</p>
         </div>
      </div>
    </div>
  );
}
