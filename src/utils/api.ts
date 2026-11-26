const rawBase = import.meta.env.VITE_API_BASE_URL;

export const API_BASE =
  typeof rawBase === 'string' ? rawBase.trim().replace(/\/+$/, '') : '';

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}
