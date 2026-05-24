import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDarkMode: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  toggleDarkMode: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Graceful server-side rendering check
  const isClient = typeof window !== 'undefined';
  const savedToken = isClient ? localStorage.getItem('zenith_token') : null;
  const savedUser = isClient ? localStorage.getItem('zenith_user') : null;
  const savedTheme = isClient ? (localStorage.getItem('zenith_theme') !== 'light') : true;

  // Set initial document class on import if in client
  if (isClient) {
    if (savedTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  let parsedUser = null;
  if (savedUser) {
    try {
      parsedUser = JSON.parse(savedUser);
    } catch {
      parsedUser = null;
    }
  }

  return {
    token: savedToken,
    user: parsedUser,
    isAuthenticated: !!savedToken,
    isLoading: false,
    isDarkMode: savedTheme,

    setAuth: (token, user) => {
      if (isClient) {
        localStorage.setItem('zenith_token', token);
        localStorage.setItem('zenith_user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true });
    },

    clearAuth: () => {
      if (isClient) {
        localStorage.removeItem('zenith_token');
        localStorage.removeItem('zenith_user');
      }
      set({ token: null, user: null, isAuthenticated: false });
    },

    setLoading: (isLoading) => set({ isLoading }),

    toggleDarkMode: () => {
      set((state) => {
        const nextDark = !state.isDarkMode;
        if (isClient) {
          localStorage.setItem('zenith_theme', nextDark ? 'dark' : 'light');
          if (nextDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        return { isDarkMode: nextDark };
      });
    }
  };
});
