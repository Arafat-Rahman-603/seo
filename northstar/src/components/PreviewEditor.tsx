"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import HomeContent from './HomeContent';
import ServicesContent from './ServicesContent';
import AboutContent from './AboutContent';
import ContactContent from './ContactContent';
import { API_BASE_URL, PROJECT_ID } from '@/lib/config';
import { getLocalFallbackContent } from '@/lib/api';

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

type PageBundle = {
  data: any;
  baseData: any;
  activeOverrides: Record<string, any>;
};

const PAGE_SECTIONS: Record<string, { section: string; label: string; targetPage?: string }[]> = {
  home: [
    { section: 'navbar', label: 'Navbar (Layout)', targetPage: 'layout' },
    { section: 'hero', label: 'Hero' },
    { section: 'trusted', label: 'Trusted Companies' },
    { section: 'servicesPreview', label: 'Services Preview' },
    { section: 'cta', label: 'CTA' },
    { section: 'footer', label: 'Footer (Layout)', targetPage: 'layout' },
  ],
  services: [
    { section: 'navbar', label: 'Navbar (Layout)', targetPage: 'layout' },
    { section: 'header', label: 'Header' },
    { section: 'services', label: 'Services List' },
    { section: 'cta', label: 'CTA' },
    { section: 'footer', label: 'Footer (Layout)', targetPage: 'layout' },
  ],
  about: [
    { section: 'navbar', label: 'Navbar (Layout)', targetPage: 'layout' },
    { section: 'header', label: 'Header' },
    { section: 'mission', label: 'Mission' },
    { section: 'team', label: 'Leadership Team' },
    { section: 'footer', label: 'Footer (Layout)', targetPage: 'layout' },
  ],
  contact: [
    { section: 'navbar', label: 'Navbar (Layout)', targetPage: 'layout' },
    { section: 'header', label: 'Header' },
    { section: 'info', label: 'Contact Info' },
    { section: 'form', label: 'Contact Form' },
    { section: 'footer', label: 'Footer (Layout)', targetPage: 'layout' },
  ],
};

