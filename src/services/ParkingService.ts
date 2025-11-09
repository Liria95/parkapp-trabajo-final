 import { API_CONFIG } from '../config/api.config';

const API_URL = `${API_CONFIG.BASE_URL}/api/parking`;

export interface ParkingSpace {
  id: string;
  numero: string;
  ubicacion: string;
  tarifaPorHora: number;
}

export interface UserSearchResult {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  saldo: number;
}

export interface ParkingSession {
  id: string;
  licensePlate: string;
  spaceNumber: string;
  location: string;
  userName: string;
  startTime: string;
  rate: number;
  status: 'active' | 'completed';
}

export class ParkingService {
  /**
   * Obtener espacios disponibles
   */
  static async getAvailableSpaces(authToken: string): Promise<{
    success: boolean;
    spaces?: ParkingSpace[];
    message?: string;
  }> {
    try {
      console.log('Obteniendo espacios disponibles...');

      const response = await fetch(`${API_URL}/spaces/available`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Espacios disponibles:', data.spaces.length);
        return {
          success: true,
          spaces: data.spaces,
        };
      } else {
        console.error('Error al obtener espacios:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener espacios',
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
   * Buscar usuario
   */
  static async searchUser(query: string, authToken: string): Promise<{
    success: boolean;
    users?: UserSearchResult[];
    message?: string;
  }> {
    try {
      console.log('Buscando usuario:', query);

      const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Usuarios encontrados:', data.users.length);
        return {
          success: true,
          users: data.users,
        };
      } else {
        console.error('Error al buscar usuario:', data.message);
        return {
          success: false,
          message: data.message || 'Error al buscar usuario',
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
   * Registrar estacionamiento manual
   */
  static async registerManualParking(
    data: {
      licensePlate: string;
      spaceId: string;
      userId?: string;
      notifyUser: boolean;
      location: string;
    },
    authToken: string
  ): Promise<{ success: boolean; sessionId?: string; message?: string }> {
    try {
      console.log('Registrando estacionamiento manual...');

      const response = await fetch(`${API_URL}/sessions/manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        console.log('Estacionamiento registrado:', responseData.sessionId);
        return {
          success: true,
          sessionId: responseData.sessionId,
          message: responseData.message,
        };
      } else {
        console.error('Error al registrar:', responseData.message);
        return {
          success: false,
          message: responseData.message || 'Error al registrar estacionamiento',
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
   * Obtener sesiones activas
   */
  static async getActiveSessions(authToken: string): Promise<{
    success: boolean;
    sessions?: ParkingSession[];
    message?: string;
  }> {
    try {
      console.log('Obteniendo sesiones activas...');

      const response = await fetch(`${API_URL}/sessions/active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Sesiones activas:', data.sessions.length);
        return {
          success: true,
          sessions: data.sessions,
        };
      } else {
        console.error('Error al obtener sesiones:', data.message);
        return {
          success: false,
          message: data.message || 'Error al obtener sesiones',
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
   * Finalizar sesión
   */
  static async endSession(sessionId: string, authToken: string): Promise<{
    success: boolean;
    duration?: number;
    totalCost?: number;
    message?: string;
  }> {
    try {
      console.log('Finalizando sesión:', sessionId);

      const response = await fetch(`${API_URL}/sessions/${sessionId}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Sesión finalizada exitosamente');
        return {
          success: true,
          duration: data.duration,
          totalCost: data.totalCost,
          message: data.message,
        };
      } else {
        console.error('Error al finalizar sesión:', data.message);
        return {
          success: false,
          message: data.message || 'Error al finalizar sesión',
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