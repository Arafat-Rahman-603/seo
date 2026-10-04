const PROJECT_ID = '6ac202d4d1c09439df205139'; // Northstar Digital Object ID from seeded DB
const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchResolvedContent(page: string, mode: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED', token?: string) {
  try {
    const url = mode === 'PUBLISHED' 
      ? `${API_BASE_URL}/public/projects/${PROJECT_ID}/content?page=${page}`
      : `${API_BASE_URL}/projects/${PROJECT_ID}/content?page=${page}&mode=${mode}`;
      
    const headers: any = {};
    if (token) headers.Cookie = `token=${token}`;

    const res = await fetch(url, { headers, credentials: 'omit' }); // for server side
    const json = await res.json();
    return json?.data?.data || json?.data || null;
  } catch (error: any) {
    console.error(`Error fetching content for ${page}:`, error);
    return null;
  }
}

export async function fetchSeoData(page: string, mode: 'DRAFT' | 'PUBLISHED' = 'PUBLISHED', token?: string) {
  try {
    const url = mode === 'PUBLISHED' 
      ? `${API_BASE_URL}/public/projects/${PROJECT_ID}/seo?page=${page}`
      : `${API_BASE_URL}/projects/${PROJECT_ID}/seo?page=${page}&mode=${mode}`;
      
    const headers: any = {};
    if (token) headers.Cookie = `token=${token}`;

    const res = await fetch(url, { headers, credentials: 'omit' });
    const json = await res.json();
    return json?.data?.data || json?.data || null;
  } catch (error: any) {
    console.error(`Error fetching SEO for ${page}:`, error);
    return null;
  }
}
