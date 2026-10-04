"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function WebsitesList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');
  const { user } = useAuth();
  
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const fetchProjects = () => {
    setLoading(true);
    api.get('/projects').then(res => {
      setProjects(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleArchive = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the active registry?`)) {
      return;
    }
    
    setArchivingId(id);
    try {
      await api.patch(`/projects/${id}/status`);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to archive website.');
    } finally {
      setArchivingId(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  if (loading) return <div className="p-8 text-gray-500">Loading websites...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Websites</h1>
        {user?.role === 'ADMIN' && (
          <Link href="/projects/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium text-sm transition-colors shadow-sm">
            + Add Website
          </Link>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        {['ALL', 'ACTIVE', 'ARCHIVED'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium border ${filter === f ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
           <p className="text-gray-500 mb-4">No websites found for this filter.</p>
           {user?.role === 'ADMIN' && (
             <Link href="/projects/new" className="text-blue-600 hover:underline text-sm font-medium">Create your first website</Link>
           )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Name & Key</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">URLs</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.map((project: any) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{project.name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{project.projectKey}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold border ${
                      project.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {project.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-xs text-blue-600 truncate max-w-[200px] hover:underline cursor-pointer" title={project.websiteUrl}>
                       {project.websiteUrl}
                     </div>
                     <div className="text-xs text-purple-600 truncate max-w-[200px] hover:underline cursor-pointer mt-1" title={project.previewUrl}>
                       {project.previewUrl}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                     {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <Link href={`/projects/${project._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Manage
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <>
                          <Link href={`/projects/${project._id}/edit`} className="text-gray-600 hover:text-gray-900 font-medium">
                            Edit
                          </Link>
                          {project.status !== 'ARCHIVED' && (
                            <button 
                              onClick={() => handleArchive(project._id, project.name)}
                              disabled={archivingId === project._id}
                              className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                            >
                              {archivingId === project._id ? 'Removing...' : 'Remove'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
