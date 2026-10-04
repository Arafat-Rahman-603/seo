"use client";
import { useParams } from 'next/navigation';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function PreviewPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [mode, setMode] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [page, setPage] = useState('home');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPreviewData();
  }, [mode, page, projectId]);

  const fetchPreviewData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/content?page=${page}&mode=${mode}`);
      setData(res.data.data.data);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderHome = () => {
    if (!data) return null;
    return (
      <div className="border border-gray-200 min-h-[500px] bg-white">
        {/* Header */}
        <header className="p-4 flex justify-between items-center bg-gray-50 border-b">
          <div className="font-bold text-lg">Northstar</div>
          <nav className="flex gap-4">
            <a href="#" className="text-blue-600 hover:underline">Home</a>
            <a href="#" className="hover:underline">Services</a>
            <a href="#" className="hover:underline">About</a>
          </nav>
        </header>
        
        {/* Hero */}
        {data.hero && (
           <div className="p-16 text-center bg-blue-50 border-b">
              <h1 className="text-4xl font-extrabold mb-4">{data.hero.title}</h1>
              <p className="text-lg text-gray-600 mb-8">{data.hero.description}</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium">{data.hero.buttonText}</button>
           </div>
        )}

        {/* Services */}
        {data.services && (
           <div className="p-16">
              <h2 className="text-2xl font-bold text-center mb-10">Our Services</h2>
              <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                 {data.services.map((service: any, i: number) => (
                    <div key={i} className="border p-6 shadow-sm">
                       <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                       <p className="text-gray-600">{service.description}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    );
  };

  const renderGeneric = () => {
     if (!data) return null;
     return (
       <div className="border border-gray-200 min-h-[500px] bg-white p-8">
          <pre className="bg-gray-50 p-4 overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
       </div>
     )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Functional Preview</h2>
        
        <div className="flex gap-4 items-center">
          <select 
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="border border-gray-300 p-2 rounded bg-white text-sm"
          >
            <option value="home">Home</option>
            <option value="services">Services</option>
            <option value="about">About</option>
            <option value="contact">Contact</option>
          </select>

          <div className="flex bg-gray-100 rounded p-1">
            <button
              onClick={() => setMode('DRAFT')}
              className={`px-4 py-1 text-sm font-medium rounded ${mode === 'DRAFT' ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Draft
            </button>
            <button
              onClick={() => setMode('PUBLISHED')}
              className={`px-4 py-1 text-sm font-medium rounded ${mode === 'PUBLISHED' ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Published
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-8 rounded-lg shadow-inner">
         <div className="mx-auto max-w-5xl shadow-xl bg-white overflow-hidden rounded-t-lg">
           <div className="bg-gray-200 px-4 py-2 flex gap-2 items-center">
             <div className="w-3 h-3 rounded-full bg-red-400"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
             <div className="w-3 h-3 rounded-full bg-green-400"></div>
             <div className="bg-white px-2 py-0.5 rounded text-xs text-gray-500 w-full ml-4 truncate">
               preview.plan2.local/{page} ({mode})
             </div>
           </div>
           {loading ? (
             <div className="h-[500px] flex items-center justify-center">Loading Preview...</div>
           ) : (
             page === 'home' ? renderHome() : renderGeneric()
           )}
         </div>
      </div>
    </div>
  );
}
