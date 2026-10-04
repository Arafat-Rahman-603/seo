"use client";
import { useParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export default function PublishPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  
  const isAdmin = user?.email?.startsWith('admin'); // Very basic role check for UI display

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setMessage('');
    try {
      await api.post(`/projects/${projectId}/versions/publish`);
      setMessage('Successfully published runtime changes!');
      await fetchProject();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const hasChanges = project.draftVersion > (project.publishedVersion || 0) + 1; // Basic heuristic: if draft > published + 1, there are changes

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Publish Runtime Changes</h2>
      
      <div className="bg-white border border-gray-200 shadow-sm p-8 text-center space-y-6">
         <div className="flex justify-center mb-4">
            <UploadCloud size={64} className="text-blue-500" />
         </div>
         
         <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Publish Draft to Active Version</h3>
            <p className="text-gray-600 max-w-lg mx-auto">
              This action takes a snapshot of the current Draft runtime state (Content and SEO overrides) and sets it as the active Published version.
            </p>
         </div>

         <div className="flex items-center justify-center gap-8 py-6 border-y border-gray-100 bg-gray-50/50">
            <div>
               <p className="text-sm text-gray-500 font-medium mb-1">Current Draft Version</p>
               <p className="text-3xl font-bold text-blue-600">v{project.draftVersion}</p>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="text-gray-400">→</div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div>
               <p className="text-sm text-gray-500 font-medium mb-1">Active Published</p>
               <p className="text-3xl font-bold text-green-600">v{project.publishedVersion}</p>
            </div>
         </div>

         {message && (
            <div className={`p-4 text-sm font-medium ${message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
               {message}
            </div>
         )}

         {!isAdmin && (
            <div className="p-4 bg-amber-50 text-amber-800 text-sm border border-amber-200">
               Publishing requires ADMIN role.
            </div>
         )}

         <button
            onClick={handlePublish}
            disabled={publishing || !isAdmin}
            className={`w-full max-w-sm mx-auto py-3 px-4 rounded-md font-medium text-white transition-all shadow-sm
               ${publishing || !isAdmin ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'}`}
         >
            {publishing ? 'Publishing...' : `Publish Version ${project.draftVersion}`}
         </button>
      </div>
    </div>
  );
}
