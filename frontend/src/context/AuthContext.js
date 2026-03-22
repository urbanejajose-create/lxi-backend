import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('lxi_token');
    const storedUser = localStorage.getItem('lxi_user');

    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const restoreSession = async () => {
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (parsedUser) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              token,
              user: parsedUser,
            },
          });
        }

        const response = await authService.getCurrentUser();
        const freshUser = response.data;

        localStorage.setItem('lxi_user', JSON.stringify(freshUser));
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            token,
            user: freshUser,
          },
        });
      } catch (error) {
        localStorage.removeItem('lxi_token');
        localStorage.removeItem('lxi_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreSession();
  }, []);

  const register = async (registerData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.register(registerData);
      const { access_token, user } = response.data;

      localStorage.setItem('lxi_token', access_token);
      localStorage.setItem('lxi_user', JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          token: access_token,
          user,
        },
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Registration failed';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.login({ email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('lxi_token', access_token);
      localStorage.setItem('lxi_user', JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          token: access_token,
          user,
        },
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Login failed';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('lxi_token');
    localStorage.removeItem('lxi_user');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
