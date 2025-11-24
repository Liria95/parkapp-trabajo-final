import { API_URLS } from '../config/api.config';

const API_URL = API_URLS.PARKING_SPACES;

export interface EspacioDisponible {
  id: string;
  numero: string;
  ubicacion: string;
  tarifaPorHora: number;
  latitude: number;
  longitude: number;
  status: string;
  distancia?: number;
}

export interface ParkingSpace {
  id: string;
  spaceCode: string;
  streetAddress: string;
  status: 'available' | 'occupied';
  feePerHour: number;
  latitude: number;
  longitude: number;
}

export interface SpacesStats {
  total: number;
  available: number;
  occupied: number;
}

export class ParkingSpacesService {
  
  /**
   * Obtener espacios disponibles para usuarios
   */
  static async getAvailableSpaces(
    authToken: string,
    location?: {
      latitude: number;
      longitude: number;
      radius?: number;
    }
  ): Promise<{
    success: boolean;
    espacios?: EspacioDisponible[];
    total?: number;
    message?: string;
  }> {
    try {
      console.log('Obteniendo espacios disponibles...');
      
      let url = `${API_URL}/available`;
      
      if (location) {
        const params = new URLSearchParams({
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          ...(location.radius && { radius: location.radius.toString() })
        });
        url += `?${params.toString()}`;
        console.log('Con filtro de ubicación:', location);
      }

      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Espacios obtenidos:', data.total);
        return {
          success: true,
          espacios: data.espacios,
          total: data.total
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener espacios',
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
   * Obtener estadísticas de espacios (solo admin)
   */
  static async getStats(
    authToken: string
  ): Promise<{
    success: boolean;
    stats?: SpacesStats;
    message?: string;
  }> {
    try {
      console.log('Obteniendo estadísticas de espacios...');

      const response = await fetch(`${API_URL}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Estadísticas obtenidas:', data.stats);
        return {
          success: true,
          stats: data.stats
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

  /**
   * Obtener todos los espacios (solo admin)
   */
  static async getAllSpaces(
    authToken: string
  ): Promise<{
    success: boolean;
    spaces?: ParkingSpace[];
    message?: string;
  }> {
    try {
      console.log('Obteniendo todos los espacios...');

      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Espacios obtenidos:', data.spaces?.length || 0);
        return {
          success: true,
          spaces: data.spaces,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener espacios',
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
   * Actualizar estado de un espacio (solo admin)
   */
  static async updateSpaceStatus(
    spaceId: string,
    status: 'available' | 'occupied' | 'maintenance' | 'reserved',
    authToken: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      console.log('Actualizando estado del espacio:', spaceId, 'a', status);

      const response = await fetch(`${API_URL}/${spaceId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Estado actualizado exitosamente');
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al actualizar estado',
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