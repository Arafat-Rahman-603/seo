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

export default function PreviewEditor({ user }: { user: any }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [mode, setMode] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [content, setContent] = useState<any>(null);
  const [baseContent, setBaseContent] = useState<any>(null);
  const [activeOverrides, setActiveOverrides] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const [selectedField, setSelectedField] = useState<any>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/projects/${PROJECT_ID}/content?page=${currentPage}&mode=${mode}`;
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      setContent(json.data.data);
      setBaseContent(json.data.baseData);
      setActiveOverrides(json.data.activeOverrides || {});
    } catch (error) {
      console.error(error);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    setSelectedField(null);
  }, [currentPage, mode]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editable = target.closest('[data-editor-field]') as HTMLElement;
      
      if (editable) {
        e.preventDefault();
        e.stopPropagation();
        
        const page = editable.closest('[data-editor-page]')?.getAttribute('data-editor-page') || currentPage;
        const section = editable.closest('[data-editor-section]')?.getAttribute('data-editor-section') || '';
        const field = editable.getAttribute('data-editor-field') || '';
        const path = editable.getAttribute('data-editor-path') || '';
        
        // Find current value in content object
        const keys = path.split('.');
        let val = content;
        for (const k of keys) {
          if (val) val = val[k];
        }

        let baseVal = baseContent;
        for (const k of keys) {
          if (baseVal) baseVal = baseVal[k];
        }

        setSelectedField({ page, section, field, path, baseValue: baseVal });
        setEditValue(val || '');
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
  }, [content, baseContent, currentPage]);

  const handleSave = async () => {
    if (!selectedField) return;
    setSaving(true);
    try {
      await fetch(
        `${API_BASE_URL}/projects/${PROJECT_ID}/content`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            changes: [{
              page: selectedField.page,
              path: selectedField.path,
              value: editValue
            }]
          }),
          credentials: 'include'
        }
      );
      await fetchContent();
      setSelectedField(null);
    } catch (error) {
      console.error(error);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedField) return;
    setSaving(true);
    try {
      await fetch(
        `${API_BASE_URL}/projects/${PROJECT_ID}/content/override`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: selectedField.page, path: selectedField.path }),
          credentials: 'include'
        }
      );
      await fetchContent();
      setSelectedField(null);
    } catch (error) {
      console.error(error);
      alert('Reset failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Are you sure you want to publish these changes?')) return;
    try {
      await fetch(`${API_BASE_URL}/projects/${PROJECT_ID}/versions/publish`, { method: 'POST', credentials: 'include' });
      alert('Published successfully');
      fetchContent();
    } catch (error) {
      console.error(error);
      alert('Publish failed. You may not have permission.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
      
      {/* Editor Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-50 shadow-lg">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-bold text-gray-900">Preview Editor</h2>
          <p className="text-xs text-gray-500 mt-1">Role: {user.role}</p>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Page</label>
          <select 
            className="w-full border border-gray-300 p-2 text-sm"
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
            disabled={user.role === 'VIEWER'}
            className="w-full bg-blue-600 text-white font-bold py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Publish Changes
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {selectedField ? (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Edit Field</h3>
              
              <div>
                <span className="text-xs text-gray-500 block mb-1">Path</span>
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded text-gray-800 break-all">{selectedField.path}</code>
              </div>

              <div>
                <span className="text-xs text-gray-500 block mb-1">Status</span>
                {activeOverrides[selectedField.path] !== undefined ? (
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">OVERRIDDEN</span>
                ) : (
                  <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-200">BASE</span>
                )}
              </div>
              
              <div>
                <span className="text-xs text-gray-500 block mb-1">Base Value</span>
                <div className="text-sm text-gray-700 bg-gray-100 p-2 border border-gray-200 italic">
                  {selectedField.baseValue}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 block mb-1">New Value</span>
                <textarea 
                  className="w-full border border-gray-300 p-2 text-sm min-h-[100px]"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={user.role === 'VIEWER' || mode === 'PUBLISHED'}
                />
              </div>

              {mode === 'DRAFT' && user.role !== 'VIEWER' && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-black text-white font-bold py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleReset}
                    disabled={saving}
                    className="flex-1 bg-white text-red-600 border border-red-200 font-bold py-2 text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm italic mt-10">
              Click any element with a subtle outline to edit.
            </div>
          )}
        </div>
      </div>

      {/* Website Preview Area */}
      <div className="flex-1 relative flex flex-col overflow-y-auto">
        <div className="bg-gray-800 text-white text-xs text-center py-1">
          Viewing Preview - {mode} MODE - Any links clicked inside preview are disabled.
        </div>
        
        {/* We use an id to attach global event delegation */}
        <div id="preview-content-area" className="flex-1 bg-white relative editable-wrapper">
          <style dangerouslySetInnerHTML={{__html: `
            .editable-wrapper [data-editor-field] {
              position: relative;
              cursor: pointer;
              transition: outline 0.1s;
            }
            .editable-wrapper [data-editor-field]:hover {
              outline: 2px dashed #3b82f6;
              outline-offset: 4px;
            }
          `}} />
          
          <div className="pointer-events-none absolute inset-0 z-50" style={{ pointerEvents: 'none' }}></div>
          <div onClick={(e) => {
            // Prevent actual navigation within the preview area if they click links
            if ((e.target as HTMLElement).closest('a')) {
              e.preventDefault();
            }
          }}>
            <Navbar />
            {loading ? (
              <div className="py-24 text-center">Loading page content...</div>
            ) : (
              <>
                {currentPage === 'home' && <HomeContent content={content} />}
                {currentPage === 'services' && <ServicesContent content={content} />}
                {currentPage === 'about' && <AboutContent content={content} />}
                {currentPage === 'contact' && <ContactContent content={content} />}
              </>
            )}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
