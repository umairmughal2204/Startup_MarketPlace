export const AUTH_TOKEN_KEY = 'slm_auth_token';

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage?.getItem(AUTH_TOKEN_KEY) || null;
};

export const setStoredToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage?.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  window.localStorage?.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};
