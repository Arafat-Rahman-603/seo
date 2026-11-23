import { cache } from 'react';
import { API_BASE_URL, PROJECT_ID } from './config';
import layoutFallback from '../../data/pages/layout.json';
import homeFallback from '../../data/pages/home.json';
import aboutFallback from '../../data/pages/about.json';
import servicesFallback from '../../data/pages/services.json';
import contactFallback from '../../data/pages/contact.json';

const LOCAL_PAGE_FALLBACKS: Record<string, any> = {
  layout: layoutFallback,
  home: homeFallback,
  about: aboutFallback,
  services: servicesFallback,
  contact: contactFallback,
};

export function getLocalFallbackContent(page: string) {
  return LOCAL_PAGE_FALLBACKS[page] ?? null;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 1500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export const fetchResolvedContent = cache(async function fetchResolvedContent(
  page: string,
  mode: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED',
  token?: string
) {
  try {
    const url =
      mode === 'PUBLISHED'
        ? `${API_BASE_URL}/public/projects/${PROJECT_ID}/content?page=${encodeURIComponent(page)}`
        : `${API_BASE_URL}/projects/${PROJECT_ID}/content?page=${encodeURIComponent(page)}&mode=${mode}`;

    const headers: Record<string, string> = {};
    if (token) headers.Cookie = `token=${token}`;

    const res = await fetchWithTimeout(url, { headers, credentials: 'omit' });
    if (!res.ok) {
      return getLocalFallbackContent(page);
    }

    const json = await res.json();
    if (!json?.success) {
      return getLocalFallbackContent(page);
    }

    return json?.data?.data || json?.data || getLocalFallbackContent(page);
  } catch (error) {
    console.warn(`Falling back to local content for "${page}":`, (error as Error)?.message || error);
    return getLocalFallbackContent(page);
  }
});

export const fetchSeoData = cache(async function fetchSeoData(
  page: string,
  mode: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED',
  token?: string
) {
  try {
    const url =
      mode === 'PUBLISHED'
        ? `${API_BASE_URL}/public/projects/${PROJECT_ID}/seo?page=${encodeURIComponent(page)}`
        : `${API_BASE_URL}/projects/${PROJECT_ID}/seo?page=${encodeURIComponent(page)}&mode=${mode}`;

    const headers: Record<string, string> = {};
    if (token) headers.Cookie = `token=${token}`;

    const res = await fetchWithTimeout(url, { headers, credentials: 'omit' });
    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (!json?.success) {
      return null;
    }

    return json?.data?.data || json?.data || null;
  } catch (error) {
    console.warn(`SEO fetch skipped for "${page}":`, (error as Error)?.message || error);
    return null;
  }
});
