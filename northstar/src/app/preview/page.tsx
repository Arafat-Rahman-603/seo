"use client";

import { useEffect, useState } from 'react';
import PreviewEditor from '@/components/PreviewEditor';

const API_BASE_URL = 'http://localhost:5000/api';

export default function PreviewPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        checkAuth();
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error: any) {
      setLoginError('Login failed');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Preview...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Preview Login</h1>
          {loginError && <div className="bg-red-50 text-red-600 p-3 mb-4 text-sm">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full border border-gray-300 p-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full border border-gray-300 p-2 text-sm"
                required
              />
            </div>
            <button type="submit" className="w-full bg-black text-white p-2 text-sm font-medium hover:bg-gray-800">
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <PreviewEditor user={user} />;
}
