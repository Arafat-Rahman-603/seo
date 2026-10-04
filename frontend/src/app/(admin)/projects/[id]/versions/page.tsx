"use client";
import { useParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function VersionsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const { user } = useAuth();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState<number | null>(null);

  const isAdmin = user?.email?.startsWith('admin');

  useEffect(() => {
    fetchVersions();
  }, [projectId]);

  const fetchVersions = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/versions`);
      setVersions(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (versionNumber: number) => {
    if (!confirm(`Are you sure you want to rollback to Version ${versionNumber}?`)) return;
    
    setRollingBack(versionNumber);
    try {
      await api.post(`/projects/${projectId}/versions/rollback`, { versionNumber });
      await fetchVersions();
      alert('Rollback successful!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Rollback failed');
    } finally {
      setRollingBack(null);
    }
  };

  if (loading) return <div>Loading versions...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Version History</h2>
      
      {versions.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
           <p className="text-gray-500">No version history found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((v) => (
             <div key={v._id} className="bg-white border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <div className="flex items-center gap-3 mb-2">
                   <h3 className="text-lg font-bold text-gray-900">Version {v.versionNumber}</h3>
                   <span className={`px-2 py-0.5 text-xs font-bold rounded-sm border ${
                     v.type === 'PUBLISHED' ? 'bg-green-100 text-green-800 border-green-200' :
                     v.type === 'ROLLBACK' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                     'bg-gray-100 text-gray-800 border-gray-200'
                   }`}>
                     {v.type}
                   </span>
                 </div>
                 <p className="text-sm text-gray-600 mb-1">
                   <span className="font-medium text-gray-800">Author:</span> {v.authorId?.name || 'Unknown'}
                 </p>
                 <p className="text-sm text-gray-600 mb-2">
                   <span className="font-medium text-gray-800">Date:</span> {new Date(v.createdAt).toLocaleString()}
                 </p>
                 
                 {v.changesSummary && v.changesSummary.length > 0 && (
                   <ul className="text-sm text-gray-500 list-disc list-inside">
                     {v.changesSummary.map((summary: string, i: number) => (
                       <li key={i}>{summary}</li>
                     ))}
                   </ul>
                 )}
               </div>
               
               {v.type === 'PUBLISHED' && isAdmin && (
                 <button 
                   onClick={() => handleRollback(v.versionNumber)}
                   disabled={rollingBack === v.versionNumber}
                   className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors"
                 >
                   <RotateCcw size={16} />
                   {rollingBack === v.versionNumber ? 'Rolling back...' : 'Rollback to here'}
                 </button>
               )}
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
