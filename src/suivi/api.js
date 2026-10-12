// Accès à l'API de suivi (FastAPI, projet api-suivi / main_local.py).
// En dev, `/api` est redirigé vers http://localhost:8000 par le proxy de vite.config.js.
// Pour un autre hébergement, définir VITE_SUIVI_API_URL (ex. https://suivi.exemple.fr/api).
const BASE = import.meta.env.VITE_SUIVI_API_URL || '/api';
export const DOCS_URL = import.meta.env.VITE_SUIVI_DOCS_URL || 'http://localhost:8000/docs';

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({ detail: `Réponse invalide (${res.status})` }));
  if (!res.ok) {
    const err = new Error(data.detail || String(res.status));
    err.data = data;
    throw err;
  }
  return data;
}

const enc = encodeURIComponent;

export const api = {
  info: () => request('GET', '/info'),
  membres: () => request('GET', '/membres'),
  actions: () => request('GET', '/actions'),

  operations: () => request('GET', '/operations'),
  operation: (idOp) => request('GET', `/operations/${enc(idOp)}`),
  createOperation: (data) => request('POST', '/operations', data),
  updateOperation: (idOp, data) => request('PATCH', `/operations/${enc(idOp)}`, data),
  deleteOperation: (idOp, cascade = false) =>
    request('DELETE', `/operations/${enc(idOp)}${cascade ? '?cascade=true' : ''}`),

  productions: () => request('GET', '/productions'),
  production: (idProd) => request('GET', `/productions/${enc(idProd)}`),
  createProduction: (data) => request('POST', '/productions', data),
  updateProduction: (idProd, data) => request('PATCH', `/productions/${enc(idProd)}`, data),
  deleteProduction: (idProd) => request('DELETE', `/productions/${enc(idProd)}`),
};
