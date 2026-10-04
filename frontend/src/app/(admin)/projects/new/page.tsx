"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function NewWebsite() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    projectKey: '',
    description: '',
    websiteUrl: '',
    previewUrl: '',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/projects', formData);
      router.push('/projects');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create website.');
      setLoading(false);
    }
  };

  const generateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug, projectKey: prev.projectKey || slug }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Website</h1>
      
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        {error && <div className="bg-red-50 text-red-700 p-3 mb-4 text-sm font-medium border border-red-200">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              onBlur={generateSlug}
              placeholder="e.g. Northstar Digital"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. northstar-digital"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Key</label>
              <input 
                type="text" 
                required
                className="w-full border border-gray-300 px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.projectKey}
                onChange={e => setFormData({ ...formData, projectKey: e.target.value })}
                placeholder="e.g. northstar-demo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input 
              type="url" 
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={formData.websiteUrl}
              onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview URL</label>
            <input 
              type="url" 
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={formData.previewUrl}
              onChange={e => setFormData({ ...formData, previewUrl: e.target.value })}
              placeholder="https://preview.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Website'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
