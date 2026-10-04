"use client";
import { useParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Save, AlertCircle } from 'lucide-react';

export default function SeoEditor() {
  const params = useParams();
  const { id: projectId, pageName } = params as any;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftChanges, setDraftChanges] = useState<Record<string, string>>({});
  
  useEffect(() => {
    fetchSeo();
  }, [projectId, pageName]);

  const fetchSeo = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/seo?page=${pageName}`);
      setData(res.data.data);
      setDraftChanges({});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setDraftChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const changes = Object.keys(draftChanges).map(field => ({
      field,
      value: draftChanges[field]
    }));

    if (changes.length === 0) return;

    setSaving(true);
    try {
      await api.patch(`/projects/${projectId}/seo`, { page: pageName, changes });
      await fetchSeo(); // refresh
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading SEO editor...</div>;
  if (!data) return <div>SEO data not found.</div>;

  const currentData = { ...data.data, ...draftChanges };
  const hasChanges = Object.keys(draftChanges).length > 0;

  const seoFields = [
    { name: 'title', label: 'Meta Title', max: 60 },
    { name: 'description', label: 'Meta Description', max: 160, type: 'textarea' },
    { name: 'canonical', label: 'Canonical URL' },
    { name: 'robots', label: 'Robots' },
    { name: 'ogTitle', label: 'Open Graph Title' },
    { name: 'ogDescription', label: 'Open Graph Description', type: 'textarea' },
    { name: 'ogImage', label: 'Open Graph Image URL' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold capitalize">{pageName} SEO</h2>
          <button 
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors
              ${hasChanges && !saving ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {seoFields.map(field => {
             const isChanged = draftChanges[field.name] !== undefined;
             const value = currentData[field.name] || '';
             
             return (
               <div key={field.name}>
                 <div className="flex justify-between mb-1">
                   <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                   {field.max && (
                     <span className={`text-xs ${value.length > field.max ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                       {value.length} / {field.max}
                     </span>
                   )}
                 </div>
                 {field.type === 'textarea' ? (
                   <textarea
                     value={value}
                     onChange={(e) => handleFieldChange(field.name, e.target.value)}
                     className={`w-full p-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] ${isChanged ? 'border-amber-300 bg-amber-50/20' : 'border-gray-300'}`}
                   />
                 ) : (
                   <input
                     type="text"
                     value={value}
                     onChange={(e) => handleFieldChange(field.name, e.target.value)}
                     className={`w-full p-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${isChanged ? 'border-amber-300 bg-amber-50/20' : 'border-gray-300'}`}
                   />
                 )}
                 {data.activeOverrides[field.name] && !isChanged && (
                    <p className="text-xs text-amber-600 mt-1">Overridden from base value.</p>
                 )}
               </div>
             )
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">SERP Preview</h3>
          <div className="w-full max-w-[600px] font-sans">
             <div className="text-sm text-gray-700 mb-1 truncate flex items-center gap-2">
                <span className="bg-gray-200 w-6 h-6 rounded-full inline-block"></span>
                <span>{currentData.canonical || 'https://example.com'}</span>
             </div>
             <h4 className="text-xl text-[#1a0dab] mb-1 hover:underline cursor-pointer truncate">
               {currentData.title || 'Untitled Page'}
             </h4>
             <p className="text-sm text-[#4d5156] line-clamp-2">
               {currentData.description || 'No description provided.'}
             </p>
          </div>
        </div>

        {data.diagnostics && data.diagnostics.length > 0 && (
          <div className="bg-white border border-gray-200 shadow-sm p-4">
             <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Diagnostics</h3>
             <ul className="space-y-3">
               {data.diagnostics.map((diag: any, idx: number) => (
                 <li key={idx} className="flex gap-2 text-sm">
                   {diag.severity === 'ERROR' ? (
                     <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                   ) : (
                     <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                   )}
                   <span className="text-gray-700">{diag.type.replace(/_/g, ' ')}</span>
                 </li>
               ))}
             </ul>
          </div>
        )}
      </div>
    </div>
  );
}
