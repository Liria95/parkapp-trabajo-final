import { API_URLS } from '../config/api.config';

const API_URL = API_URLS.PARKING_SESSIONS;

export interface ParkingSession {
  id: string;
  spaceCode: string;
  streetAddress: string;
  licensePlate: string;
  feePerHour: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  amount?: number;
  status: 'active' | 'completed';
  elapsedMinutes?: number;
}

export interface ActiveSessionResponse {
  hasActiveSession: boolean;
  session: ParkingSession | null;
}

export interface SessionStats {
  occupied: number;
  available: number;
  total: number;
  occupancyRate: string;
}

export interface ActiveSessionDetail {
  id: string;
  licensePlate: string;
  spaceCode: string;
  streetAddress: string;
  startTime: string;
  feePerHour: number;
  userId: string;
  isVisitor: boolean;
}

export class ParkingSessionService {
  /**
   * Iniciar sesión de estacionamiento
   */
  static async startSession(
    data: {
      parkingSpaceId: string;
      licensePlate: string;
    },
    authToken: string
  ): Promise<{
    success: boolean;
    sessionId?: string;
    spaceCode?: string;
    streetAddress?: string;
    feePerHour?: number;
    message?: string;
  }> {
    try {
      console.log('Iniciando sesión de estacionamiento...');
      console.log('Datos:', JSON.stringify(data, null, 2));

      const response = await fetch(`${API_URL}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Respuesta:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.success) {
        console.log('Sesión iniciada exitosamente');
        return {
          success: true,
          sessionId: responseData.sessionId,
          spaceCode: responseData.spaceCode,
          streetAddress: responseData.streetAddress,
          feePerHour: responseData.feePerHour,
          message: responseData.message,
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Error al iniciar sesión',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  /**
   * Finalizar sesión de estacionamiento
   */
  static async endSession(
    sessionId: string,
    authToken: string
  ): Promise<{
    success: boolean;
    duration?: number;
    totalCost?: number;
    newBalance?: number;
    fineCreated?: boolean;
    currentBalance?: number;
    message?: string;
  }> {
    try {
      console.log('Finalizando sesión:', sessionId);

      const response = await fetch(`${API_URL}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      console.log('Respuesta:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        console.log('Sesión finalizada exitosamente');
        return {
          success: true,
          duration: data.duration,
          totalCost: data.totalCost,
          newBalance: data.newBalance,
          fineCreated: data.fineCreated,
          currentBalance: data.currentBalance,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al finalizar sesión',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  /**
   * Obtener sesión activa del usuario
   */
  static async getActiveSession(
    authToken: string
  ): Promise<{
    success: boolean;
    data?: ActiveSessionResponse;
    message?: string;
  }> {
    try {
      console.log('Obteniendo sesión activa...');

      const response = await fetch(`${API_URL}/active`, {
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
          data: {
            hasActiveSession: data.hasActiveSession,
            session: data.session,
          },
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener sesión activa',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  /**
   * Obtener historial de sesiones
   */
  static async getHistory(
    authToken: string
  ): Promise<{
    success: boolean;
    sessions?: ParkingSession[];
    total?: number;
    message?: string;
  }> {
    try {
      console.log('Obteniendo historial de sesiones...');

      const response = await fetch(`${API_URL}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Historial obtenido:', data.total, 'sesiones');
        return {
          success: true,
          sessions: data.sessions,
          total: data.total,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener historial',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  /**
   * Obtener estadísticas de ocupación
   */
  static async getStats(
    authToken: string
  ): Promise<{
    success: boolean;
    stats?: SessionStats;
    activeSessions?: ActiveSessionDetail[];
    timestamp?: string;
    message?: string;
  }> {
    try {
      console.log('Obteniendo estadísticas...');

      const response = await fetch(`${API_URL}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Estadísticas obtenidas');
        return {
          success: true,
          stats: data.stats,
          activeSessions: data.activeSessions,
          timestamp: data.timestamp,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener estadísticas',
        };
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }
}