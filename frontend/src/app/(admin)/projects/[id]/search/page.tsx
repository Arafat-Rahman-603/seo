"use client";
import { useParams } from 'next/navigation';

import { useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const params = useParams();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const res = await api.get(`/projects/${params?.id}/search?q=${encodeURIComponent(query)}`);
      setResults(res.data.data);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Search Project</h2>
      
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content, page names, SEO fields..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm shadow-sm"
          />
        </div>
        <button 
          type="submit" 
          disabled={searching || !query.trim()}
          className="bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 disabled:bg-gray-400 rounded-sm shadow-sm transition-colors"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {hasSearched && (
        <div>
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Results ({results.length})</h3>
          
          {results.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 text-center text-gray-500 shadow-sm">
              No results found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((res, i) => (
                <div key={i} className="bg-white border border-gray-200 p-5 shadow-sm hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-sm border ${
                      res.type === 'page' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      res.type === 'seo' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {res.type}
                    </span>
                    <span className="font-medium text-gray-900 capitalize">{res.page}</span>
                    {res.field && (
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-1 rounded-sm border border-gray-200">{res.field}</span>
                    )}
                  </div>
                  <p className="text-gray-800 text-sm italic border-l-2 border-gray-200 pl-3 my-3 max-h-20 overflow-hidden line-clamp-3">"{res.text}"</p>
                  <Link href={res.link} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2 inline-block">
                    View Match →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
