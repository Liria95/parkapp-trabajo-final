import { API_URLS } from '../config/api.config';

const API_URL = API_URLS.AUTH;

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

export interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  isAdmin?: boolean;
  message?: string;
}

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
}

export class AuthService {
  // LOGIN
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('Intentando login a:', `${API_URL}/login`);
      console.log('Email:', email);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      // Manejo de error del backend
      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Error al iniciar sesión',
          isAdmin: false,
        };
      }

      // Verificamos que el backend devuelva bien el usuario
      if (!data.user || !data.token) {
        return {
          success: false,
          message: 'Datos incompletos del servidor',
          isAdmin: false,
        };
      }

      // Mapear campos de Firebase
      const formattedUser: User = {
        id: data.user.id,
        name: data.user.name,
        surname: data.user.surname,
        email: data.user.email,
        phone: data.user.phone,
        isAdmin: data.user.isAdmin || false,
        balance: parseFloat(data.user.balance || 0),
        createdAt: data.user.createdAt,
        avatar: data.user.avatar || null,
      };

      return {
        success: true,
        user: formattedUser,
        token: data.token,
        refreshToken: data.refreshToken || data.token,
        isAdmin: formattedUser.isAdmin,
        message: data.message || 'Login exitoso',
      };
    } catch (error) {
      console.error('Error conectando al servidor:', error);
      return {
        success: false,
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
        isAdmin: false,
      };
    }
  }

  // REGISTER
  static async register(data: RegisterData): Promise<LoginResult> {
    try {
      console.log('Intentando registro a:', `${API_URL}/register`);
      console.log('Datos enviados:', data);

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result.message || 'Error en registro',
          isAdmin: false,
        };
      }

      return {
        success: true,
        message: result.message || 'Usuario registrado exitosamente',
        isAdmin: false,
      };
    } catch (error) {
      console.error('Error conectando al servidor:', error);
      return {
        success: false,
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
        isAdmin: false,
      };
    }
  }
}