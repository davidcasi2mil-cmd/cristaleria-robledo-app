import { create } from 'zustand';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR';
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  setAuth: (usuario: Usuario, token: string) => void;
  logout: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: null,
  setAuth: (usuario, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cr_token', token);
    }
    set({ usuario, token });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cr_token');
    }
    set({ usuario: null, token: null });
  },
  initFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cr_token');
      if (token) {
        set({ token });
      }
    }
  },
}));
