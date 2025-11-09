import { API_CONFIG } from '../config/api.config';

const API_URL = `${API_CONFIG.BASE_URL}/api/user-profile`;

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  avatar?: string;
  balance: number;
}

export class UserProfileService {
  /**
   * Obtener datos del perfil
   */
  static async getProfile(userId: string, authToken: string): Promise<{
    success: boolean;
    user?: UserProfile;
    message?: string;
  }> {
    try {
      console.log('Obteniendo perfil del usuario:', userId);

      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Perfil obtenido');
        return {
          success: true,
          user: data.user,
        };
      } else {
        console.error('Error al obtener perfil:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener perfil',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Actualizar datos del perfil
   */
  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      surname?: string;
      phone?: string;
      currentPassword?: string;
      newPassword?: string;
    },
    authToken: string
  ): Promise<{
    success: boolean;
    user?: UserProfile;
    message?: string;
  }> {
    try {
      console.log('Actualizando perfil del usuario:', userId);

      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        console.log('Perfil actualizado');
        return {
          success: true,
          user: responseData.user,
          message: responseData.message,
        };
      } else {
        console.error('Error al actualizar perfil:', responseData.message);
        return {
          success: false,
          message: responseData.message || 'Error al actualizar perfil',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  /**
   * Eliminar cuenta
   */
  static async deleteAccount(
    userId: string,
    password: string,
    authToken: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      console.log('Eliminando cuenta del usuario:', userId);

      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Cuenta eliminada');
        return {
          success: true,
          message: data.message,
        };
      } else {
        console.error('Error al eliminar cuenta:', data.message);
        return {
          success: false,
          message: data.message || 'Error al eliminar cuenta',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }
}