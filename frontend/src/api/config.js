const DEPLOYED_API_ORIGIN = 'https://rpv01-backend-o868.onrender.com';
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

function normalizeApiOrigin(origin) {
  return origin
    .replace(/^https:\/\/rpv01-backend-1\.onrender\.com(?=\/|$)/i, DEPLOYED_API_ORIGIN)
    .replace(/\/+$/, '');
}

const defaultApiOrigin = import.meta.env.DEV
  ? 'http://localhost:5000'
  : DEPLOYED_API_ORIGIN;

export const API_ORIGIN = normalizeApiOrigin(configuredApiUrl || defaultApiOrigin);
export const API_BASE = `${API_ORIGIN}/api/v1`;
export const SOCKET_ORIGIN = normalizeApiOrigin(
  import.meta.env.VITE_SOCKET_URL?.trim() || configuredApiUrl || defaultApiOrigin,
);
