import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import * as authService from '../services/auth';
import type { RegisterData } from '../services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'CLEAR_USER':
      return { user: null, token: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: authService.getToken(),
    loading: true,
  });

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    authService
      .getProfile()
      .then((user) => dispatch({ type: 'SET_USER', payload: { user, token } }))
      .catch(() => {
        authService.clearAuth();
        dispatch({ type: 'CLEAR_USER' });
      });
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login({ email, password });
    authService.setAuth(token);
    dispatch({ type: 'SET_USER', payload: { user, token } });
  };

  const register = async (data: RegisterData) => {
    const { user, token } = await authService.register(data);
    authService.setAuth(token);
    dispatch({ type: 'SET_USER', payload: { user, token } });
  };

  const logout = () => {
    authService.clearAuth();
    dispatch({ type: 'CLEAR_USER' });
  };

  const refreshProfile = async () => {
    const user = await authService.getProfile();
    dispatch({ type: 'SET_USER', payload: { user, token: state.token! } });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
