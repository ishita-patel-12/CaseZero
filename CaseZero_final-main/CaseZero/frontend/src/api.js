const B = import.meta.env.VITE_API || 'http://localhost:5000/api';
export async function api(path, { method = 'GET', body } = {}) {
  const t = localStorage.getItem('cz_token');
  const r = await fetch(B + path, { method, headers: { 'Content-Type': 'application/json', ...(t && { Authorization: 'Bearer ' + t }) }, body: body && JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}
