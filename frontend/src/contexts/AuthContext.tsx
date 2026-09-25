import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const savedToken = localStorage.getItem('token');
let savedUser: User | null = null;
try {
  const u = localStorage.getItem('user');
  if (u) savedUser = JSON.parse(u);
} catch {
  savedUser = null;
}

const initialState: AuthState = {
  user: savedUser,
  token: savedToken,
  loading: !!savedToken && !savedUser,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.me()
        .then(res => {
          localStorage.setItem('user', JSON.stringify(res.data));
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data, token } });
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authApi.login(email.trim(), password);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return user;
    } catch (err: any) {
      let msg = 'Something went wrong. Please try again.';
      if (!err.response) {
        msg = 'Unable to connect to InnovateIQ.';
      } else if (err.response.status === 401) {
        msg = 'Incorrect email or password.';
      } else if (err.response.status === 400) {
        msg = err.response.data?.message || 'Please enter your email and password.';
      } else if (err.response.status >= 500) {
        msg = 'Something went wrong. Please try again.';
      }
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (data: Partial<User>) => {
    if (state.user) {
      const updated = { ...state.user, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
    }
    dispatch({ type: 'UPDATE_USER', payload: data });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
