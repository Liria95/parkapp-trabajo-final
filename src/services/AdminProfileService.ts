import { API_CONFIG } from '../config/api.config';

// Endpoint diferente para el perfil del admin
const API_URL = `${API_CONFIG.BASE_URL}/api/admin-profile`; 

// Interfaz para el perfil del administrador
export interface AdminProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  // Solo se incluyen los campos básicos necesarios para el formulario de edición
}

export class AdminProfileService {
  //Obtener datos del perfil del administrador

  static async getProfile(adminId: string, authToken: string): Promise<{
    success: boolean;
    user?: AdminProfile;
    message?: string;
  }> {
    try {
      console.log('Obteniendo perfil del administrador:', adminId);

      const response = await fetch(`${API_URL}/${adminId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          user: data.user as AdminProfile,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener perfil de administrador',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  //Actualizar datos del perfil del administrador

  static async updateProfile(
    adminId: string,
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
    user?: AdminProfile;
    message?: string;
  }> {
    try {
      console.log('Actualizando perfil del administrador:', adminId);

      const response = await fetch(`${API_URL}/${adminId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        return {
          success: true,
          user: responseData.user as AdminProfile,
          message: responseData.message,
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Error al actualizar perfil del administrador',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  //Eliminar cuenta del administrador
  static async deleteAccount(
    adminId: string,
    password: string,
    authToken: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      console.log('Eliminando cuenta del administrador:', adminId);

      const response = await fetch(`${API_URL}/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }), 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al eliminar cuenta del administrador',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }
}