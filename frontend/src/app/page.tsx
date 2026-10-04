"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Auth state:", { user, loading });
    if (!loading) {
      console.log("Navigating...");
      if (user) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/login';
      }
    }
  }, [user, loading]);

  return <div className="p-8">Loading...</div>;
}
