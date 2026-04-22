import { apiClient } from '../infrastructure/api/client';

export interface LoginCredentials {
  email: string;
  senha?: string;
}

export interface SessionUser {
  id?: string;
  name?: string | null;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

const sessionUserStorageKey = 'sessionUser';

function setTokenCookie(token: string) {
  document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

function clearTokenCookie() {
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/login', {
      email: credentials.email,
      password: credentials.senha,
    });

    return response.data as {
      access_token: string;
      user: SessionUser;
    };
  },

  async getProfile() {
    const response = await apiClient.get('/auth/me');
    return response.data as {
      userId: string;
      email: string;
      role: string;
    };
  },

  persistSession(accessToken: string, user: SessionUser) {
    if (typeof window === 'undefined') {
      return;
    }

    setTokenCookie(accessToken);
    window.localStorage.setItem(sessionUserStorageKey, JSON.stringify(user));
  },

  clearSession() {
    if (typeof window === 'undefined') {
      return;
    }

    clearTokenCookie();
    window.localStorage.removeItem(sessionUserStorageKey);
  },

  getStoredUser(): SessionUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const rawUser = window.localStorage.getItem(sessionUserStorageKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as SessionUser;
    } catch {
      window.localStorage.removeItem(sessionUserStorageKey);
      return null;
    }
  },
};
