// Si usas EMULADOR ANDROID:
//const API_URL = 'http://10.0.2.2:3000/api/auth';

// Si usas DISPOSITIVO FÍSICO o iOS:
const API_URL = 'http://192.168.1.5:3000/api/auth';

export interface User {
  id: number;
  name: string;        // ← Cambió
  surname: string;     // ← Nuevo
  email: string;
  phone: string;
  is_admin: boolean;
  balance: number;
  created_at: string;  // ← Agregado
}

export interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  isAdmin: boolean;
  message?: string;
}

export interface RegisterData {
  name: string;        // ← Cambió
  surname: string;     // ← Nuevo
  email: string;
  phone: string;
  password: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('🔵 Intentando login a:', `${API_URL}/login`); // ← Debug
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log('🔵 Response status:', response.status); // ← Debug
      
      const data = await response.json();
      
      console.log('🔵 Response data:', data); // ← Debug
      
      if (!response.ok || !data.success) {
        return { 
          success: false, 
          message: data.message || 'Error en login',
          isAdmin: false
        };
      }
      
      return {
        success: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        isAdmin: data.isAdmin,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error conectando al servidor:', error);
      return { 
        success: false, 
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
        isAdmin: false
      };
    }
  }

  static async register(data: RegisterData): Promise<LoginResult> {
    try {
      console.log('🔵 Intentando registro a:', `${API_URL}/register`); // ← Debug
      console.log('🔵 Datos:', data); // ← Debug
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      console.log('🔵 Response status:', response.status); // ← Debug
      
      const result = await response.json();
      
      console.log('🔵 Response data:', result); // ← Debug
      
      if (!response.ok || !result.success) {
        return { 
          success: false, 
          message: result.message || 'Error en registro',
          isAdmin: false
        };
      }
      
      return { 
        success: true, 
        message: result.message || 'Usuario registrado exitosamente',
        isAdmin: false
      };
    } catch (error) {
      console.error('❌ Error conectando al servidor:', error);
      return { 
        success: false, 
        message: 'No se pudo conectar al servidor. Verifica tu conexión.',
        isAdmin: false
      };
    }
  }
}