"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import PreviewEditor from '@/components/PreviewEditor';
import { API_BASE_URL } from '@/lib/config';

export default function PreviewPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await checkAuth();
      } else {
        setLoginError(data.message || 'Invalid email or password');
      }
    } catch {
      setLoginError(`Unable to reach backend API at ${API_BASE_URL}. Make sure the backend server is running.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network error on logout
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-gray-600 gap-3">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading Preview...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 border border-gray-200 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Northstar Preview Login</h1>
            <p className="text-xs text-gray-500 mt-1">Sign in to edit and publish page content</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="preview-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="preview-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 p-2 text-sm focus:outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label htmlFor="preview-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="preview-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 p-2 text-sm focus:outline-none focus:border-black"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white p-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2">
              &larr; Back to Northstar Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <PreviewEditor user={user} onLogout={handleLogout} />;
}