function getValueByPath(obj: any, path: string) {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

function setValueByPath(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] == null) {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

export default function PreviewEditor({
  user,
  onLogout,
}: {
  user: any;
  onLogout?: () => void;
}) {
  const [currentPage, setCurrentPage] = useState('home');
  const [mode, setMode] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  const [pageBundle, setPageBundle] = useState<PageBundle>({
    data: null,
    baseData: null,
    activeOverrides: {},
  });
  const [layoutBundle, setLayoutBundle] = useState<PageBundle>({
    data: getLocalFallbackContent('layout'),
    baseData: getLocalFallbackContent('layout'),
    activeOverrides: {},
  });

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [editorState, setEditorState] = useState<EditorState>('READY');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSectionPage, setSelectedSectionPage] = useState<string>('home');
  const [sectionFields, setSectionFields] = useState<FieldMetadata[]>([]);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const showNotice = useCallback((type: 'success' | 'error', message: string) => {
    setStatusNotice({ type, message });
  }, []);

  useEffect(() => {
    if (!statusNotice) return;
    const timer = setTimeout(() => setStatusNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [statusNotice]);

  const fetchSinglePage = useCallback(
    async (pageName: string): Promise<PageBundle> => {
      const url = `${API_BASE_URL}/projects/${PROJECT_ID}/content?page=${encodeURIComponent(pageName)}&mode=${mode}`;
      const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
      const json = await res.json();

      if (!res.ok || !json?.success || !json?.data) {
        throw new Error(json?.message || `Failed to load ${pageName} content (${res.status})`);
      }

      return {
        data: json.data.data,
        baseData: json.data.baseData,
        activeOverrides: json.data.activeOverrides || {},
      };
    },
    [mode]
  );

  const fetchContent = useCallback(
    async (preserveState?: EditorState) => {
      setLoading(true);
      setFetchError(null);
      if (!preserveState) setEditorState('LOADING');
      try {
        const [freshPage, freshLayout] = await Promise.all([
          fetchSinglePage(currentPage),
          fetchSinglePage('layout').catch(() => ({
            data: getLocalFallbackContent('layout'),
            baseData: getLocalFallbackContent('layout'),
            activeOverrides: {},
          })),
        ]);

        setPageBundle(freshPage);
        setLayoutBundle(freshLayout);
        setEditorState(preserveState || 'READY');

        return { page: freshPage, layout: freshLayout };
      } catch (error: any) {
        console.error(error);
        setPageBundle({ data: null, baseData: null, activeOverrides: {} });
        setFetchError(error?.message || 'Unable to load content from backend.');
        setEditorState('ERROR');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentPage, fetchSinglePage]
  );

  useEffect(() => {
    fetchContent();
    setSelectedSection(null);
    setSectionFields([]);
    setEditValues({});
  }, [fetchContent]);

  // Apply unsaved draft edits optimistically to page content
  const previewPageContent = useMemo(() => {
    if (!pageBundle.data) return null;
    if (mode !== 'DRAFT' || selectedSectionPage === 'layout' || Object.keys(editValues).length === 0) {
      return pageBundle.data;
    }

    const cloned = JSON.parse(JSON.stringify(pageBundle.data));
    for (const [path, val] of Object.entries(editValues)) {
      if (path) {
        setValueByPath(cloned, path, val);
      }
    }
    return cloned;
  }, [pageBundle.data, editValues, mode, selectedSectionPage]);

  // Apply unsaved draft edits optimistically to layout (Navbar & Footer) content
  const previewLayoutContent = useMemo(() => {
    if (!layoutBundle.data) return getLocalFallbackContent('layout');
    if (mode !== 'DRAFT' || selectedSectionPage !== 'layout' || Object.keys(editValues).length === 0) {
      return layoutBundle.data;
    }

    const cloned = JSON.parse(JSON.stringify(layoutBundle.data));
    for (const [path, val] of Object.entries(editValues)) {
      if (path) {
        setValueByPath(cloned, path, val);
      }
    }
    return cloned;
  }, [layoutBundle.data, editValues, mode, selectedSectionPage]);

  const selectSectionElement = useCallback(
    (activeSectionEl: HTMLElement) => {
      const sectionName = activeSectionEl.getAttribute('data-editor-section') || '';
      const sectionOwnerPage =
        activeSectionEl.getAttribute('data-editor-page') ||
        activeSectionEl.closest('[data-editor-page]')?.getAttribute('data-editor-page') ||
        (sectionName === 'navbar' || sectionName === 'footer' ? 'layout' : currentPage);

      setSelectedSection(sectionName);
      setSelectedSectionPage(sectionOwnerPage);

      const bundle = sectionOwnerPage === 'layout' ? layoutBundle : pageBundle;

      const fieldElements = Array.from(activeSectionEl.querySelectorAll('[data-editor-field]'));
      if (activeSectionEl.hasAttribute('data-editor-field')) {
        fieldElements.push(activeSectionEl);
      }

      const fieldsMeta: FieldMetadata[] = fieldElements.map((el) => {
        const p = el.getAttribute('data-editor-page') || sectionOwnerPage;
        const f = el.getAttribute('data-editor-field') || '';
        const path = el.getAttribute('data-editor-path') || '';
        const t = el.getAttribute('data-editor-type') || 'text';

        const targetBundle = p === 'layout' ? layoutBundle : bundle;
        const val = getValueByPath(targetBundle.data, path);
        const bVal = getValueByPath(targetBundle.baseData, path);

        return {
          page: p,
          section: sectionName,
          field: f,
          path,
          type: t,
          baseValue: bVal,
          currentValue: val,
          isOverridden: targetBundle.activeOverrides[path] !== undefined,
        };
      });

      const uniqueFields = Array.from(new Map(fieldsMeta.map((item) => [item.path, item])).values());
      setSectionFields(uniqueFields);

      const newEditValues: Record<string, any> = {};
      uniqueFields.forEach((f) => {
        newEditValues[f.path] = f.currentValue ?? '';
      });
      setEditValues(newEditValues);
      setEditorState('SELECTED');
    },
    [currentPage, layoutBundle, pageBundle]
  );

  const handleSelectSectionByName = useCallback(
    (sectionName: string) => {
      if (mode !== 'DRAFT') {
        setMode('DRAFT');
      }
      const previewContainer = document.getElementById('preview-content-area');
      if (!previewContainer) return;
      const el = previewContainer.querySelector(
        `[data-editor-section="${sectionName}"]`
      ) as HTMLElement | null;
      if (el) {
        selectSectionElement(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [mode, selectSectionElement]
  );

  // Event delegation for selecting editable sections (including Navbar & Footer) in DRAFT mode
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest('a')) {
        e.preventDefault();
      }

      if (mode === 'PUBLISHED') return;

      const fieldEl = target.closest('[data-editor-field]') as HTMLElement | null;
      const sectionEl = target.closest('[data-editor-section]') as HTMLElement | null;
      const activeSectionEl =
        sectionEl || (fieldEl ? (fieldEl.closest('[data-editor-section]') as HTMLElement | null) : null);

      if (activeSectionEl) {
        e.preventDefault();
        e.stopPropagation();
        selectSectionElement(activeSectionEl);
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
  }, [mode, selectSectionElement]);

  const syncSectionFieldsWithFreshData = (
    fresh: { page: PageBundle; layout: PageBundle } | null
  ) => {
    if (!fresh) return;
    setSectionFields((prev) =>
      prev.map((f) => {
        const b = f.page === 'layout' ? fresh.layout : fresh.page;
        return {
          ...f,
          currentValue: getValueByPath(b.data, f.path),
          baseValue: getValueByPath(b.baseData, f.path),
          isOverridden: b.activeOverrides[f.path] !== undefined,
        };
      })
    );
    setEditValues((prev) => {
      const next: Record<string, any> = {};
      for (const path of Object.keys(prev)) {
        const b = selectedSectionPage === 'layout' ? fresh.layout : fresh.page;
        next[path] = getValueByPath(b.data, path) ?? '';
      }
      return next;
    });
  };

  const handleFieldChange = (path: string, val: any) => {
    setEditValues((prev) => ({ ...prev, [path]: val }));
    setEditorState('DIRTY');
  };

  const handleSave = async () => {
    if (sectionFields.length === 0) return;
    setEditorState('SAVING');

    const changes = sectionFields
      .filter((f) => editValues[f.path] !== (f.currentValue ?? ''))
      .map((f) => ({
        page: f.page,
        path: f.path,
        value: editValues[f.path],
      }));

    if (changes.length === 0) {
      setEditorState('SAVED');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/projects/${PROJECT_ID}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const fresh = await fetchContent('SAVED');
        syncSectionFieldsWithFreshData(fresh);
        showNotice('success', 'Draft changes saved.');
      } else if (data.code === 'CONFLICT') {
        setEditorState('CONFLICT');
        showNotice('error', 'Conflict: Another user made changes. Please refresh.');
      } else {
        setEditorState('ERROR');
        showNotice('error', data.message || 'Save failed.');
      }
    } catch (error) {
      console.error(error);
      setEditorState('ERROR');
      showNotice('error', 'Network error while saving.');
    }
  };

  const handleReset = async (field: FieldMetadata) => {
    if (!window.confirm(`Reset "${field.field}" back to its base value?`)) return;
    setEditorState('SAVING');
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${PROJECT_ID}/content/override`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: field.page, path: field.path }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const fresh = await fetchContent('SAVED');
        syncSectionFieldsWithFreshData(fresh);
        showNotice('success', `Reset "${field.field}" to base value.`);
      } else {
        setEditorState('ERROR');
        showNotice('error', data.message || 'Failed to reset field.');
      }
    } catch (error) {
      console.error(error);
      setEditorState('ERROR');
      showNotice('error', 'Network error while resetting field.');
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Are you sure you want to publish all draft changes live?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${PROJECT_ID}/versions/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotice('success', 'Published successfully!');
        const fresh = await fetchContent('READY');
        syncSectionFieldsWithFreshData(fresh);
      } else {
        showNotice('error', data.message || 'Publish failed.');
      }
    } catch (error) {
      console.error(error);
      showNotice('error', 'Publish failed. Make sure you have ADMIN permission.');
    }
  };

  const canEdit = user?.role !== 'VIEWER' && mode === 'DRAFT';
  const canPublish = user?.role === 'ADMIN' && mode === 'DRAFT';

  const selectedSectionCss = selectedSection
    ? `
      .draft-mode [data-editor-section="${selectedSection}"] {
        outline: 2px solid #3b82f6;
        outline-offset: -2px;
        background-color: rgba(59, 130, 246, 0.02);
      }
      .draft-mode [data-editor-section="${selectedSection}"] [data-editor-field] {
        background-color: rgba(59, 130, 246, 0.15);
        border-radius: 2px;
      }
    `
    : '';

  const availableSections = PAGE_SECTIONS[currentPage] || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans text-gray-900">
      {/* Editor Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col z-50 shadow-lg flex-shrink-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900">Northstar Preview</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.email} &bull; <span className="font-semibold">{user?.role || 'ADMIN'}</span>
              </p>
            </div>
            <div className="text-[11px] px-2 py-1 bg-gray-200 rounded font-mono">
              {editorState}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <Link href="/" className="text-gray-600 hover:text-gray-900 underline underline-offset-2">
              View Live Site
            </Link>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Log Out
              </button>
            )}
          </div>
        </div>

        {statusNotice && (
          <div
            className={`px-4 py-2 text-xs font-medium border-b ${
              statusNotice.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {statusNotice.message}
          </div>
        )}

        <div className="p-4 border-b border-gray-200 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Page
            </label>
            <select
              className="w-full border border-gray-300 p-2 text-sm bg-white text-gray-900"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
            >
              <option value="home">Home</option>
              <option value="services">Services</option>
              <option value="about">About</option>
              <option value="contact">Contact</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Sections &amp; Layout
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableSections.map((item) => (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => handleSelectSectionByName(item.section)}
                  className={`text-xs px-2.5 py-1 border transition-colors ${
                    selectedSection === item.section
                      ? 'bg-black text-white border-black font-semibold'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 flex gap-2 items-center">
          <div className="flex-1 flex border border-gray-300">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold ${
                mode === 'DRAFT' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMode('DRAFT')}
            >
              Draft
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold ${
                mode === 'PUBLISHED' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMode('PUBLISHED')}
            >
              Published
            </button>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            title={!canPublish ? 'Only ADMIN users can publish in Draft mode' : 'Publish draft changes'}
            className="bg-blue-600 text-white font-bold px-3 py-1.5 text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Publish
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {selectedSection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div>
                  <h3 className="font-bold text-gray-900 capitalize text-base">
                    {selectedSection} Section
                  </h3>
                  <span className="text-[11px] text-gray-500 uppercase">
                    {selectedSectionPage === 'layout' ? 'Global Layout' : `${currentPage} Page`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSection(null);
                    setSectionFields([]);
                    setEditValues({});
                    setEditorState('READY');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-900"
                >
                  Close
                </button>
              </div>

              {sectionFields.map((field) => (
                <div key={field.path} className="bg-white p-3 border border-gray-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-sm capitalize text-gray-800">{field.field}</span>
                    {field.isOverridden ? (
                      <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 uppercase">
                        Overridden
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 uppercase">
                        Base
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Current Value</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full border border-gray-300 p-2 text-sm min-h-[80px] bg-white text-gray-900 focus:outline-none focus:border-black"
                        value={editValues[field.path] ?? ''}
                        onChange={(e) => handleFieldChange(field.path, e.target.value)}
                        disabled={!canEdit}
                      />
                    ) : field.type === 'url' ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-black"
                        value={editValues[field.path] ?? ''}
                        onChange={(e) => handleFieldChange(field.path, e.target.value)}
                        disabled={!canEdit}
                        placeholder="/contact or https://..."
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-black"
                        value={editValues[field.path] ?? ''}
                        onChange={(e) => handleFieldChange(field.path, e.target.value)}
                        disabled={!canEdit}
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Base Value</label>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 border border-gray-200 break-words">
                      {field.baseValue !== undefined && field.baseValue !== null && field.baseValue !== ''
                        ? String(field.baseValue)
                        : '—'}
                    </div>
                  </div>

                  {canEdit && field.isOverridden && (
                    <button
                      type="button"
                      onClick={() => handleReset(field)}
                      disabled={editorState === 'SAVING'}
                      className="text-xs text-red-600 font-medium hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Reset to Base
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <p className="text-sm">
                {mode === 'DRAFT'
                  ? 'Click any section in the preview (including Navbar or Footer) or choose a section above to edit.'
                  : 'Switch to Draft mode to select and edit sections.'}
              </p>
            </div>
          )}
        </div>

        {/* Save Bar */}
        {selectedSection && canEdit && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              type="button"
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
      </aside>

      {/* Website Preview Area */}
      <div className="flex-1 relative flex flex-col overflow-y-auto">
        <div className="bg-gray-900 text-gray-300 text-[11px] uppercase tracking-widest font-semibold text-center py-1.5 flex justify-center items-center gap-2 sticky top-0 z-50">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Viewing {mode} Preview — Click Navbar, Footer, or Any Page Section to Edit
        </div>

        <div
          id="preview-content-area"
          className={`flex-1 bg-white relative editable-wrapper flex flex-col ${mode === 'DRAFT' ? 'draft-mode' : ''}`}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .draft-mode [data-editor-section] {
                  position: relative;
                  transition: all 0.2s ease;
                }
                .draft-mode [data-editor-section]:hover {
                  outline: 2px dashed rgba(59, 130, 246, 0.5);
                  outline-offset: -2px;
                  cursor: pointer;
                }
                .draft-mode [data-editor-field] {
                  transition: background-color 0.2s ease;
                }
                .draft-mode [data-editor-section]:hover [data-editor-field] {
                  background-color: rgba(59, 130, 246, 0.1);
                  border-radius: 2px;
                }
                ${selectedSectionCss}
              `,
            }}
          />

          <Navbar
            content={previewLayoutContent?.navbar}
            activePage={currentPage}
            onNavigate={mode === 'PUBLISHED' ? setCurrentPage : undefined}
          />

          {loading ? (
            <div className="py-32 flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
              <div className="text-gray-500 font-medium">Loading Northstar...</div>
            </div>
          ) : fetchError ? (
            <div className="py-24 px-6 max-w-lg mx-auto text-center space-y-4 flex-1">
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm">
                {fetchError}
              </div>
              <button
                type="button"
                onClick={() => fetchContent()}
                className="bg-black text-white px-5 py-2 text-sm font-medium hover:bg-gray-800"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex-1 min-h-[60vh]">
              {currentPage === 'home' && <HomeContent content={previewPageContent} />}
              {currentPage === 'services' && <ServicesContent content={previewPageContent} />}
              {currentPage === 'about' && <AboutContent content={previewPageContent} />}
              {currentPage === 'contact' && <ContactContent content={previewPageContent} />}
            </div>
          )}

          <Footer
            content={previewLayoutContent?.footer}
            onNavigate={mode === 'PUBLISHED' ? setCurrentPage : undefined}
          />
        </div>
      </div>
    </div>
  );
}
