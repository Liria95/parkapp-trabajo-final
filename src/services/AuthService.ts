// ✅ AuthService.ts
// Si usas EMULADOR ANDROID:
// const API_URL = 'http://10.0.2.2:3000/api/auth';

// Si usas DISPOSITIVO FÍSICO o iOS:
const API_URL = 'http://192.168.1.5:3000/api/auth';

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  is_admin: boolean;
  balance: number;
  created_at?: string;
  avatar?: string;
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
  // 🔹 LOGIN
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('🔵 Intentando login a:', `${API_URL}/login`);
      console.log('📩 Email:', email);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔵 Response status:', response.status);

      const data = await response.json();
      console.log('🔵 Response data:', data);

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

      const formattedUser: User = {
        id: data.user.id,
        name: data.user.name,
        surname: data.user.surname,
        email: data.user.email,
        phone: data.user.phone,
        is_admin: data.user.is_admin,
        balance: parseFloat(data.user.balance),
        created_at: data.user.created_at,
        avatar: data.user.avatar || null,
      };

      return {
        success: true,
        user: formattedUser,
        token: data.token,
        refreshToken: data.refreshToken || data.token,
        isAdmin: formattedUser.is_admin,
        message: data.message || 'Login exitoso',
      };
    } catch (error) {
      console.error('❌ Error conectando al servidor:', error);
      return {
        success: false,
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
        isAdmin: false,
      };
    }
  }

  // 🔹 REGISTER
  static async register(data: RegisterData): Promise<LoginResult> {
    try {
      console.log('🔵 Intentando registro a:', `${API_URL}/register`);
      console.log('📦 Datos enviados:', data);

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('🔵 Response status:', response.status);

      const result = await response.json();
      console.log('🔵 Response data:', result);

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
      console.error('❌ Error conectando al servidor:', error);
      return {
        success: false,
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
        isAdmin: false,
      };
    }
  }
}
