"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        window.location.href = '/dashboard'; // Force refresh to get fresh auth state
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Central Admin Login</h1>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 font-medium hover:bg-blue-700">
            Login
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500 space-y-1 text-center">
          <p>Admin: admin@demo.com / demo123</p>
          <p>Editor: editor@demo.com / demo123</p>
          <p>Viewer: viewer@demo.com / demo123</p>
        </div>
      </div>
    </div>
  );
}
