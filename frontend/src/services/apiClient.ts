/**
 * Centralized API Client for LASA-GUARD.
 * Dynamically resolves backend API without hardcoded ports.
 * Supports JWT authentication headers and unified error handling.
 */

const getApiBase = (): string => {
  // If explicitly specified in environment, use that
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  // When running with Vite dev server or production reverse-proxy,
  // relative path '/api' is proxied directly to the backend
  return '';
};

export const API_BASE = getApiBase();

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: string | null;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Try primary resolved URL first
  const primaryUrl = `${API_BASE}${cleanEndpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Retrieve stored JWT token
  const token = localStorage.getItem('lasaguard_auth_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(primaryUrl, mergedOptions);
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Network response was not ok');
      let parsedErr = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.error || jsonErr.message || errText;
      } catch {}
      throw new Error(parsedErr);
    }
    return await res.json();
  } catch (err: any) {
    // If running in development and primary was relative '/api', also try direct port fallback
    if (!API_BASE && typeof window !== 'undefined') {
      const devFallbacks = [
        `http://${window.location.hostname}:5000${cleanEndpoint}`,
      ];
      for (const fallbackUrl of devFallbacks) {
        try {
          const fbRes = await fetch(fallbackUrl, mergedOptions);
          if (fbRes.ok) {
            return await fbRes.json();
          }
        } catch {
          // Continue
        }
      }
    }
    throw err;
  }
}
