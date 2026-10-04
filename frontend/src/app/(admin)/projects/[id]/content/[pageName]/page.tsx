"use client";
import { useParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';

export default function ContentEditor() {
  const params = useParams();
  const { id: projectId, pageName } = params as any;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftChanges, setDraftChanges] = useState<Record<string, any>>({});
  
  useEffect(() => {
    fetchContent();
  }, [projectId, pageName]);

  const fetchContent = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/content?page=${pageName}`);
      setData(res.data.data);
      setDraftChanges({});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (path: string, value: any) => {
    setDraftChanges(prev => ({ ...prev, [path]: value }));
  };

  const handleSave = async () => {
    const changes = Object.keys(draftChanges).map(path => ({
      page: pageName,
      path,
      value: draftChanges[path]
    }));

    if (changes.length === 0) return;

    setSaving(true);
    try {
      await api.patch(`/projects/${projectId}/content`, { changes });
      await fetchContent(); // refresh
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (path: string) => {
    if (!data.activeOverrides[path]) {
      // Just clear local draft if not yet saved to backend
      const newDrafts = { ...draftChanges };
      delete newDrafts[path];
      setDraftChanges(newDrafts);
      return;
    }

    try {
      await api.delete(`/projects/${projectId}/content/override`, { data: { page: pageName, path } });
      await fetchContent();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading editor...</div>;
  if (!data) return <div>Content not found.</div>;

  const renderFields = (obj: any, prefix = '') => {
    return Object.keys(obj).map(key => {
      const path = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      const type = typeof value;
      
      const isOverridden = !!data.activeOverrides[path];
      const isLocallyChanged = draftChanges[path] !== undefined;
      const currentValue = isLocallyChanged ? draftChanges[path] : value;
      const baseValue = path.split('.').reduce((acc, curr) => acc?.[curr], data.baseData);

      if (type === 'string' || type === 'number') {
        return (
          <div key={path} className="mb-6 p-4 border border-gray-100 bg-gray-50/50 rounded-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-800">{path}</label>
              <div className="flex items-center gap-2">
                {(isOverridden || isLocallyChanged) && (
                  <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-sm">
                    {isLocallyChanged ? 'UNSAVED' : 'OVERRIDDEN'}
                  </span>
                )}
                {(isOverridden || isLocallyChanged) && (
                  <button 
                    onClick={() => handleReset(path)}
                    className="text-gray-500 hover:text-red-600 flex items-center gap-1 text-xs font-medium bg-white border border-gray-200 px-2 py-1 shadow-sm"
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                )}
              </div>
            </div>
            
            {isOverridden && !isLocallyChanged && (
               <div className="mb-2 text-xs text-gray-500 flex gap-2">
                 <span className="font-medium text-gray-400">Base:</span> 
                 <span className="line-through">{baseValue}</span>
               </div>
            )}

            {value.length > 50 ? (
              <textarea 
                value={currentValue}
                onChange={(e) => handleFieldChange(path, e.target.value)}
                className={`w-full p-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] ${isLocallyChanged ? 'border-amber-300' : 'border-gray-300'}`}
              />
            ) : (
              <input 
                type="text"
                value={currentValue}
                onChange={(e) => handleFieldChange(path, e.target.value)}
                className={`w-full p-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${isLocallyChanged ? 'border-amber-300' : 'border-gray-300'}`}
              />
            )}
          </div>
        );
      }
      
      if (type === 'object' && value !== null) {
        if (Array.isArray(value)) {
           return (
             <div key={path} className="mb-6 border-l-2 border-gray-200 pl-4">
                <h4 className="font-semibold text-gray-700 mb-4 uppercase text-sm tracking-wider">{key} (List)</h4>
                {value.map((item, index) => renderFields(item, `${path}.${index}`))}
             </div>
           );
        } else {
           return (
             <div key={path} className="mb-6 border-l-2 border-gray-200 pl-4">
                <h4 className="font-semibold text-gray-700 mb-4 uppercase text-sm tracking-wider">{key}</h4>
                {renderFields(value, path)}
             </div>
           );
        }
      }
      
      return null;
    });
  };

  const hasChanges = Object.keys(draftChanges).length > 0;

  return (
    <div className="bg-white border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold capitalize">{pageName} Content</h2>
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
      
      <div className="p-6">
        {renderFields(data.data)}
      </div>
    </div>
  );
}
