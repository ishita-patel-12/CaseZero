function getBaseUrl() {
  const envUrl = (import.meta.env.VITE_API || import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

const BASE_URL = getBaseUrl();

export async function api(path, { method = 'GET', body } = {}) {
  const t = localStorage.getItem('cz_token');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const r = await fetch(BASE_URL + cleanPath, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(t && { Authorization: 'Bearer ' + t })
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
  return d;
}
