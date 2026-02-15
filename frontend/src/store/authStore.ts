import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// Persistência manual usando localStorage
const loadAuth = (): { user: User | null; token: string | null } => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { user: parsed.user || null, token: parsed.token || null };
    }
  } catch (error) {
    console.error('Erro ao carregar autenticação:', error);
  }
  return { user: null, token: null };
};

const saveAuth = (user: User | null, token: string | null) => {
  try {
    localStorage.setItem('auth-storage', JSON.stringify({ user, token }));
  } catch (error) {
    console.error('Erro ao salvar autenticação:', error);
  }
};

const initialState = loadAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialState.user,
  token: initialState.token,
  setAuth: (user, token) => {
    saveAuth(user, token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('auth-storage');
    set({ user: null, token: null });
  },
}));

