"use client";

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import HomeContent from './HomeContent';
import ServicesContent from './ServicesContent';
import AboutContent from './AboutContent';
import ContactContent from './ContactContent';

const PROJECT_ID = '6ac202d4d1c09439df205139'; // Northstar Digital
const API_BASE_URL = 'http://localhost:5000/api';

type FieldMetadata = {
  page: string;
  section: string;
  field: string;
  path: string;
  type: string;
  baseValue: any;
  currentValue: any;
  isOverridden: boolean;
};

type EditorState = 'LOADING' | 'READY' | 'SELECTED' | 'DIRTY' | 'SAVING' | 'SAVED' | 'ERROR' | 'CONFLICT';

export default function PreviewEditor({ user }: { user: any }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [mode, setMode] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [content, setContent] = useState<any>(null);
  const [baseContent, setBaseContent] = useState<any>(null);
  const [activeOverrides, setActiveOverrides] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const [editorState, setEditorState] = useState<EditorState>('READY');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionFields, setSectionFields] = useState<FieldMetadata[]>([]);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const fetchContent = async () => {
    setLoading(true);
    setEditorState('LOADING');
    try {
      const url = `${API_BASE_URL}/projects/${PROJECT_ID}/content?page=${currentPage}&mode=${mode}`;
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      setContent(json.data.data);
      setBaseContent(json.data.baseData);
      setActiveOverrides(json.data.activeOverrides || {});
      setEditorState('READY');
    } catch (error) {
      console.error(error);
      setContent(null);
      setEditorState('ERROR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    setSelectedSection(null);
    setSectionFields([]);
  }, [currentPage, mode]);

  // Handle Event Delegation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (mode === 'PUBLISHED') return;
      
      const target = e.target as HTMLElement;
      
      // Prevent link navigation in editor mode
      if (target.closest('a')) {
        e.preventDefault();
      }

      // 1. Find nearest [data-editor-field] or [data-editor-section]
      const fieldEl = target.closest('[data-editor-field]') as HTMLElement;
      const sectionEl = target.closest('[data-editor-section]') as HTMLElement;
      
      const activeSectionEl = sectionEl || (fieldEl ? fieldEl.closest('[data-editor-section]') as HTMLElement : null);

      if (activeSectionEl) {
        e.preventDefault();
        e.stopPropagation();
        
        const sectionName = activeSectionEl.getAttribute('data-editor-section') || '';
        setSelectedSection(sectionName);
        
        // Find all fields in this section
        const fieldElements = Array.from(activeSectionEl.querySelectorAll('[data-editor-field]'));
        
        // Also check if the section itself has a field (rare but possible)
        if (activeSectionEl.hasAttribute('data-editor-field')) {
          fieldElements.push(activeSectionEl);
        }

        const fieldsMeta: FieldMetadata[] = fieldElements.map(el => {
          const p = el.getAttribute('data-editor-page') || currentPage;
          const f = el.getAttribute('data-editor-field') || '';
          const path = el.getAttribute('data-editor-path') || '';
          const t = el.getAttribute('data-editor-type') || 'text';
          
          const keys = path.split('.');
          let val = content;
          let bVal = baseContent;
          for (const k of keys) {
            if (val) val = val[k];
            if (bVal) bVal = bVal[k];
          }
          
          return {
            page: p,
            section: sectionName,
            field: f,
            path: path,
            type: t,
            baseValue: bVal,
            currentValue: val,
            isOverridden: activeOverrides[path] !== undefined
          };
        });

        // Remove duplicates if any (due to DOM structure)
        const uniqueFields = Array.from(new Map(fieldsMeta.map(item => [item.path, item])).values());
        
        setSectionFields(uniqueFields);
        
        // Initialize edit values
        const newEditValues: Record<string, any> = {};
        uniqueFields.forEach(f => {
          newEditValues[f.path] = f.currentValue;
        });
        setEditValues(newEditValues);
        setEditorState('SELECTED');
      }
    };

    const previewContainer = document.getElementById('preview-content-area');
    if (previewContainer) {
      previewContainer.addEventListener('click', handleClick);
    }
    
    return () => {
      if (previewContainer) {
        previewContainer.removeEventListener('click', handleClick);
      }
    };
  }, [content, baseContent, activeOverrides, currentPage, mode]);

  const handleFieldChange = (path: string, val: any) => {
    setEditValues(prev => ({ ...prev, [path]: val }));
    setEditorState('DIRTY');
  };

  const handleSave = async () => {
    if (sectionFields.length === 0) return;
    setEditorState('SAVING');
    
    // Find what changed
    const changes = sectionFields
      .filter(f => editValues[f.path] !== f.currentValue)
      .map(f => ({
        page: f.page,
        path: f.path,
        value: editValues[f.path]
      }));

    if (changes.length === 0) {
      setEditorState('SAVED');
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/projects/${PROJECT_ID}/content`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ changes }),
          credentials: 'include'
        }
      );
      
      const data = await res.json();
      if (data.success) {
        setEditorState('SAVED');
        await fetchContent();
        
        // Update section fields with new current values
        setSectionFields(prev => prev.map(f => {
          const changed = changes.find(c => c.path === f.path);
          if (changed) {
            return { ...f, currentValue: changed.value, isOverridden: true };
          }
          return f;
        }));
      } else if (data.code === 'CONFLICT') {
        setEditorState('CONFLICT');
        alert('Conflict: Another user has made changes. Please refresh.');
      } else {
        setEditorState('ERROR');
        alert(data.message || 'Save failed');
      }
    } catch (error) {
      console.error(error);
      setEditorState('ERROR');
      alert('Network error while saving');
    }
  };

  const handleReset = async (field: FieldMetadata) => {
    if (!window.confirm(`Are you sure you want to reset ${field.field} to base value?`)) return;
    setEditorState('SAVING');
    try {
      const res = await fetch(
        `${API_BASE_URL}/projects/${PROJECT_ID}/content/override`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: field.page, path: field.path }),
          credentials: 'include'
        }
      );
      if (res.ok) {
        setEditorState('SAVED');
        await fetchContent();
      } else {
        setEditorState('ERROR');
      }
    } catch (error) {
      console.error(error);
      setEditorState('ERROR');
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Are you sure you want to publish these changes?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${PROJECT_ID}/versions/publish`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        alert('Published successfully');
        fetchContent();
      } else {
        alert(data.message || 'Publish failed.');
      }
    } catch (error) {
      console.error(error);
      alert('Publish failed. You may not have permission.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans text-gray-900">
      
      {/* Editor Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-50 shadow-lg flex-shrink-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900">Northstar Preview</h2>
            <p className="text-xs text-gray-500 mt-1">Role: {user.role}</p>
          </div>
          <div className="text-xs px-2 py-1 bg-gray-200 rounded font-mono">
            {editorState}
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Page</label>
          <select 
            className="w-full border border-gray-300 p-2 text-sm bg-white"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
          >
            <option value="home">Home</option>
            <option value="services">Services</option>
            <option value="about">About</option>
            <option value="contact">Contact</option>
          </select>
        </div>

        <div className="p-4 border-b border-gray-200">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mode</label>
          <div className="flex border border-gray-300">
            <button 
              className={`flex-1 py-1 text-sm font-medium ${mode === 'DRAFT' ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
              onClick={() => setMode('DRAFT')}
            >
              Draft
            </button>
            <button 
              className={`flex-1 py-1 text-sm font-medium ${mode === 'PUBLISHED' ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
              onClick={() => setMode('PUBLISHED')}
            >
              Published
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={handlePublish}
            disabled={user.role === 'VIEWER' || mode === 'PUBLISHED'}
            className="w-full bg-blue-600 text-white font-bold py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Publish Changes
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {selectedSection ? (
            <div className="space-y-6 pb-20">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="font-bold text-gray-900 capitalize text-lg">{selectedSection} Section</h3>
              </div>
              
              {sectionFields.map((field) => (
                <div key={field.path} className="bg-white p-3 border border-gray-200 shadow-sm space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm capitalize text-gray-800">{field.field}</span>
                    {field.isOverridden ? (
                      <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 uppercase">Overridden</span>
                    ) : (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 uppercase">Base</span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Current Value</label>
                    {field.type === 'textarea' ? (
                      <textarea 
                        className="w-full border border-gray-300 p-2 text-sm min-h-[80px] bg-white text-gray-900"
                        value={editValues[field.path] ?? ''}
                        onChange={(e) => handleFieldChange(field.path, e.target.value)}
                        disabled={user.role === 'VIEWER' || mode === 'PUBLISHED'}
                      />
                    ) : field.type === 'url' ? (
                      <input 
                        type="url"
                        className="w-full border border-gray-300 p-2 text-sm bg-white text-gray-900"
                        value={editValues[field.path] ?? ''}
                        onChange={(e) => handleFieldChange(field.path, e.target.value)}
                        disabled={user.role === 'VIEWER' || mode === 'PUBLISHED'}
                      />
                    ) : (
                      <input 
                        type="text"
                        className="w-full border border-gray-300 p-2 text-sm bg-white text-gray-900"
                        value={editValues[field.path] ?? ''}
                        onChange={(e) => handleFieldChange(field.path, e.target.value)}
                        disabled={user.role === 'VIEWER' || mode === 'PUBLISHED'}
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                     <label className="text-xs text-gray-500 font-medium">Base Value</label>
                     <div className="text-xs text-gray-500 bg-gray-50 p-2 border border-gray-200 break-words">
                       {field.baseValue?.toString() || '—'}
                     </div>
                  </div>

                  {mode === 'DRAFT' && user.role !== 'VIEWER' && field.isOverridden && (
                     <button 
                       onClick={() => handleReset(field)}
                       disabled={editorState === 'SAVING'}
                       className="text-xs text-red-600 font-medium hover:underline flex items-center gap-1"
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       Reset to Base
                     </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
               <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
               <p className="text-sm">Click any section in the preview area to edit its content.</p>
            </div>
          )}
        </div>
        
        {/* Save Bar */}
        {selectedSection && mode === 'DRAFT' && user.role !== 'VIEWER' && (
          <div className="absolute bottom-0 w-80 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             <button 
               onClick={handleSave}
               disabled={editorState === 'SAVING' || editorState !== 'DIRTY'}
               className={`w-full font-bold py-3 text-sm shadow-sm transition-colors ${
                 editorState === 'DIRTY' 
                   ? 'bg-black text-white hover:bg-gray-800' 
                   : 'bg-gray-200 text-gray-500 cursor-not-allowed'
               }`}
             >
               {editorState === 'SAVING' ? 'Saving...' : editorState === 'SAVED' ? 'Saved' : 'Save Changes'}
             </button>
          </div>
        )}
      </div>

      {/* Website Preview Area */}
      <div className="flex-1 relative flex flex-col overflow-y-auto">
        <div className="bg-gray-900 text-gray-300 text-[11px] uppercase tracking-widest font-semibold text-center py-1.5 flex justify-center items-center gap-2 z-50">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Viewing Preview Mode — Links are disabled
        </div>
        
        <div id="preview-content-area" className={`flex-1 bg-white relative editable-wrapper ${mode === 'DRAFT' ? 'draft-mode' : ''}`}>
          <style dangerouslySetInnerHTML={{__html: `
            .draft-mode [data-editor-section] {
              position: relative;
              transition: all 0.2s ease;
            }
            .draft-mode [data-editor-section]:hover {
              outline: 2px dashed rgba(59, 130, 246, 0.5);
              outline-offset: -2px;
              cursor: pointer;
            }
            .draft-mode [data-editor-section][data-editor-section="${selectedSection}"] {
              outline: 2px solid #3b82f6;
              outline-offset: -2px;
              background-color: rgba(59, 130, 246, 0.02);
            }
            .draft-mode [data-editor-field] {
              transition: background-color 0.2s ease;
            }
            .draft-mode [data-editor-section]:hover [data-editor-field] {
              background-color: rgba(59, 130, 246, 0.1);
              border-radius: 2px;
            }
            .draft-mode [data-editor-section][data-editor-section="${selectedSection}"] [data-editor-field] {
               background-color: rgba(59, 130, 246, 0.15);
               border-radius: 2px;
            }
          `}} />
          
          <div onClick={(e) => {
            if (mode === 'DRAFT' && (e.target as HTMLElement).closest('a')) {
              e.preventDefault();
            }
          }}>
            <Navbar />
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <div className="text-gray-500 font-medium">Loading Northstar...</div>
              </div>
            ) : (
              <div className="min-h-[60vh]">
                {currentPage === 'home' && <HomeContent content={content} />}
                {currentPage === 'services' && <ServicesContent content={content} />}
                {currentPage === 'about' && <AboutContent content={content} />}
                {currentPage === 'contact' && <ContactContent content={content} />}
              </div>
            )}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
