import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

// TIPOS
export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  balance: number;
  createdAt?: string;
  avatar?: string | null;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

export interface AuthAction {
  type: string;
  payload?: any;
}

// ACCIONES
export const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  RESTORE_SESSION: 'RESTORE_SESSION',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
};

// ESTADO INICIAL
const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
};

// REDUCER
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('===== AUTH REDUCER =====');
  console.log('Action:', action.type);
  
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      console.log('LOGIN');
      console.log('Usuario:', action.payload.user?.name);
      console.log('isAdmin:', action.payload.user?.isAdmin);
      
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || action.payload.token,
      };

    case AUTH_ACTIONS.SET_USER:
      console.log('SET_USER');
      return {
        ...state,
        isLoading: false,
        isAuthenticated: !!action.payload.user,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };

    case AUTH_ACTIONS.LOGOUT:
      console.log('LOGOUT');
      SecureStore.deleteItemAsync('authToken').catch(() => {});
      SecureStore.deleteItemAsync('refreshToken').catch(() => {});
      SecureStore.deleteItemAsync('userData').catch(() => {});
      
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      console.log('UPDATE_USER');
      return {
        ...state,
        user: action.payload.user,
      };

    default:
      return state;
  }
};

// CONTEXT
interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}

export const AuthContext = createContext<AuthContextType>({
  state: initialState,
  dispatch: () => {},
});

// PROVIDER
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar sesión
  useEffect(() => {
    const restoreSession = async () => {
      console.log('Restaurando sesión...');
      
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const userDataString = await SecureStore.getItemAsync('userData');

        if (token && userDataString) {
          const userData = JSON.parse(userDataString);
          console.log('Sesión encontrada:', userData.name);
          console.log('isAdmin:', userData.isAdmin);

          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: {
              user: userData,
              token,
              refreshToken,
            },
          });
        } else {
          console.log('No hay sesión');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    restoreSession();
  }, []);

  // Guardar sesión
  useEffect(() => {
    const saveSession = async () => {
      if (state.isAuthenticated && state.user && state.token) {
        try {
          const userDataToSave = {
            id: state.user.id,
            name: state.user.name,
            surname: state.user.surname,
            email: state.user.email,
            phone: state.user.phone,
            isAdmin: state.user.isAdmin,
            balance: state.user.balance,
            avatar: state.user.avatar,
          };

          await SecureStore.setItemAsync('authToken', state.token);
          await SecureStore.setItemAsync('userData', JSON.stringify(userDataToSave));
          
          if (state.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', state.refreshToken);
          }
          
          console.log('Sesión guardada');
        } catch (error) {
          console.error('Error al guardar:', error);
        }
      }
    };

    saveSession();
  }, [state.isAuthenticated, state.user, state.token, state.refreshToken]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;